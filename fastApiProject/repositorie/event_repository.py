import psycopg2
from repositorie.product_repository import create_db_connection

class EventRepository:
    def log_event(self, event_type: str, query: str, product_id: str):
        conn = create_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO events (event_type, query, product_id) VALUES (%s, %s, %s)",
                (event_type, query, product_id)
            )
            conn.commit()
        except psycopg2.Error as e:
            print(f"Error logging event: {e}")
            raise e
