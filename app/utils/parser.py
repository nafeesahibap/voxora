import re
import uuid

def parse_resume(file_content, file_type, filename=None):
    """
    MOCK PARSING LOGIC
    In production, this would use pdf-parse or mammoth.
    Returns: {first_name, last_name, email, skills, text}
    """
    text = file_content
    # If text is mostly garbage (failed decode of binary), use fallbacks
    if len(text) < 10 or "\0" in text:
        text = "Resume content could not be fully parsed. Please review the original file."
    
    # Simple regex for email
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    email = email_match.group(0) if email_match else f"applicant_{uuid.uuid4().hex[:8]}@example.com"
    
    # Mock skill extraction (expanded list)
    common_skills = ["React", "Node.js", "Python", "TypeScript", "SQL", "AWS", "Docker", "Go", "Java", "C++", "C#", "Vue", "Angular", "Kubernetes", "Redis", "Mongo", "Postgres", "FastAPI", "Django", "Flask"]
    found_skills = list(set([s for s in common_skills if s.lower() in text.lower()]))
    
    # Better Name Extraction Logic
    first_name = "Candidate"
    last_name = "Upload"
    
    if filename:
        # Try to infer from filename "John_Doe.pdf" or "JohnDoe.docx"
        clean_name = filename.rsplit('.', 1)[0]
        clean_name = clean_name.replace('_', ' ').replace('-', ' ')
        # Split by space or CamelCase
        parts = re.findall(r'[A-Z]?[a-z]+|[A-Z]+(?=[A-Z]|$)', clean_name)
        if not parts:
            parts = clean_name.split()
            
        if len(parts) >= 2:
            first_name = parts[0].capitalize()
            last_name = " ".join(parts[1:]).capitalize()
        elif len(parts) == 1:
            first_name = parts[0].capitalize()
            last_name = ""

    return {
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "skills": found_skills if found_skills else ["Communication", "Teamwork"], 
        "text": text,
        "experience": 3.0 # Default experience
    }
