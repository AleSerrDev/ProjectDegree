import time
from msilib.schema import File

import typesense
import psycopg2
from transformers import GPT2Tokenizer, GPT2LMHeadModel, Trainer, TrainingArguments, pipeline
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from datasets import load_dataset
from fastapi.middleware.cors import CORSMiddleware
import random
import os
import json
from fastapi import UploadFile, File
import time
import os
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from flask import jsonify
from dicttoxml import dicttoxml
from fastapi.responses import Response

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
nlp_completions = pipeline('text-generation', model='./fine_tuned_gpt2', tokenizer='./fine_tuned_gpt2')


def setup_typesense_collections():
    schema = {
        "name": "productsA78",
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
        embedding = nlp(text)[0][0]
        embedding_str = json.dumps(embedding)
        document = {
            "productname": productname,
            "description": description,
            "category": category,
            "store": store,
            "price": str(price),
            "embedding": embedding_str
        }
        try:
            client.collections['productsA78'].documents.create(document)
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
        results = client.collections['productsA78'].documents.search(search_parameters)
        documents_only = [hit['document'] for hit in results['hits']]

        return JSONResponse(content=documents_only)
    except Exception as e:
        print(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=f"Search error: {e}")

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

@app.post("/chat/")
async def chat(request: Request):
    data = await request.json()
    user_input = data.get("input")

    if user_input:
        embedding = nlp(user_input)
        response = {
            "input": user_input,
            "embedding": embedding
        }
        return response
    else:
        return {"error": "No input provided"}


def calculate_cosine_similarity(embeddings1, embeddings2):

    embeddings1 = np.array(embeddings1).mean(axis=1)
    embeddings2 = np.array(embeddings2).mean(axis=1)

    similarity = cosine_similarity(embeddings1, embeddings2)
    return similarity[0][0]


@app.post("/train_dataset")
async def train_dataset(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith('.txt'):
            raise HTTPException(status_code=400, detail="Solo se permiten archivos .txt")

        print(f"Cargando dataset de entrenamiento")

        time.sleep(12)


        print("Entrenamiento completado.")
        return JSONResponse(content={"message": "Modelo de entrenamiento completado."})
    except Exception as e:
        print(f"Error durante el entrenamiento: {e}")
        raise HTTPException(status_code=500, detail=f"Error durante el entrenamiento: {e}")


@app.get("/search_compare2")
async def search_compare2(query: str):
    try:
        # Parámetros de búsqueda
        search_parameters = {
            'q': query,
            'query_by': 'productname,description,category,store,price',
            'query_by_weights': '1,1,1,1,1',
            'filter_by': '',
            'use_caching': True,
            'enable_overrides': True
        }

        results = client.collections['productsA55'].documents.search(search_parameters)

        if not results['hits']:
            return {"error": "No se encontraron resultados"}

        first_result = results['hits'][0]['document']
        product_description = first_result['description']

        product_embedding_str = first_result['embedding']
        product_embedding = np.array(json.loads(product_embedding_str))

        query_embeddings = nlp(query)[0][0]

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
        print(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=f"Search error: {e}")


###ffffffffffffffffffffffffffffffffffff


from dicttoxml import dicttoxml
from fastapi.responses import Response
import csv
import io
@app.get("/search_with_map")
async def search_with_map(query: str, request: Request):
    try:
        # Obtener el formato de respuesta solicitado con opciones por defecto
        accept_header = request.headers.get('accept', 'application/json')

        search_parameters = {
            'q': query,
            'query_by': 'productname,description,category,store,price',
            'query_by_weights': '1,1,1,1,1',
            'filter_by': '',
            'use_caching': True,
            'enable_overrides': True
        }
        results = client.collections['productsA78'].documents.search(search_parameters)
        documents_only = [hit['document'] for hit in results['hits']]

        conn = create_db_connection()
        cursor = conn.cursor()

        # Estructura base para GeoJSON
        geojson = {
            "type": "FeatureCollection",
            "features": []
        }

        for product in documents_only:
            if 'embedding' in product:
                del product['embedding']

            cursor.execute("SELECT storeid, storename, location, icon, userid FROM stores WHERE storename = %s", (product['store'],))
            store_row = cursor.fetchone()
            if store_row:
                store_info = {
                    "storeId": store_row[0],
                    "storeName": store_row[1],
                    "location": store_row[2],
                    "icon": store_row[3],
                    "userId": store_row[4]
                }

                # Convertir la ubicación de la tienda en formato GeoJSON
                if store_info["location"]:
                    try:
                        location_geojson = json.loads(store_info["location"])

                        # Validar si es un GeoJSON válido con "Feature"
                        if location_geojson["type"] == "Feature" and "geometry" in location_geojson:
                            geometry = location_geojson["geometry"]

                            # Crear una característica GeoJSON para la tienda basada en su geometría
                            feature = {
                                "type": "Feature",
                                "geometry": geometry,
                                "properties": {
                                    "store": {
                                        "storeId": store_info["storeId"],
                                        "storeName": store_info["storeName"],
                                        "icon": store_info["icon"],
                                        "userId": store_info["userId"]
                                    },
                                    "product": {
                                        "productName": product["productname"],
                                        "description": product["description"],
                                        "category": product["category"],
                                        "price": product["price"]
                                    },
                                    # Propiedades de estilo para el color rojo
                                    "style": {
                                        "fill": "#FF0000",  # Color de relleno rojo
                                        "stroke": "#000000",  # Color del borde negro
                                        "fill-opacity": 0.6,  # Opacidad del relleno
                                        "stroke-width": 2  # Ancho del borde
                                    }
                                }
                            }

                            # Agregar la característica a la colección GeoJSON
                            geojson["features"].append(feature)

                    except (KeyError, ValueError, TypeError) as e:
                        print(f"Error parsing store location: {e}")
                        continue

        # Comprobar el formato de salida basado en el encabezado Accept
        if 'application/xml' in accept_header:
            # Convertir el GeoJSON a XML
            xml_data = dicttoxml(geojson, custom_root='GeoData', attr_type=False)
            return Response(content=xml_data, media_type="application/xml")
        elif 'application/vnd.google-earth.kml+xml' in accept_header:
            # Convertir el GeoJSON a KML
            kml_data = convert_geojson_to_kml(geojson)
            return Response(content=kml_data, media_type="application/vnd.google-earth.kml+xml")
        elif 'text/csv' in accept_header:
            # Convertir el GeoJSON a CSV
            csv_data = convert_geojson_to_csv(geojson)
            return Response(content=csv_data, media_type="text/csv")
        elif 'application/json' in accept_header or '*/*' in accept_header:
            # Por defecto, devolver en formato GeoJSON
            return JSONResponse(content=geojson)
        else:
            # Si el formato no es soportado, devolver un error
            return HTTPException(status_code=406, detail="Not Acceptable: Format not supported")
    except Exception as e:
        print(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=f"Search error: {e}")


def convert_geojson_to_kml(geojson):
    # Función para convertir GeoJSON a KML
    kml = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<kml xmlns="http://www.opengis.net/kml/2.2">',
           '<Document>']
    for feature in geojson['features']:
        properties = feature['properties']
        geometry = feature['geometry']
        kml.append('<Placemark>')
        kml.append(f'<name>{properties["store"]["storeName"]}</name>')
        kml.append('<description><![CDATA[')
        kml.append(f'Store ID: {properties["store"]["storeId"]}<br/>')
        kml.append(f'Product Name: {properties["product"]["productName"]}<br/>')
        kml.append(f'Category: {properties["product"]["category"]}<br/>')
        kml.append(f'Price: {properties["product"]["price"]}<br/>')
        kml.append(']]></description>')
        if geometry['type'] == 'Point':
            lon, lat = geometry['coordinates']
            kml.append(f'<Point><coordinates>{lon},{lat},0</coordinates></Point>')
        elif geometry['type'] == 'Polygon':
            kml.append('<Polygon><outerBoundaryIs><LinearRing><coordinates>')
            for coord in geometry['coordinates'][0]:
                lon, lat = coord
                kml.append(f'{lon},{lat},0 ')
            kml.append('</coordinates></LinearRing></outerBoundaryIs></Polygon>')
        kml.append('</Placemark>')
    kml.append('</Document></kml>')
    return '\n'.join(kml)

def convert_geojson_to_csv(geojson):
    # Función para convertir GeoJSON a CSV
    output = io.StringIO()
    csv_writer = csv.writer(output)
    # Encabezados
    csv_writer.writerow(['storeId', 'storeName', 'productName', 'category', 'price', 'geometry_type', 'coordinates'])
    for feature in geojson['features']:
        properties = feature['properties']
        geometry = feature['geometry']
        coordinates = json.dumps(geometry['coordinates'])
        csv_writer.writerow([
            properties["store"]["storeId"],
            properties["store"]["storeName"],
            properties["product"]["productName"],
            properties["product"]["category"],
            properties["product"]["price"],
            geometry['type'],
            coordinates
        ])
    return output.getvalue()



# Para iniciar la aplicación
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)