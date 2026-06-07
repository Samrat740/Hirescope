import requests
import json
import re
from datetime import datetime
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from users.auth_utils import get_user_from_request
from users.models import User
from chat.models import Job, Application, Result
from mongoengine.errors import DoesNotExist

# ✅ LIST APPLICATIONS FOR A SPECIFIC JOB
@api_view(["GET"])
def list_job_applications(request):
    user = get_user_from_request(request)
    if not user or user.role != "hr":
        return Response({"error": "Unauthorized"}, status=403)
        
    job_id = request.query_params.get("job_id")
    if not job_id:
        return Response({"error": "Job ID (job_id) is required"}, status=400)
        
    job = Job.objects(id=job_id).first()
    if not job:
        return Response({"error": "Job not found"}, status=404)
        
    # Check for expired/unattempted interviews
    now = datetime.utcnow()
    if job.last_date and job.last_date < now:
        Application.objects(job=job, status="interview_scheduled").update(set__status="rejected", set__reason="Interview unattempted")
    Application.objects(job=job, status="interview_scheduled", interview_end__lt=now).update(set__status="rejected", set__reason="Interview unattempted")
        
    apps = Application.objects(job=job).order_by("-created_at")
    data = []
    for app in apps:
        try:
            cand = app.candidate
            if not cand:
                continue
        except DoesNotExist:
            continue
        # Find evaluation result linked to the chat session of this application
        res = None
        if app.chat:
            res = Result.objects(chat=app.chat).first()
            
        res_data = None
        if res:
            res_data = {
                "clarity": res.clarity,
                "warmth": res.warmth,
                "patience": res.patience,
                "simplicity": res.simplicity,
                "fluency": res.fluency,
                "verdict": res.verdict,
                "result": res.result,
                "chat_id": str(res.chat.id) if res.chat else None
            }
            
        data.append({
            "id": str(app.id),
            "candidate_id": str(cand.id),
            "name": cand.name,
            "email": cand.email,
            "contact": cand.contact,
            "education": cand.education,
            "cgpa": cand.cgpa,
            "resume_url": cand.resume_url,
            "skills": cand.skills,
            "projects": cand.projects,
            "experience": cand.experience,
            "status": app.status,
            "reason": app.reason if hasattr(app, "reason") else "",
            "interview_start": (app.interview_start.isoformat() if app.interview_start.tzinfo else app.interview_start.isoformat() + "Z") if hasattr(app, "interview_start") and app.interview_start else None,
            "interview_end": (app.interview_end.isoformat() if app.interview_end.tzinfo else app.interview_end.isoformat() + "Z") if hasattr(app, "interview_end") and app.interview_end else None,
            "evaluation": res_data
        })
    return Response(data)

