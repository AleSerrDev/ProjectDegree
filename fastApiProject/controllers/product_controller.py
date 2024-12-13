from fastapi import APIRouter
from services.product_service import ProductService

router = APIRouter()
product_service = ProductService()

@router.get("/search")
async def search(query: str):
    return product_service.search_products(query)