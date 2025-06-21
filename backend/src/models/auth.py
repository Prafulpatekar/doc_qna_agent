from pydantic import BaseModel
from datetime import datetime

class SignUpRequest(BaseModel):
    email: str
    password: str
    api_key: str

class LoginRequest(BaseModel):
    email: str
    password: str