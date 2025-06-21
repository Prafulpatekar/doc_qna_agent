from fastapi import APIRouter, Depends
from datetime import datetime
from uuid import uuid4
from fastapi.responses import JSONResponse
from fastapi import status
from typing import List
from src.models.query import QueryRequest, QueryHistory
from src.services.database import get_collection
from src.services.llm import LLMService
from src.services.auth import AuthJWTBearer

llm_agent = LLMService()

router = APIRouter(prefix="/query")

query_doc_collection = get_collection("QUERY_DOCUMENTS")


@router.post("/")
def ask_question(body: QueryRequest,  user_session: dict = Depends(AuthJWTBearer())):
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
        answer = llm_agent.generate_response(doc_id=body.doc_id, question=body.question)
        data = {
            "id": str(uuid4()),
            "user_id": user_id,
            "doc_id": body.doc_id,
            "question": body.question,
            "answer": answer,
            "created_at": str(datetime.now()),
        }
        query_doc_collection.insert_one(data)
        return JSONResponse(
            content={
                "message": "Query processed successfully",
                "status": True,
                "data": {"answer": answer},
            },
            status_code=status.HTTP_201_CREATED,
        )
    except Exception as e:
        return JSONResponse(
            content={
                "message": "Agent failed to respond",
                "status": False,
                "error": str(e),
            },
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@router.get("/history/{document_id}", response_model=List[QueryHistory])
async def doc_query_history(document_id: str, user_session: dict = Depends(AuthJWTBearer())):
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
        chats = list(query_doc_collection.find({"doc_id": document_id, "user_id": user_id}, {"_id": 0, "user_id": 0}))
        return JSONResponse(
            content={
                "message": "Query processed successfully",
                "status": True,
                "data": {"chats": chats},
            },
            status_code=status.HTTP_200_OK,
        )
    except Exception as e:
        return JSONResponse(
            content={
                "message": "Failed to retrieve query history",
                "status": False,
                "error": str(e),
            },
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
