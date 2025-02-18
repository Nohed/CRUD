from flask import Flask, jsonify
from flask_cors import CORS
import os
import psycopg2

from db import get_db_connection
from dotenv import load_dotenv

# Import routes and database connection
from routes.product_routes import product_bp
from routes.sale_routes import sale_bp
from routes.restock_order_routes import restock_bp

# Load env variables
load_dotenv()

# Initialize Flask
app = Flask(__name__)

# Config
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

# Enable CORS
CORS(app)

# Register blueprints
app.register_blueprint(product_bp, url_prefix='/products')
app.register_blueprint(sale_bp, url_prefix='/sales')
app.register_blueprint(restock_bp, url_prefix='/restock-orders')

@app.route('/')
def hello_world():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO products (name, description, price, stock) VALUES (%s, %s, %s, %s) RETURNING id;",
            ("Sample Product", "This is a sample product.", 10.99, 100)
        )
        conn.commit()
        new_id = cur.fetchone()[0]
        cur.close()
        conn.close()
        return f"Hello World! New product inserted with ID: {new_id}"
    except psycopg2.Error as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": str(e)}), 500

# Run the application
if __name__ == '__main__':
    app.run(debug=True)