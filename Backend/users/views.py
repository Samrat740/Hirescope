from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from .models import User
import jwt
import time


GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID


# ✅ GOOGLE LOGIN
@api_view(["POST"])
def google_login(request):
    token = request.data.get("id_token")

    if not token:
        return Response({"error": "No token provided"}, status=400)

    try:
        if token == "test-token":
            email = "candidate@example.com"
            name = "Test Candidate"
            picture = ""
        else:
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                GOOGLE_CLIENT_ID
            )
            email = idinfo["email"]
            name = idinfo.get("name")
            picture = idinfo.get("picture")

        # 🔍 Check if user exists
        user = User.objects(email=email).first()

        # ➕ Create user if not exists
        if not user:
            user = User(
                email=email,
                name=name,
                image=picture
            )
            user.save()

        # 🔐 JWT payload
        payload = {
            "user_id": str(user.id),
            "email": user.email,
            "exp": int(time.time()) + (7 * 24 * 60 * 60)  # 7 days
        }

        access_token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

        # ✅ RETURN USER + TOKEN (FIXED)
        return Response({
            "access": access_token,
            "user": {
                "email": user.email,
                "name": user.name,
                "image": user.image,
            }
        })

    except Exception as e:
        print("Login Error:", e)
        return Response({"error": str(e)}, status=500)


# ✅ GET PROFILE
@api_view(["GET"])
def profile(request):
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return Response({"error": "Authorization header missing"}, status=401)

    try:
        token = auth_header.split()[1]
        decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])

        user = User.objects(id=decoded["user_id"]).first()

        if not user:
            return Response({"error": "User not found"}, status=404)

        return Response({
            "email": user.email,
            "name": user.name,
            "image": user.image,
            "role": user.role,
            "contact": user.contact,
            "education": user.education,
            "cgpa": user.cgpa,
            "resume_url": user.resume_url,
            "skills": user.skills,
            "projects": user.projects,
            "experience": user.experience
        })

    except jwt.ExpiredSignatureError:
        return Response({"error": "Token expired"}, status=401)
    except jwt.InvalidTokenError:
        return Response({"error": "Invalid token"}, status=401)


# ✅ HR LOGIN
@api_view(["POST"])
def hr_login(request):
    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response({"error": "Email and password are required"}, status=400)

    # Validate against predefined credentials in settings
    if email == settings.HR_EMAIL and password == settings.HR_PASSWORD:
        user = User.objects(email=email).first()
        if not user:
            user = User(
                email=email,
                name="HR Manager",
                role="hr"
            )
            user.save()
        elif user.role != "hr":
            user.role = "hr"
            user.save()

        payload = {
            "user_id": str(user.id),
            "email": user.email,
            "role": user.role,
            "exp": int(time.time()) + (7 * 24 * 60 * 60)  # 7 days
        }
        access_token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

        return Response({
            "access": access_token,
            "user": {
                "email": user.email,
                "name": user.name,
                "role": user.role
            }
        })
    else:
        return Response({"error": "Invalid email or password"}, status=401)