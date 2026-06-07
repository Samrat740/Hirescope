from mongoengine import Document, ReferenceField, StringField, DateTimeField, IntField, BooleanField, CASCADE
from datetime import datetime
from users.models import User


class ChatSession(Document):
    user = ReferenceField(User, required=True, reverse_delete_rule=CASCADE)
    title = StringField()
    is_practice = BooleanField(default=False)
    practice_job_role = StringField()
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        "collection": "chat_sessions"
    }


class Message(Document):
    chat = ReferenceField(ChatSession, required=True)
    role = StringField(required=True, choices=["user", "assistant"])
    content = StringField(required=True)
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        "collection": "messages"
    }

class Result(Document):
    user = ReferenceField(User, required=True, reverse_delete_rule=CASCADE)
    chat = ReferenceField('ChatSession', required=True)
    is_practice = BooleanField(default=False)
    practice_job_role = StringField()

    # 🔥 Structured scores
    clarity = IntField()
    warmth = IntField()
    patience = IntField()
    simplicity = IntField()
    fluency = IntField()

    # 🔥 Verdict
    verdict = StringField()

    # 🔥 Raw text (optional but useful)
    result = StringField()

    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        "collection": "results"
    }


class Job(Document):
    title = StringField(required=True)
    description = StringField(required=True)
    education = StringField()
    location = StringField()
    job_type = StringField()
    experience_level = StringField()
    domain = StringField()
    skills = StringField()
    last_date = DateTimeField()
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        "collection": "jobs"
    }


class Application(Document):
    candidate = ReferenceField(User, required=True, reverse_delete_rule=CASCADE)
    job = ReferenceField(Job, required=True)
    status = StringField(default="applied", choices=["applied", "shortlisted", "interview_scheduled", "interview_cleared", "interview_completed", "rejected"])
    chat = ReferenceField(ChatSession)
    reason = StringField(default="")
    interview_start = DateTimeField()
    interview_end = DateTimeField()
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        "collection": "applications"
    }