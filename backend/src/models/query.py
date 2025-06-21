from pydantic import BaseModel
from datetime import datetime

class QueryRequest(BaseModel):
    doc_id: str
    question: str

class QueryHistory(BaseModel):
    document_id: str
    question: str
    response: str
    created_at: datetime