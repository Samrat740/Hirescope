import requests
from django.conf import settings

HF_MODEL = "meta-llama/Meta-Llama-3-8B-Instruct"

def generate_ai_response(conversation_messages, job_title="online math tutor", job_description="online math tutor role", candidate_skills=None, candidate_projects=None, candidate_experience=None):

    url = "https://router.huggingface.co/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {settings.HF_API_KEY}",
        "Content-Type": "application/json"
    }

    system_prompt = f"""
You are a professional interviewer hiring for the role of: {job_title}.

Job Description:
{job_description}
"""
    if candidate_skills or candidate_projects or candidate_experience:
        system_prompt += "\nCandidate Profile Details:\n"
        if candidate_skills:
            system_prompt += f"- Skills: {candidate_skills}\n"
        if candidate_projects:
            system_prompt += f"- Projects: {candidate_projects}\n"
        if candidate_experience:
            system_prompt += f"- Professional Experience: {candidate_experience}\n"

    system_prompt += """
Your job is to conduct a REAL candidate screening interview, not teach or explain.

STRICT RULES:

1. Ask ONLY ONE question at a time.
2. Keep questions SHORT and TO THE POINT (max 1–2 lines).
3. Do NOT give explanations, hints, or examples unless absolutely required.
4. Do NOT speak like a teacher or trainer. Speak like a professional interviewer.
5. Do NOT praise, evaluate, or give feedback during the interview.
6. Avoid long sentences and avoid multiple questions.
7. Use simple, direct, and professional language.
8. Total interview = 5 questions.

STYLE:
- Concise
- Natural
- Professional
- Slightly conversational (like a real human interviewer)

IMPORTANT:
Only ask the next question based on the candidate’s previous answer and the job requirements.
Never provide evaluation or summary during the interview.
"""

    messages = [{"role": "system", "content": system_prompt}] + conversation_messages

    print("====== FULL MESSAGE PAYLOAD ======")
    for m in messages:
        print(m["role"], ":", m["content"][:80])
    print("===================================")

    payload = {
        "model": HF_MODEL,
        "messages": messages,
        "max_tokens": 1000,
        "temperature": 0.7
    }

    response = requests.post(url, headers=headers, json=payload)

    if response.status_code != 200:
        return "Error generating response from AI."

    data = response.json()
    return data["choices"][0]["message"]["content"]

def generate_evaluation(conversation_messages, job_title="online math tutor", job_description="online math tutor role", candidate_skills=None, candidate_projects=None, candidate_experience=None):

    url = "https://router.huggingface.co/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {settings.HF_API_KEY}",
        "Content-Type": "application/json"
    }

    system_prompt = f"""
You are an expert interviewer evaluating a candidate for the role of: {job_title}.

Job Description:
{job_description}
"""
    if candidate_skills or candidate_projects or candidate_experience:
        system_prompt += "\nCandidate Profile Details:\n"
        if candidate_skills:
            system_prompt += f"- Skills: {candidate_skills}\n"
        if candidate_projects:
            system_prompt += f"- Projects: {candidate_projects}\n"
        if candidate_experience:
            system_prompt += f"- Professional Experience: {candidate_experience}\n"

    system_prompt += """
STRICT FORMAT:
You MUST follow this format exactly.

If you do not follow format, response is invalid.

Do NOT ask any question.
Do NOT continue interview.
ONLY return evaluation.
Analyze the full conversation and evaluate the candidate on:

- Clarity (out of 10)
- Warmth (out of 10)
- Patience (out of 10)
- Simplicity of explanation (out of 10)
- English fluency (out of 10)

Also provide:
- 2–3 strengths (with examples from answers)
- 2–3 weaknesses (with examples)
- Final verdict: SHORTLISTED or REJECTED

Format strictly like this:

Clarity: X/10
Warmth: X/10
Patience: X/10
Simplicity: X/10
Fluency: X/10

Strengths:
- ...
- ...

Weaknesses:
- ...
- ...

Verdict:
SHORTLISTED / REJECTED
"""

    messages = [{"role": "system", "content": system_prompt}] + conversation_messages

    payload = {
        "model": HF_MODEL,
        "messages": messages,
        "max_tokens": 1000,
        "temperature": 0.5
    }

    response = requests.post(url, headers=headers, json=payload)

    if response.status_code != 200:
        return "Error generating evaluation."

    data = response.json()
    return data["choices"][0]["message"]["content"]


def parse_resume_data(resume_text):
    import json
    import re
    url = "https://router.huggingface.co/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.HF_API_KEY}",
        "Content-Type": "application/json"
    }

    system_prompt = """
You are an expert system that extracts information from candidate resumes.
Given the text extracted from a resume PDF, parse and extract:
- Contact number / phone number (usually 10 digits or with country code, e.g., '+91 9876543210' or '8521790274')
- Education qualification (e.g. B.Tech Computer Science, BSC Mathematics, etc.)
- College CGPA or percentage (e.g. 8.0/10, 8.5, 85%, etc.)
- A list of skills
- A list of projects
- A list of experiences (if any)

Your output MUST be a valid JSON object matching the following structure:
{
  "contact": "extracted phone number or empty string",
  "education": "extracted degree/college or empty string",
  "cgpa": "extracted CGPA/percentage or empty string",
  "skills": ["Skill1", "Skill2", ...],
  "projects": ["Project1 description/name", ...],
  "experience": ["Experience1 description/name", ...]
}

Do NOT include any extra text, explanations, or markdown formatting (like ```json). ONLY output the raw JSON object.
"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Resume Text:\n{resume_text}"}
    ]

    payload = {
        "model": HF_MODEL,
        "messages": messages,
        "max_tokens": 1000,
        "temperature": 0.2
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code != 200:
            print("Hugging Face API Error:", response.status_code, response.text)
            return {
                "contact": "",
                "education": "",
                "cgpa": "",
                "skills": [],
                "projects": [],
                "experience": []
            }

        content = response.json()["choices"][0]["message"]["content"].strip()
        # Clean markdown code blocks if the model wrapped it
        if content.startswith("```"):
            content = re.sub(r"^```(?:json)?\n", "", content)
            content = re.sub(r"\n```$", "", content)
            content = content.strip()

        parsed = json.loads(content)
        return {
            "contact": parsed.get("contact", ""),
            "education": parsed.get("education", ""),
            "cgpa": parsed.get("cgpa", ""),
            "skills": parsed.get("skills", []),
            "projects": parsed.get("projects", []),
            "experience": parsed.get("experience", [])
        }
    except Exception as e:
        print("Parsing Error:", e)
        try:
            match = re.search(r"\{.*\}", content, re.DOTALL)
            if match:
                parsed = json.loads(match.group(0))
                return {
                    "contact": parsed.get("contact", ""),
                    "education": parsed.get("education", ""),
                    "cgpa": parsed.get("cgpa", ""),
                    "skills": parsed.get("skills", []),
                    "projects": parsed.get("projects", []),
                    "experience": parsed.get("experience", [])
                }
        except:
            pass
        return {
            "contact": "",
            "education": "",
            "cgpa": "",
            "skills": [],
            "projects": [],
            "experience": []
        }