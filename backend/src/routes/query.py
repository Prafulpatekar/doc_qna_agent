from fastapi import APIRouter
from pydantic import BaseModel
from src.services.llm import LLMService
llm_agent = LLMService()

router = APIRouter(prefix="/query")

class QueryRequest(BaseModel):
    doc_id: str
    question: str

@router.post("/")
def ask_question(body: QueryRequest):
    answer = llm_agent.generate_response(doc_id=body.doc_id, question=body.question)
    return {"answer": answer}
