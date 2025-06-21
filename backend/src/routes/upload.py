import datetime
from fastapi import APIRouter, UploadFile, File, status, Depends
from fastapi.responses import JSONResponse
from src.services.database import get_collection
from src.models.upload import UploadedDocuments
from uuid import uuid4
import os
from typing import List
from src.services.auth import AuthJWTBearer

router = APIRouter(prefix="/upload")


UPLOAD_DIR = "uploaded_docs/"
os.makedirs(UPLOAD_DIR, exist_ok=True)

uploaded_doc_collection = get_collection("UPLOADED_DOCUMENTS")

@router.post("/")
async def upload_file(file: UploadFile = File(...), user_session: dict = Depends(AuthJWTBearer())):
    try:
        user_id = user_session.get("sub")
        if not user_id:
            return JSONResponse(
                content={
                    "message": "Unauthorized user",
                    "status": False
                },
                status_code=status.HTTP_401_UNAUTHORIZED
            )
        filename = file.filename
        file_ext = os.path.splitext(filename)[1]
        if file_ext not in ['.pdf', '.txt', '.docx']:
            return {"error": "Unsupported file type. Please upload a PDF, TXT, or DOCX file."}
        doc_id = str(uuid4())
        new_filename = f"{doc_id}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, new_filename)
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        doc_data = {
            "user_id": user_id,
            "id": doc_id,
            "filename": filename,
            "uploaded_path": file_path,
            "created_at": str(datetime.datetime.now())
        }
        uploaded_doc_collection.insert_one(doc_data)
        return JSONResponse(
            content={
                "message": "File uploaded successfully",
                "status": True,
                "data": {"id": doc_id}
            },
            status_code=status.HTTP_201_CREATED
        )
    except Exception as e:
        return JSONResponse(
            content={
                "message": "File upload failed",
                "status": False,
                "error": str(e)
            },
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        

@router.get("/", response_model=List[UploadedDocuments])
async def list_uploaded_files(user_session: dict = Depends(AuthJWTBearer())):
    try:
        user_id = user_session.get("sub")
        if not user_id:
            return JSONResponse(
                content={
                    "message": "Unauthorized user",
                    "status": False
                },
                status_code=status.HTTP_401_UNAUTHORIZED
            )
        docs = list(uploaded_doc_collection.find({"user_id": user_id}, {"_id": 0, "user_id": 0}))
        return JSONResponse(
            content={
                "message": "Files retrieved successfully",
                "status": True,
                "data": docs
            },
            status_code=status.HTTP_200_OK
        )
    except Exception as e:
            return JSONResponse(
                content={
                    "message": "File upload failed",
                    "status": False,
                    "error": str(e)
                },
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
