from fastapi import FastAPI, Request, UploadFile, File
from pydantic import BaseModel
from services.gpt_service import GPTFineTuneService, GPTEmbeddingService
from services.search_service import SearchService
from services.product_service import ProductService

app = FastAPI()

gpt_fine_tune_service = GPTFineTuneService()
gpt_embedding_service = GPTEmbeddingService()
search_service = SearchService()
product_service = ProductService()

class SearchQuery(BaseModel):
    query: str

class ChatMessage(BaseModel):
    message: str

@app.get("/search")
async def search(query: str):
    return search_service.search(query)

@app.get("/search_with_map")
async def search_with_map(query: str):
    return search_service.search_with_map(query)

@app.post("/chat/")
async def chat(request: Request):
    data = await request.json()
    user_input = data.get("input")
    embedding = gpt_embedding_service.generate_embedding(user_input)
    return {"input": user_input, "embedding": embedding}

@app.post("/train_dataset")
async def train_dataset(file: UploadFile = File(...)):
    return gpt_fine_tune_service.fine_tune_gpt2()

@app.get("/search_compare2")
async def search_compare2(query: str):
    return search_service.search_compare2(query)

@app.post("/vectorize_products")
async def vectorize_products():
    return product_service.vectorize_products()
