from rest_framework.decorators import api_view
from rest_framework.response import Response
from users.auth_utils import get_user_from_request
from .models import ChatSession, Message, Result, Application
from datetime import datetime
from bson import ObjectId
from chat.gemini_service import generate_ai_response, generate_evaluation
import re


# 🔥 Parse evaluation into structured fields
def parse_evaluation(text):
    # Strip asterisks to avoid markdown bolding issues
    clean_text = text.replace("*", "")

    def extract_score(label):
        match = re.search(rf"{label}:\s*(\d+)", clean_text)
        return int(match.group(1)) if match else None

    verdict_match = re.search(r"Verdict:\s*(\w+)", clean_text)

    return {
        "clarity": extract_score("Clarity"),
        "warmth": extract_score("Warmth"),
        "patience": extract_score("Patience"),
        "simplicity": extract_score("Simplicity"),
        "fluency": extract_score("Fluency"),
        "verdict": verdict_match.group(1) if verdict_match else None
    }


@api_view(["POST"])
def send_message(request):
    user = get_user_from_request(request)

    if not user:
        return Response({"error": "Unauthorized"}, status=401)

    if user.role != "candidate":
        return Response({"error": "Only candidates can take the AI interview"}, status=403)

    message_text = request.data.get("message")
    chat_id = request.data.get("chat_id")
    app_id = request.data.get("app_id")
    is_practice = request.data.get("is_practice", False)
    job_role = request.data.get("job_role")

    if not message_text:
        return Response({"error": "Message is required"}, status=400)

    # 🔹 Validate format of IDs if provided
    if chat_id and not ObjectId.is_valid(chat_id):
        return Response({"error": "Invalid chat_id format"}, status=400)
    if app_id and not ObjectId.is_valid(app_id):
        return Response({"error": "Invalid app_id format"}, status=400)

    try:
        # 🔹 Get or create chat associated with the application or practice session
        if chat_id:
            chat = ChatSession.objects(id=chat_id, user=user).first()
            if not chat:
                return Response({"error": "Chat not found"}, status=404)
            
            # Verify the application associated with this chat (unless practice)
            if not chat.is_practice:
                app = Application.objects(chat=chat, candidate=user).first()
                if not app:
                    return Response({"error": "Application not found for this session"}, status=404)
                if app.status != "interview_scheduled":
                    return Response({"error": "Interview is not scheduled or active for this application"}, status=403)
            else:
                app = None
        else:
            if is_practice:
                app = None
                chat = ChatSession(
                    user=user,
                    title=f"Practice: {job_role or 'General Role'}",
                    is_practice=True,
                    practice_job_role=job_role or "General Role"
                )
                chat.save()
            else:
                # First message of real application: app_id is required
                if not app_id:
                    return Response({"error": "Application ID (app_id) is required to start the interview"}, status=400)
                    
                app = Application.objects(id=app_id, candidate=user).first()
                if not app:
                    return Response({"error": "Application not found"}, status=404)
                if app.status != "interview_scheduled":
                    return Response({"error": "Interview is not scheduled or active for this application"}, status=403)

                chat = ChatSession(
                    user=user,
                    title=message_text[:30]
                )
                chat.save()
                app.chat = chat
                app.save()
    except Exception as e:
        return Response({"error": f"Database query error: {str(e)}"}, status=400)

    # 🔥 OPTIONAL (recommended): stop further interaction if result already exists
    existing_result = Result.objects(chat=chat).first()
    if existing_result:
        return Response({
            "chat_id": str(chat.id),
            "reply": "Interview already completed."
        })

    # 🔹 Save user message
    Message(
        chat=chat,
        role="user",
        content=message_text
    ).save()

    # 🔥 Fetch full conversation
    previous_messages = Message.objects(chat=chat).order_by("created_at")

    conversation_history = [
        {"role": msg.role, "content": msg.content}
        for msg in previous_messages
    ]

    # ✅ Count assistant messages
    assistant_count = Message.objects(chat=chat, role="assistant").count()

    # Get job title and description dynamically
    if chat.is_practice:
        job_title = chat.practice_job_role
        job_description = f"Practice interview for the role of {chat.practice_job_role} matching candidate profile."
    else:
        job_title = app.job.title if (app and app.job) else "General Role"
        job_description = app.job.description if (app and app.job) else "General candidate screening"

    # Get candidate profile details
    candidate_skills = ", ".join(user.skills) if user.skills else None
    candidate_projects = "; ".join(user.projects) if user.projects else None
    candidate_experience = "; ".join(user.experience) if user.experience else None

    try:
        if assistant_count < 5:
            ai_response = generate_ai_response(
                conversation_history, 
                job_title=job_title, 
                job_description=job_description,
                candidate_skills=candidate_skills,
                candidate_projects=candidate_projects,
                candidate_experience=candidate_experience
            )

        else:
            ai_response = generate_evaluation(
                conversation_history, 
                job_title=job_title, 
                job_description=job_description,
                candidate_skills=candidate_skills,
                candidate_projects=candidate_projects,
                candidate_experience=candidate_experience
            )

            parsed = parse_evaluation(ai_response)

            if not parsed["verdict"]:
            # 🔁 retry once
                ai_response = generate_evaluation(
                    conversation_history, 
                    job_title=job_title, 
                    job_description=job_description,
                    candidate_skills=candidate_skills,
                    candidate_projects=candidate_projects,
                    candidate_experience=candidate_experience
                )
                parsed = parse_evaluation(ai_response)

                # ❌ still failed
                if not parsed["verdict"]:
                    return Response({
                        "chat_id": str(chat.id),
                        "reply": "Evaluation failed. Please try again."
                    })

            Result(
                user=user,
                chat=chat,
                is_practice=chat.is_practice,
                practice_job_role=chat.practice_job_role,
                result=ai_response,
                clarity=parsed["clarity"],
                warmth=parsed["warmth"],
                patience=parsed["patience"],
                simplicity=parsed["simplicity"],
                fluency=parsed["fluency"],
                verdict=parsed["verdict"]
            ).save()
            
            # Update Application status to interview_cleared or rejected based on verdict (only if not practice!)
            if not chat.is_practice:
                app = Application.objects(chat=chat).first()
                if app:
                    is_accept = parsed.get("verdict") and any(
                        kw in parsed["verdict"].upper() for kw in ["SELECT", "ACCEPT", "PASS", "HIRE", "SHORTLIST"]
                    )
                    if is_accept:
                        app.status = "interview_cleared"
                        app.reason = "Interview cleared"
                    else:
                        app.status = "rejected"
                        app.reason = "Interview not cleared"
                    app.save()

        if isinstance(ai_response, dict) and "error" in ai_response:
            return Response(ai_response, status=500)

        ai_response_text = ai_response

    except Exception as e:
        return Response({"error": str(e)}, status=500)

    # 🔹 Save assistant reply
    Message(
        chat=chat,
        role="assistant",
        content=ai_response_text
    ).save()

    return Response({
        "chat_id": str(chat.id),
        "reply": ai_response_text
    })


