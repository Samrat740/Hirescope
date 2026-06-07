from rest_framework.decorators import api_view
from rest_framework.response import Response
from users.auth_utils import get_user_from_request
from users.models import User
from chat.gemini_service import parse_resume_data
from django.conf import settings
from pypdf import PdfReader
import cloudinary
import cloudinary.uploader
import io

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

@api_view(["POST"])
def update_profile(request):
    user = get_user_from_request(request)
    if not user:
        return Response({"error": "Unauthorized"}, status=401)
    
    if user.role != "candidate":
        return Response({"error": "Only candidates can update profile details"}, status=403)

    contact = request.data.get("contact")
    education = request.data.get("education")
    cgpa = request.data.get("cgpa")
    resume_file = request.FILES.get("resume")

    if not contact or not education or not cgpa:
        return Response({"error": "Contact, education, and cgpa are required"}, status=400)

    try:
        # 1. Handle resume upload (only if provided)
        if resume_file:
            upload_result = cloudinary.uploader.upload(
                resume_file,
                folder="hirescope_resumes/",
                resource_type="image"
            )
            user.resume_url = upload_result.get("secure_url")
        else:
            if not user.resume_url:
                return Response({"error": "Resume file is required for initial profile setup"}, status=400)

        # Allow manual updates of skills, projects, and experience if provided
        import json
        def parse_list_field(field_value):
            if not field_value:
                return []
            if isinstance(field_value, list):
                return field_value
            try:
                parsed = json.loads(field_value)
                if isinstance(parsed, list):
                    return parsed
            except:
                pass
            if isinstance(field_value, str):
                # Split by newline or comma
                lines = [x.strip() for x in field_value.replace("\r", "").split("\n") if x.strip()]
                if len(lines) <= 1:
                    return [x.strip() for x in field_value.split(",") if x.strip()]
                return lines
            return []

        skills_raw = request.data.get("skills")
        projects_raw = request.data.get("projects")
        experience_raw = request.data.get("experience")

        if skills_raw is not None:
            user.skills = parse_list_field(skills_raw)
        if projects_raw is not None:
            user.projects = parse_list_field(projects_raw)
        if experience_raw is not None:
            user.experience = parse_list_field(experience_raw)

        # 2. Save other details to MongoDB
        user.contact = contact
        user.education = education
        user.cgpa = cgpa
        user.save()

        return Response({
            "message": "Profile updated successfully",
            "user": {
                "email": user.email,
                "name": user.name,
                "contact": user.contact,
                "education": user.education,
                "cgpa": user.cgpa,
                "resume_url": user.resume_url,
                "skills": user.skills,
                "projects": user.projects,
                "experience": user.experience,
                "image": user.image
            }
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)


@api_view(["POST"])
def parse_resume(request):
    user = get_user_from_request(request)
    if not user:
        return Response({"error": "Unauthorized"}, status=401)
    
    if user.role != "candidate":
        return Response({"error": "Only candidates can parse resumes"}, status=403)
        
    resume_file = request.FILES.get("resume")
    if not resume_file:
        return Response({"error": "No resume file provided"}, status=400)
    
    try:
        # Extract text from PDF using pypdf
        pdf_reader = PdfReader(io.BytesIO(resume_file.read()))
        resume_text = ""
        for page in pdf_reader.pages:
            text = page.extract_text()
            if text:
                resume_text += text + "\n"
        
        # Parse resume text with Hugging Face Llama 3
        parsed_data = parse_resume_data(resume_text)
        
        return Response(parsed_data)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)


@api_view(["POST"])
def update_hr_profile(request):
    user = get_user_from_request(request)
    if not user:
        return Response({"error": "Unauthorized"}, status=401)
    
    if user.role != "hr":
        return Response({"error": "Only HR users can update HR profile details"}, status=403)

    name = request.data.get("name")
    contact = request.data.get("contact")
    image_file = request.FILES.get("image")

    if not name:
        return Response({"error": "Name is required"}, status=400)

    try:
        # Upload image to Cloudinary (if provided)
        if image_file:
            upload_result = cloudinary.uploader.upload(
                image_file,
                folder="hirescope_hr_photos/",
                resource_type="image"
            )
            user.image = upload_result.get("secure_url")

        user.name = name
        if contact:
            user.contact = contact
        user.save()

        return Response({
            "message": "HR Profile updated successfully",
            "user": {
                "email": user.email,
                "name": user.name,
                "contact": user.contact if hasattr(user, "contact") else "",
                "image": user.image if hasattr(user, "image") else None,
                "role": user.role
            }
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)
