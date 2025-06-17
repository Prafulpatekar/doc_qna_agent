from google import genai
from google.genai import types
import os
import pathlib

api_key = os.getenv("GEMINI_API_KEY")
class LLMService:
    def __init__(self, api_key: str = api_key):
        self.client = genai.Client(api_key=api_key)

    def generate_response(self, doc_id: str, question: str) -> str:
        # Retrieve and encode the PDF bytes
        filepath = pathlib.Path(f"uploaded_docs/{doc_id}.pdf")
        response = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(
                    data=filepath.read_bytes(),
                    mime_type="application/pdf",
                ),
                question,
            ],
        )
        return response.text


