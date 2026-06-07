from django.urls import path
from .views import google_login, profile, hr_login
from .profile_views import update_profile, parse_resume, update_hr_profile

urlpatterns = [
    path("google/", google_login),
    path("profile/", profile),
    path("profile/update/", update_profile),
    path("profile/update-hr/", update_hr_profile),
    path("profile/parse-resume/", parse_resume),
    path("hr-login/", hr_login),
]

