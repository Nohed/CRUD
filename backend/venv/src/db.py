import psycopg2
from psycopg2.extras import DictCursor
import os
from dotenv import load_dotenv

# Load .env variables, contains database connection information
load_dotenv()

"""
- The database uses postgresql - psycopg2 is used to connect

- The function get_db_connection() is used to create a new database connection
  With the database login from environment variables

- The function returns the connection object
- DictCursor is used to return query results as dictionary objects instead of tuples
"""

def get_db_connection():
    """Creates and returns a new database connection."""
    try:
        return psycopg2.connect(
            dbname=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            host=os.getenv('DB_HOST'),
            port=os.getenv('DB_PORT'),
            cursor_factory=DictCursor
        )
    except psycopg2.Error as e:
        print("Database connection error:", e)
        return None