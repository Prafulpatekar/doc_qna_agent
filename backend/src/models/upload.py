from pydantic import BaseModel
from datetime import datetime

class UploadedDocuments(BaseModel):
    document_id: str
    filename: str
    uploaded_path: str
    created_at: datetime