# ✅ RUN AI SCREENING/SHORTLISTING ON APPLICANTS FOR A SPECIFIC JOB
@api_view(["POST"])
def ai_shortlist(request):
    user = get_user_from_request(request)
    if not user or user.role != "hr":
        return Response({"error": "Unauthorized"}, status=403)
        
    job_id = request.data.get("job_id")
    count = request.data.get("count", 1)
    
    try:
        count = int(count)
    except ValueError:
        return Response({"error": "Invalid shortlist count"}, status=400)
        
    if not job_id:
        return Response({"error": "Job ID (job_id) is required"}, status=400)
        
    job = Job.objects(id=job_id).first()
    if not job:
        return Response({"error": "Job not found"}, status=404)
        
    # Get applications for this job in "applied" status
    apps = Application.objects(job=job, status="applied")
    if not apps:
        return Response({"message": "No candidates with 'applied' status found for this job.", "recommendations": []})
        
    # Format candidates list
    candidates_info = ""
    for i, app in enumerate(apps):
        try:
            cand = app.candidate
            if not cand:
                continue
        except DoesNotExist:
            continue
        candidates_info += f"Candidate #{i+1}:\n"
        candidates_info += f"- Name: {cand.name}\n"
        candidates_info += f"- Email: {cand.email}\n"
        candidates_info += f"- Education: {cand.education}\n"
        candidates_info += f"- CGPA: {cand.cgpa}\n"
        candidates_info += f"- Skills: {', '.join(cand.skills)}\n"
        candidates_info += f"- Projects: {'; '.join(cand.projects)}\n"
        candidates_info += f"- Experience: {'; '.join(cand.experience)}\n\n"
        
    url = "https://router.huggingface.co/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.HF_API_KEY}",
        "Content-Type": "application/json"
    }
    
    system_prompt = f"""
You are an AI recruitment assistant. Your task is to evaluate the provided candidate list against the job requirements and select exactly the top {count} candidates who are the best fit.

Your output MUST be a valid JSON array of strings containing the emails of the selected candidates. For example:
[
  "selected_candidate1@email.com",
  "selected_candidate2@email.com"
]

Do NOT include any preamble, explanations, or wrap it in anything other than raw valid JSON.
"""

    job_criteria = f"Job Title: {job.title}\n"
    job_criteria += f"Job Description:\n{job.description}\n"
    if job.education:
        job_criteria += f"Required Education: {job.education}\n"
    if job.location:
        job_criteria += f"Location: {job.location}\n"
    if job.job_type:
        job_criteria += f"Job Type: {job.job_type}\n"
    if job.experience_level:
        job_criteria += f"Experience Level: {job.experience_level}\n"
    if job.domain:
        job_criteria += f"Job Domain: {job.domain}\n"
    if job.skills:
        job_criteria += f"Required Skills: {job.skills}\n"

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Job Requirements:\n{job_criteria}\n\nCandidate List:\n{candidates_info}"}
    ]
    
    payload = {
        "model": "meta-llama/Meta-Llama-3-8B-Instruct",
        "messages": messages,
        "max_tokens": 1000,
        "temperature": 0.2
    }
    
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code != 200:
        return Response({"error": "Failed to call Hugging Face API"}, status=500)
        
    try:
        content = response.json()["choices"][0]["message"]["content"].strip()
        if content.startswith("```"):
            content = re.sub(r"^```(?:json)?\n", "", content)
            content = re.sub(r"\n```$", "", content)
            content = content.strip()
            
        selected_emails = json.loads(content)
        if not isinstance(selected_emails, list):
            match = re.search(r"\[.*\]", content, re.DOTALL)
            if match:
                selected_emails = json.loads(match.group(0))
            else:
                selected_emails = []
    except Exception as e:
        print("Shortlist parsing error:", e)
        try:
            match = re.search(r"\[.*\]", content, re.DOTALL)
            if match:
                selected_emails = json.loads(match.group(0))
            else:
                selected_emails = []
        except:
            selected_emails = []
            
    # Filter candidates by selected emails
    recommended_candidates = []
    for app in apps:
        try:
            cand = app.candidate
            if not cand:
                continue
        except DoesNotExist:
            continue
        if cand.email in selected_emails:
            recommended_candidates.append({
                "id": str(app.id),
                "name": cand.name,
                "email": cand.email,
                "contact": cand.contact,
                "education": cand.education,
                "cgpa": cand.cgpa,
                "resume_url": cand.resume_url,
                "skills": cand.skills,
                "projects": cand.projects,
                "experience": cand.experience,
                "status": app.status
            })
            
    return Response({
        "job_title": job.title,
        "count": count,
        "recommendations": recommended_candidates
    })

# ✅ CONFIRM SHORTLIST FOR A SPECIFIC JOB
@api_view(["POST"])
def confirm_shortlist(request):
    user = get_user_from_request(request)
    if not user or user.role != "hr":
        return Response({"error": "Unauthorized"}, status=403)
        
    job_id = request.data.get("job_id")
    emails = request.data.get("emails", [])
    
    if not job_id or not emails:
        return Response({"error": "Job ID (job_id) and candidate emails list are required"}, status=400)
        
    job = Job.objects(id=job_id).first()
    if not job:
        return Response({"error": "Job not found"}, status=404)
        
    # Find candidates by emails
    candidates = User.objects(role="candidate", email__in=emails)
    updated_count = Application.objects(job=job, candidate__in=candidates, status="applied").update(set__status="shortlisted", set__reason="")
    
    # Those not shortlisted get rejected
    Application.objects(job=job, candidate__not__in=candidates, status="applied").update(set__status="rejected", set__reason="Profile not shortlisted")
    
    return Response({"message": f"Successfully shortlisted {updated_count} candidates and rejected non-shortlisted ones."})

