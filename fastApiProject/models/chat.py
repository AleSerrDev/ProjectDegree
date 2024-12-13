import typesense
import psycopg2
from transformers import GPT2Tokenizer, GPT2LMHeadModel, Trainer, TrainingArguments, pipeline
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from datasets import load_dataset
from fastapi.middleware.cors import CORSMiddleware
import random
import os
import json

# Configuración de Typesense
client = typesense.Client({
    'nodes': [{
        'host': 'localhost',
        'port': '8108',
        'protocol': 'http'
    }],
    'api_key': 'xyz',
    'connection_timeout_seconds': 2
})


def create_db_connection():
    try:
        conn = psycopg2.connect(
            dbname="gallo_db",
            user="postgres",
            password="password",
            host="localhost",
            port="5432"
        )
        return conn
    except psycopg2.Error as e:
        print(f"Database connection error: {e}")
        raise RuntimeError("Failed to connect to the database")


# Ajuste fino de GPT-2 si es necesario
def fine_tune_gpt2():
    model = GPT2LMHeadModel.from_pretrained('gpt2')
    tokenizer = GPT2Tokenizer.from_pretrained('gpt2')
    if tokenizer.pad_token is None:
        tokenizer.add_special_tokens({'pad_token': tokenizer.eos_token})

    dataset = load_dataset('text', data_files={'train': 'C:/Projects/ElGalloSearch/fastApiProject/dataset.txt'})

    def preprocess_function(examples):
        inputs = tokenizer(examples['text'], truncation=True, padding="max_length", max_length=128)
        inputs["labels"] = inputs["input_ids"].copy()
        return inputs

    tokenized_datasets = dataset.map(preprocess_function, batched=True)

    training_args = TrainingArguments(
        output_dir="./results",
        evaluation_strategy="steps",
        eval_steps=100,
        per_device_train_batch_size=4,
        per_device_eval_batch_size=4,
        num_train_epochs=5,
        weight_decay=0.01,
        logging_dir='./logs',
        logging_steps=50,
        save_steps=500,
        save_total_limit=3,
        load_best_model_at_end=True,
        warmup_steps=200,
        learning_rate=5e-5
    )

    model.resize_token_embeddings(len(tokenizer))
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_datasets['train'],
        eval_dataset=tokenized_datasets['train']
    )
    trainer.train()
    model.save_pretrained("./fine_tuned_gpt2")
    tokenizer.save_pretrained("./fine_tuned_gpt2")
    print("Ajuste fino de GPT-2 completado y modelo guardado.")


if not os.path.exists("./fine_tuned_gpt2"):
    fine_tune_gpt2()

# Crear el pipeline de la IA para usar en el chat, pero ahora como embeddings
nlp = pipeline('feature-extraction', model='./fine_tuned_gpt2', tokenizer='./fine_tuned_gpt2')


def setup_typesense_collections():
    schema = {
        "name": "productsA38",
        "fields": [
            {"name": "productname", "type": "string"},
            {"name": "description", "type": "string"},
            {"name": "category", "type": "string"},
            {"name": "store", "type": "string"},
            {"name": "price", "type": "string"},
            {"name": "embedding", "type": "string"}
        ]
    }
    try:
        client.collections.create(schema)
    except Exception as e:
        print(f"Error creating collection in Typesense: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating collection in Typesense: {e}")


# Función para obtener y vectorizar productos
def vectorize_products():
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
        print(f"Error querying database: {e}")
        raise HTTPException(status_code=500, detail=f"Error querying database: {e}")

    for row in rows:
        productname, description, category, store, price = row
        text = f"{productname} {description} {category} {store} {price}"
        embedding = nlp(text)[0][0]  # Extraer el vector de características como una lista de números
        embedding_str = json.dumps(embedding)  # Convertir a string para almacenar en Typesense
        document = {
            "productname": productname,
            "description": description,
            "category": category,
            "store": store,
            "price": str(price),
            "embedding": embedding_str  # Almacenar como string
        }
        try:
            client.collections['productsA38'].documents.create(document)
        except Exception as e:
            print(f"Error indexing document in Typesense: {e}")
            raise HTTPException(status_code=500, detail=f"Error indexing document in Typesense: {e}")


setup_typesense_collections()
vectorize_products()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


class SearchQuery(BaseModel):
    query: str