@api_view(["GET"])
def get_chat_history(request, chat_id):
    user = get_user_from_request(request)

    if not user:
        return Response({"error": "Unauthorized"}, status=401)

    if not ObjectId.is_valid(chat_id):
        return Response({"error": "Invalid chat_id format"}, status=400)

    if user.role == "hr":
        chat = ChatSession.objects(id=ObjectId(chat_id)).first()
    else:
        chat = ChatSession.objects(id=ObjectId(chat_id), user=user).first()

    if not chat:
        return Response({"error": "Chat not found"}, status=404)

    messages = Message.objects(chat=chat).order_by("created_at")

    data = [
        {
            "role": msg.role,
            "content": msg.content
        }
        for msg in messages
    ]

    return Response({
        "chat_id": str(chat.id),
        "messages": data
    })


@api_view(["GET"])
def list_user_chats(request):
    user = get_user_from_request(request)

    if not user:
        return Response({"error": "Unauthorized"}, status=401)

    chats = ChatSession.objects(user=user).order_by("-created_at")

    data = [
        {
            "chat_id": str(chat.id),
            "title": chat.title,
            "created_at": chat.created_at
        }
        for chat in chats
    ]

    return Response(data)


@api_view(["DELETE"])
def delete_chat(request, chat_id):
    user = get_user_from_request(request)

    if not user:
        return Response({"error": "Unauthorized"}, status=401)

    chat = ChatSession.objects(id=chat_id, user=user).first()

    if not chat:
        return Response({"error": "Chat not found"}, status=404)

    Message.objects(chat=chat).delete()
    chat.delete()

    return Response({"message": "Chat deleted successfully"})


# 🔥 NEW: Fetch results for logged-in user
@api_view(["GET"])
def get_results(request):
    user = get_user_from_request(request)

    if not user:
        return Response({"error": "Unauthorized"}, status=401)

    results = Result.objects(user=user).order_by("-created_at")

    data = [
        {
            "result": r.result,
            "chat": str(r.chat.id),   
            "clarity": r.clarity,
            "warmth": r.warmth,
            "patience": r.patience,
            "simplicity": r.simplicity,
            "fluency": r.fluency,
            "verdict": r.verdict,
            "is_practice": r.is_practice,
            "practice_job_role": r.practice_job_role,
            "date": r.created_at
        }
        for r in results
    ]

    return Response(data)