# ✅ SCHEDULE AI INTERVIEW FOR A SPECIFIC JOB
@api_view(["POST"])
def schedule_interview(request):
    user = get_user_from_request(request)
    if not user or user.role != "hr":
        return Response({"error": "Unauthorized"}, status=403)
        
    job_id = request.data.get("job_id")
    emails = request.data.get("emails", [])
    interview_start_str = request.data.get("interview_start")
    interview_end_str = request.data.get("interview_end")
    
    if not job_id:
        return Response({"error": "Job ID (job_id) is required"}, status=400)
        
    job = Job.objects(id=job_id).first()
    if not job:
        return Response({"error": "Job not found"}, status=404)
        
    from django.utils.dateparse import parse_datetime
    
    interview_start = None
    if interview_start_str:
        interview_start = parse_datetime(interview_start_str)
        if not interview_start:
            return Response({"error": "Invalid interview_start format"}, status=400)
        
        from django.utils import timezone
        from datetime import datetime
        if interview_start.tzinfo is None:
            if interview_start < datetime.utcnow():
                return Response({"error": "Start date & time cannot be in the past."}, status=400)
        else:
            if interview_start < timezone.now():
                return Response({"error": "Start date & time cannot be in the past."}, status=400)
            
    interview_end = None
    if interview_end_str:
        interview_end = parse_datetime(interview_end_str)
        if not interview_end:
            return Response({"error": "Invalid interview_end format"}, status=400)
            
    if not emails:
        # Schedule in bulk for all shortlisted candidates
        shortlisted_apps = Application.objects(job=job, status="shortlisted")
        candidates = [app.candidate for app in shortlisted_apps]
    else:
        # Schedule for specified candidates
        candidates = User.objects(role="candidate", email__in=emails)
        
    if not candidates:
        return Response({"error": "No shortlisted candidates found to schedule"}, status=400)
        
    updated_count = 0
    for cand in candidates:
      app = Application.objects(job=job, candidate=cand, status__in=["shortlisted", "interview_scheduled"]).first()
      if app:
            app.status = "interview_scheduled"
            app.reason = ""
            app.interview_start = interview_start
            app.interview_end = interview_end
            app.save()
            updated_count += 1
            
    return Response({"message": f"Successfully scheduled interviews for {updated_count} candidates."})


# ✅ CANCEL AI INTERVIEW FOR A SPECIFIC CANDIDATE OR ALL CANDIDATES IN BULK
@api_view(["POST"])
def cancel_interview(request):
    user = get_user_from_request(request)
    if not user or user.role != "hr":
        return Response({"error": "Unauthorized"}, status=403)
        
    job_id = request.data.get("job_id")
    email = request.data.get("email")
    app_id = request.data.get("application_id")
    cancel_all = request.data.get("cancel_all", False)
    
    if cancel_all:
        if not job_id:
            return Response({"error": "Job ID (job_id) is required for bulk cancellation"}, status=400)
        job = Job.objects(id=job_id).first()
        if not job:
            return Response({"error": "Job not found"}, status=404)
        apps = Application.objects(job=job, status="interview_scheduled")
        count = apps.count()
        apps.update(set__status="shortlisted", set__interview_start=None, set__interview_end=None, set__reason="")
        return Response({"message": f"Successfully cancelled scheduled interviews for {count} candidates."})
        
    app = None
    if app_id:
        app = Application.objects(id=app_id).first()
    elif job_id and email:
        job = Job.objects(id=job_id).first()
        cand = User.objects(role="candidate", email=email).first()
        if job and cand:
            app = Application.objects(job=job, candidate=cand).first()
            
    if not app:
        return Response({"error": "Application not found"}, status=404)
        
    if app.status != "interview_scheduled":
        return Response({"error": "No active interview scheduled to cancel"}, status=400)
        
    # Reset to shortlisted (last status before scheduling)
    app.status = "shortlisted"
    app.interview_start = None
    app.interview_end = None
    app.reason = ""
    app.save()
    
    return Response({"message": "Interview cancelled successfully and reset to shortlisted."})