class ClickEvent(BaseModel):
    query: str
    product_id: str


@app.get("/search")
async def search(query: str):
    try:
        search_parameters = {
            'q': query,
            'query_by': 'productname,description,category,store,price',
            'query_by_weights': '1,1,1,1,1',
            'filter_by': '',
            'use_caching': True,
            'enable_overrides': True
        }
        results = client.collections['productsA38'].documents.search(search_parameters)
        documents_only = [hit['document'] for hit in results['hits']]

        return JSONResponse(content=documents_only)
    except Exception as e:
        print(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=f"Search error: {e}")


# Endpoint de click de evento existente
@app.post("/event")
async def click(event: ClickEvent):
    try:
        log_event('click', event.query, event.product_id)
        return JSONResponse(content={"status": "success"})
    except Exception as e:
        print(f"Click event error: {e}")
        raise HTTPException(status_code=500, detail=f"Click event error: {e}")


def log_event(event_type, query, product_id):
    conn = create_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO events (event_type, query, product_id) VALUES (%s, %s, %s)",
                       (event_type, query, product_id))
        conn.commit()
    except psycopg2.Error as e:
        print(f"Error logging event: {e}")
        raise HTTPException(status_code=500, detail=f"Error logging event: {e}")


@app.get("/search_with_map")
async def search_with_map(query: str):
    try:
        search_parameters = {
            'q': query,
            'query_by': 'productname,description,category,store,price',
            'query_by_weights': '1,1,1,1,1',
            'filter_by': '',
            'use_caching': True,
            'enable_overrides': True
        }
        results = client.collections['productsA38'].documents.search(search_parameters)
        documents_only = [hit['document'] for hit in results['hits']]

        # Modificar la estructura de respuesta para incluir store como un objeto dentro del producto
        conn = create_db_connection()
        cursor = conn.cursor()

        for product in documents_only:
            # Consultar la base de datos para obtener los detalles de la tienda
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

        return JSONResponse(content=documents_only)
    except Exception as e:
        print(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=f"Search error: {e}")

class ChatMessage(BaseModel):
    message: str


@app.post("/chat")
async def chat(message: ChatMessage):
    try:
        # Obtener información relevante de Typesense con base en el mensaje del usuario
        search_parameters = {
            'q': message.message,
            'query_by': 'productname,description,category,store,price',
            'page': 1,
            'per_page': 3
        }

        # Obtener los resultados de la base de datos vectorial
        try:
            results = client.collections['productsA21'].documents.search(search_parameters)
        except Exception as e:
            print(f"Error al buscar en Typesense: {e}")
            raise HTTPException(status_code=500, detail=f"Error al buscar en Typesense: {e}")

        # Construir el contexto a partir de los documentos más relevantes
        context_text = ""
        try:
            if results['found'] > 0:
                for hit in results['hits']:
                    document = hit['document']
                    context_text += (f"{document['productname']} es un producto de la categoría {document['category']} "
                                     f"con las siguientes características: {document['description']}. "
                                     f"Su precio es {document['price']} y está disponible en la tienda {document['store']}. ")
            else:
                context_text = "No se encontraron productos relevantes en nuestro catálogo."
        except Exception as e:
            print(f"Error al procesar los resultados de la búsqueda: {e}")
            raise HTTPException(status_code=500, detail=f"Error al procesar los resultados de la búsqueda: {e}")

        input_text = f"Usuario: {message.message}\nContexto: {context_text}\nAsistente:"

        try:

            nlp_text_generation = pipeline('text-generation', model='./fine_tuned_gpt2', tokenizer='./fine_tuned_gpt2')

            generated_response = nlp_text_generation(input_text, max_length=300, num_return_sequences=1)[0][
                'generated_text']

            if "Asistente:" in generated_response:
                final_response = generated_response.split("Asistente:")[1].strip()
            else:
                final_response = generated_response.strip()

        except Exception as e:
            print(f"Error al generar la respuesta con el modelo de texto: {e}")
            raise HTTPException(status_code=500, detail=f"Error al generar la respuesta con el modelo de texto: {e}")

        return {"response": final_response}

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Error inesperado en el endpoint de chat: {e}")
        raise HTTPException(status_code=500, detail=f"Error inesperado en el endpoint de chat: {e}")


# Para iniciar la aplicación
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)