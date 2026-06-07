from mongoengine import Document, StringField, EmailField, DateTimeField, ListField
from datetime import datetime


class User(Document):
    email = EmailField(required=True, unique=True)
    name = StringField(required=True)
    image = StringField()
    role = StringField(choices=["candidate", "hr"], default="candidate")
    
    # Candidate fields
    contact = StringField()
    education = StringField()
    cgpa = StringField()
    resume_url = StringField()
    skills = ListField(StringField(), default=list)
    projects = ListField(StringField(), default=list)
    experience = ListField(StringField(), default=list)

    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        "collection": "users",
        "strict": False
    }
