from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime
from users.auth_utils import get_user_from_request
from users.models import User
from chat.models import Job, Application, Result, ChatSession, Message

# ✅ LIST ALL JOBS
@api_view(["GET"])
def list_jobs(request):
    jobs = Job.objects().order_by("-created_at")
    data = [
        {
            "id": str(job.id),
            "title": job.title,
            "description": job.description,
            "education": job.education,
            "location": job.location,
            "job_type": job.job_type,
            "experience_level": job.experience_level,
            "domain": job.domain,
            "skills": job.skills,
            "last_date": job.last_date.strftime("%Y-%m-%d") if job.last_date else None,
            "created_at": job.created_at
        }
        for job in jobs
    ]
    return Response(data)

# ✅ CREATE JOB (HR only)
@api_view(["POST"])
def create_job(request):
    user = get_user_from_request(request)
    if not user or user.role != "hr":
        return Response({"error": "Unauthorized. Only HR can post jobs."}, status=status.HTTP_403_FORBIDDEN)
        
    title = request.data.get("title")
    description = request.data.get("description")
    education = request.data.get("education")
    location = request.data.get("location")
    job_type = request.data.get("job_type")
    experience_level = request.data.get("experience_level")
    domain = request.data.get("domain")
    skills = request.data.get("skills")
    last_date_str = request.data.get("last_date")
    
    if not title or not description:
        return Response({"error": "Title and description are required"}, status=status.HTTP_400_BAD_REQUEST)
        
    last_date = None
    if last_date_str:
        try:
            last_date = datetime.strptime(last_date_str, "%Y-%m-%d")
        except ValueError:
            pass

    job = Job(
        title=title, 
        description=description,
        education=education,
        location=location,
        job_type=job_type,
        experience_level=experience_level,
        domain=domain,
        skills=skills,
        last_date=last_date
    )
    job.save()
    
    return Response({
        "message": "Job posted successfully",
        "job": {
            "id": str(job.id),
            "title": job.title,
            "description": job.description,
            "education": job.education,
            "location": job.location,
            "job_type": job.job_type,
            "experience_level": job.experience_level,
            "domain": job.domain,
            "skills": job.skills,
            "last_date": job.last_date.strftime("%Y-%m-%d") if job.last_date else None,
            "created_at": job.created_at
        }
    })

# ✅ APPLY FOR A JOB (Candidate only)
@api_view(["POST"])
def apply_job(request):
    user = get_user_from_request(request)
    if not user or user.role != "candidate":
        return Response({"error": "Unauthorized. Only candidates can apply for jobs."}, status=status.HTTP_403_FORBIDDEN)
        
    # Check if profile is complete
    if not user.contact or not user.education or not user.cgpa:
        return Response({"error": "Please complete your profile in the Profile tab before applying for jobs."}, status=status.HTTP_400_BAD_REQUEST)
        
    job_id = request.data.get("job_id")
    if not job_id:
        return Response({"error": "Job ID (job_id) is required"}, status=status.HTTP_400_BAD_REQUEST)
        
    job = Job.objects(id=job_id).first()
    if not job:
        return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)
        
    # Check if candidate has already applied to this job
    existing_app = Application.objects(candidate=user, job=job).first()
    if existing_app:
        return Response({"error": "You have already applied for this job."}, status=status.HTTP_400_BAD_REQUEST)
        
    app = Application(
        candidate=user,
        job=job,
        status="applied"
    )
    app.save()
    
    return Response({
        "message": "Successfully applied for the job!",
        "application": {
            "id": str(app.id),
            "job_title": job.title,
            "status": app.status,
            "created_at": app.created_at
        }
    })

# ✅ LIST CANDIDATE'S OWN APPLICATIONS
@api_view(["GET"])
def my_applications(request):
    user = get_user_from_request(request)
    if not user or user.role != "candidate":
        return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
    apps = Application.objects(candidate=user).order_by("-created_at")
    
    # Expiration check
    now = datetime.utcnow()
    for app in apps:
        if app.status == "interview_scheduled":
            is_expired = False
            if app.job.last_date and app.job.last_date < now:
                is_expired = True
            elif hasattr(app, "interview_end") and app.interview_end and app.interview_end < now:
                is_expired = True
                
            if is_expired:
                app.status = "rejected"
                app.reason = "Interview unattempted"
                app.save()
            
    data = []
    for app in apps:
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
            "job_id": str(app.job.id),
            "job_title": app.job.title,
            "job_description": app.job.description,
            "status": app.status,
            "reason": app.reason if hasattr(app, "reason") else "",
            "interview_start": (app.interview_start.isoformat() if app.interview_start.tzinfo else app.interview_start.isoformat() + "Z") if hasattr(app, "interview_start") and app.interview_start else None,
            "interview_end": (app.interview_end.isoformat() if app.interview_end.tzinfo else app.interview_end.isoformat() + "Z") if hasattr(app, "interview_end") and app.interview_end else None,
            "created_at": app.created_at,
            "chat_id": str(app.chat.id) if app.chat else None,
            "evaluation": res_data
        })
    return Response(data)

# ✅ DELETE A JOB POSTING (HR only)
@api_view(["DELETE"])
def delete_job(request, job_id):
    user = get_user_from_request(request)
    if not user or user.role != "hr":
        return Response({"error": "Unauthorized. Only HR can delete jobs."}, status=status.HTTP_403_FORBIDDEN)
        
    job = Job.objects(id=job_id).first()
    if not job:
        return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)
        
    # Find and delete all applications for this job, along with their chats and results
    apps = Application.objects(job=job)
    for app in apps:
        if app.chat:
            Message.objects(chat=app.chat).delete()
            Result.objects(chat=app.chat).delete()
            app.chat.delete()
        app.delete()
        
    # Finally delete the job
    job.delete()
    
    return Response({"message": "Job and all associated applications deleted successfully."})
