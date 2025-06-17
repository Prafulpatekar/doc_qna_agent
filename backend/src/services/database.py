from pymongo import MongoClient
import os

MONGODB_HOST = os.getenv("MONGODB_HOST", "localhost")
MONGODB_PORT = os.getenv("MONGODB_PORT", "27017")
DB_NAME = os.getenv("MONGODB_DB_NAME", "DOC_QNA_AGENT")

MONGODB_URI = f"mongodb://{MONGODB_HOST}:{MONGODB_PORT}/"

client = MongoClient(MONGODB_URI)
db = client[DB_NAME]

def get_collection(collection_name):
    return db[collection_name]