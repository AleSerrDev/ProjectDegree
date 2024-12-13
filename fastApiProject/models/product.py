# models/product.py
from pydantic import BaseModel

class Product(BaseModel):
    productname: str
    description: str
    category: str
    store: str
    price: str
    embedding: str