from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from app.models import schemas
from app.core import security

router = APIRouter()

@router.post("/login", response_model=schemas.Token)
def login_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    # TODO: Authenticate user
    return {"access_token": "mock_token", "token_type": "bearer"}
