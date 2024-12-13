import typesense
from transformers import pipeline
import json

class TypesenseClient:
    def __init__(self):
        self.client = typesense.Client({
            'nodes': [{'host': 'localhost', 'port': '8108', 'protocol': 'http'}],
            'api_key': 'xyz',
            'connection_timeout_seconds': 2
        })

    def create_collection(self, schema):
        try:
            self.client.collections.create(schema)
        except Exception as e:
            print(f"Error creating collection in Typesense: {e}")
            raise e

    def generate_embedding(self, text: str):
        nlp_pipeline = pipeline('feature-extraction', model='./fine_tuned_gpt2', tokenizer='./fine_tuned_gpt2')
        return json.dumps(nlp_pipeline(text)[0][0])

    def index_document(self, collection_name: str, document):
        try:
            self.client.collections[collection_name].documents.create(document)
        except Exception as e:
            print(f"Error indexing document in Typesense: {e}")
            raise e

    def search_products(self, query: str):
        search_params = {'q': query, 'query_by': 'productname,description,category,store,price', 'page': 1, 'per_page': 3}
        results = self.client.collections['productsA29'].documents.search(search_params)
        return [hit['document'] for hit in results['hits']]