from django.urls import path
from .views import send_message, list_user_chats, get_chat_history, delete_chat, get_results
from .hr_views import list_job_applications, ai_shortlist, confirm_shortlist, schedule_interview, cancel_interview
from .job_views import list_jobs, create_job, apply_job, my_applications, delete_job

urlpatterns = [
    path("message/", send_message),
    path("list/", list_user_chats),
    path("history/<str:chat_id>/", get_chat_history),
    path("delete/<str:chat_id>/", delete_chat),
    path("results/", get_results),
    path("hr/candidates/", list_job_applications),
    path("hr/shortlist/", ai_shortlist),
    path("hr/confirm/", confirm_shortlist),
    path("hr/schedule/", schedule_interview),
    path("hr/cancel/", cancel_interview),
    path("jobs/", list_jobs),
    path("jobs/create/", create_job),
    path("jobs/delete/<str:job_id>/", delete_job),
    path("applications/apply/", apply_job),
    path("applications/my-applications/", my_applications),
]