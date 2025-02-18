from flask import Blueprint, request, jsonify
from db import get_db_connection  # Import from db.py
import psycopg2

product_bp = Blueprint('product_bp', __name__)

@product_bp.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "Test successful"})

@product_bp.route('/', methods=['GET'])
def get_products():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500  # Handle connection failure
    
    cur = conn.cursor()
    cur.execute("SELECT id, name, price, stock FROM products;")
    products = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return jsonify([dict(p) for p in products])

@product_bp.route('/', methods=['POST'])
def add_product():
    data = request.json
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO products (name, description, price, stock) VALUES (%s, %s, %s, %s) RETURNING id;",
            (data['name'], data.get('description', ""), data['price'], data['stock'])
        )
        conn.commit()
        new_id = cur.fetchone()[0]
        cur.close()
        conn.close()
        return jsonify({"message": "Product added", "id": new_id}), 201
    except psycopg2.Error as e:
        conn.rollback()  # Rollback in case of an error
        cur.close()
        conn.close()
        return jsonify({"error": str(e)}), 500

@product_bp.route('/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    data = request.json
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cur = conn.cursor()
    try:
        cur.execute(
            "UPDATE products SET name = %s, description = %s, price = %s, stock = %s WHERE id = %s RETURNING id;",
            (data['name'], data.get('description', ""), data['price'], data['stock'], product_id)
        )
        updated = cur.fetchone()
        if updated:
            conn.commit()
            cur.close()
            conn.close()
            return jsonify({"message": "Product updated"})
        else:
            cur.close()
            conn.close()
            return jsonify({"error": "Product not found"}), 404
    except psycopg2.Error as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": str(e)}), 500

@product_bp.route('/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cur = conn.cursor()
    cur.execute("DELETE FROM products WHERE id = %s RETURNING id;", (product_id,))
    deleted = cur.fetchone()
    
    if deleted:
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Product deleted"})
    else:
        cur.close()
        conn.close()
        return jsonify({"error": "Product not found"}), 404