# repositories/product_repository.py
import psycopg2
from typing import List, Tuple

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

class ProductRepository:
    def fetch_all_products(self) -> List[Tuple]:
        conn = create_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("""
                       SELECT p.productname, p.description, c.categoryname, s.storeName, p.price
                       FROM products p
                       JOIN categories c ON p.categoryid = c.categoryid
                       JOIN stores s ON p.storeid = s.storeid
                   """)
            return cursor.fetchall()
        except Exception as e:
            print(f"Error querying database: {e}")
            raise e

