import psycopg2
from psycopg2.extras import DictCursor
import os
from dotenv import load_dotenv

# Load env variables
load_dotenv()

def get_db_connection():
    """Creates and returns a new database connection."""
    try:
        return psycopg2.connect(
            dbname=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            host=os.getenv('DB_HOST'),
            port=os.getenv('DB_PORT'),
            cursor_factory=DictCursor  # Enables DictCursor for dictionary-like query results
        )
    except psycopg2.Error as e:
        print("Database connection error:", e)
        return None