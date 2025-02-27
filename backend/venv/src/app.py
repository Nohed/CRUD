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

# Load Secret key for session management from ".env"
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

# Enable CORS - Allow Frontend on :5173 (currently) to acces the API at :5000 (currently)
CORS(app, supports_credentials=True)

# Blueprints, set each route with prefix
app.register_blueprint(product_bp, url_prefix='/products')
app.register_blueprint(sale_bp, url_prefix='/sales')
app.register_blueprint(restock_bp, url_prefix='/restock-orders')

# No data is reached from homepage. Simple message to confirm API is running
@app.route('/')
def hello_world():
	    return jsonify({"message": "Home page, welcome to the API"})

# Run the application
if __name__ == '__main__':
    app.run(debug=True) # Debug prints
