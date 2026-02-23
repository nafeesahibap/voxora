# Setup Guide

## Development
1. Install requirements: `pip install -r requirements/dev.txt`
2. Run database: `docker-compose up -d db`
3. Run app: `uvicorn app.main:app --reload`

## Production
1. Build container: `docker build -f docker/Dockerfile -t voice-backend .`
2. Run compose: `docker-compose -f docker/docker-compose.yml up -d`
