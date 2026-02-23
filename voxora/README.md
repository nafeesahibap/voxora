# Voxora

Enterprise-grade backend for a voice-controlled intelligent digital assistant.

## Features
- **Modular Architecture**: Clean separation of concerns.
- **Voice Processing**: Speech-to-text, emotion detection, voice biometrics.
- **Intelligence**: Intent detection, NLP, LLM integration.
- **Task Management**: Scheduling, reminders, booking.
- **Security**: JWT, MFA, Encryption.
- **XAI**: Explainable AI decisions.

## Setup
1. Clone repo
2. Copy `.env.example` to `.env`
3. Install dependencies: `pip install -r requirements/dev.txt`
4. Run: `uvicorn app.main:app --reload`
