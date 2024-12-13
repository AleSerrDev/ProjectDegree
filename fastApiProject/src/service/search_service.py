import json

import numpy as np
from fastapi import HTTPException
from sklearn.metrics.pairwise import cosine_similarity


from main import create_db_connection


class SearchService:
    def __init__(self):
        self.embedding_service = GPTEmbeddingService()

    def search(self, query):
        try:
            search_parameters = {
                'q': query,
                'query_by': 'productname,description,category,store,price',
                'query_by_weights': '1,1,1,1,1',
                'filter_by': '',
                'use_caching': True,
                'enable_overrides': True
            }
            results = typesense_client.collections['productsA60'].documents.search(search_parameters)
            documents_only = [hit['document'] for hit in results['hits']]
            return documents_only
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Search error: {e}")

    def search_with_map(self, query):
        try:
            search_parameters = {
                'q': query,
                'query_by': 'productname,description,category,store,price',
                'query_by_weights': '1,1,1,1,1',
                'filter_by': '',
                'use_caching': True,
                'enable_overrides': True
            }
            results = typesense_client.collections['productsA60'].documents.search(search_parameters)
            documents_only = [hit['document'] for hit in results['hits']]
            conn = create_db_connection()
            cursor = conn.cursor()
            for product in documents_only:
                if 'embedding' in product:
                    del product['embedding']
                cursor.execute("SELECT storeid, storename, location, icon, userid FROM stores WHERE storename = %s", (product['store'],))
                store_row = cursor.fetchone()
                if store_row:
                    product['store'] = {
                        "storeId": store_row[0],
                        "storeName": store_row[1],
                        "location": store_row[2],
                        "icon": store_row[3],
                        "userId": store_row[4]
                    }
            return documents_only
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Search error: {e}")

    def search_compare2(self, query):
        try:
            search_parameters = {
                'q': query,
                'query_by': 'productname,description,category,store,price',
                'query_by_weights': '1,1,1,1,1',
                'filter_by': '',
                'use_caching': True,
                'enable_overrides': True
            }
            results = typesense_client.collections['productsA55'].documents.search(search_parameters)
            if not results['hits']:
                return {"error": "No se encontraron resultados"}

            first_result = results['hits'][0]['document']
            product_embedding_str = first_result['embedding']
            product_embedding = np.array(json.loads(product_embedding_str))
            query_embeddings = self.embedding_service.generate_embedding(query)

            query_embeddings_2d = np.array(query_embeddings).reshape(1, -1)
            product_embedding_2d = product_embedding.reshape(1, -1)
            similarity = cosine_similarity(query_embeddings_2d, product_embedding_2d)
            similarity_percentage = round(similarity[0][0] * 100, 2)

            return {
                "query": query,
                "product": first_result['productname'],
                "similarity_percentage": similarity_percentage
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Search error: {e}")
