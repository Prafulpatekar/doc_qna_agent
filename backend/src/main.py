from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routes import upload, query, auth


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Hello, World!"}


app.include_router(auth.router, prefix="/api/v1")

app.include_router(
    upload.router,
    prefix="/api/v1",
)
app.include_router(
    query.router,
    prefix="/api/v1",
)
