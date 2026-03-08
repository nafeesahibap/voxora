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

## Running with npm

You can run both the backend and frontend concurrently using the following command from the project root:

1. Install root dependencies: `npm.cmd install`
2. Install all (root + frontend): `npm.cmd run install-all`
3. Start both: `npm.cmd run dev`

> [!NOTE]
> On Windows PowerShell, if `npm` gives a "script execution" error, use `npm.cmd` instead.
