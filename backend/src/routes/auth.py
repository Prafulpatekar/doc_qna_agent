from datetime import datetime, timedelta
from uuid import uuid4
from fastapi.responses import JSONResponse
from fastapi import status
from src.models.auth import SignUpRequest, LoginRequest
from src.services.database import get_collection
from src.services.llm import LLMService
from fastapi import  APIRouter
from src.config.settings import pwd_context
from src.services.auth import create_access_token, decode_token


llm_agent = LLMService()
router = APIRouter(prefix="/auth")
user_collection = get_collection("USERS")


@router.post("/signup")
def signup(body: SignUpRequest):
    try:
        existing_user = user_collection.find_one({"email": body.email})
        if existing_user:
            return JSONResponse(
                content={
                    "message": "User already exists",
                    "status": False,
                },
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        user_id = str(uuid4())
        hashed_password = pwd_context.hash(body.password)
        data = {
            "id": user_id,
            "email": body.email,
            "password": hashed_password,
            "api_key": body.api_key,
            "created_at": str(datetime.now()),
        }
        user_collection.insert_one(data)
        return JSONResponse(
            content={
                "message": "User created successfully",
                "status": True,
                "data": {
                    "id": user_id
                },
            },
            status_code=status.HTTP_201_CREATED,
        )
    except Exception as e:
        return JSONResponse(
            content={
                "message": "Failed to create user",
                "status": False,
                "error": str(e),
            },
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@router.post("/login")
def login(body: LoginRequest):
    try:
        user: dict = user_collection.find_one({"email": body.email})
        if not user or not pwd_context.verify(body.password, user.get("password", "")):
            return JSONResponse(
                content={
                    "message": "Invalid email or password",
                    "status": False,
                },
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        user_id = user["id"]
        access_token = create_access_token({"sub": user_id, "email": body.email, "type": "access", "api_key": user.get("api_key", "")})
        refresh_token = create_access_token(
            {"sub": user_id, "email": body.email, "type": "refresh"},
            expires_delta=timedelta(days=7)
        )
        user_collection.update_one(
            {"id": user_id},
            {"$set": {"access_token": access_token, "refresh_token": refresh_token}}
        )
        return JSONResponse(
            content={
                "message": "Login successful",
                "status": True,
                "data": {
                    "id": user_id,
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                },
            },
            status_code=status.HTTP_200_OK,
        )
    except Exception as e:
        return JSONResponse(
            content={
                "message": "Failed to login",
                "status": False,
                "error": str(e),
            },
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@router.post("/refresh")
def refresh_token(body: dict):
    try:
        refresh_token = body.get("refresh_token")
        if not refresh_token:
            return JSONResponse(
                content={
                    "message": "Refresh token is required",
                    "status": False,
                },
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        # Decode and validate the refresh token
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            return JSONResponse(
                content={
                    "message": "Invalid refresh token",
                    "status": False,
                },
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        user_id = payload.get("sub")
        email = payload.get("email")
        user = user_collection.find_one({"id": user_id, "email": email})
        if not user or user.get("refresh_token") != refresh_token:
            return JSONResponse(
                content={
                    "message": "Invalid refresh token",
                    "status": False,
                },
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        new_access_token = create_access_token({
            "sub": user_id,
            "email": email,
            "type": "access",
            "api_key": user.get("api_key", "")
        })
        user_collection.update_one(
            {"id": user_id},
            {"$set": {"access_token": new_access_token}}
        )
        return JSONResponse(
            content={
                "message": "Access token refreshed",
                "status": True,
                "data": {
                    "access_token": new_access_token
                },
            },
            status_code=status.HTTP_200_OK,
        )
    except Exception as e:
        return JSONResponse(
            content={
                "message": "Failed to refresh token",
                "status": False,
                "error": str(e),
            },
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )