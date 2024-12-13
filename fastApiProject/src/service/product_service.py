import json
from fastapi import HTTPException

from main import create_db_connection


class ProductService:
    def __init__(self):
        self.embedding_service = GPTEmbeddingService()

    def vectorize_products(self, typesense_client=None):
        conn = create_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("""
                SELECT p.productname, p.description, c.categoryname, s.storeName, p.price
                FROM products p
                JOIN categories c ON p.categoryid = c.categoryid
                JOIN stores s ON p.storeid = s.storeid
            """)
            rows = cursor.fetchall()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error querying database: {e}")

        for row in rows:
            productname, description, category, store, price = row
            text = f"{productname} {description} {category} {store} {price}"
            embedding_str = self.embedding_service.generate_embedding(text)
            document = {
                "productname": productname,
                "description": description,
                "category": category,
                "store": store,
                "price": str(price),
                "embedding": embedding_str
            }
            try:
                typesense_client.collections['productsA60'].documents.create(document)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Error indexing document in Typesense: {e}")
