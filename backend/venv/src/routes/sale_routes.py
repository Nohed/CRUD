from flask import Blueprint, request, jsonify
from db import get_db_connection  # Import from db.py
import psycopg2

# -- 
# The cursor from connection object uses DictCursor to return dict object
# Routes return JSON objects
# -- 
sale_bp = Blueprint('sale_bp', __name__)

@sale_bp.route('/', methods=['GET'])
def get_sales():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, product_id, quantity, total_price, sale_date FROM sales;")
    sales = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify([dict(s) for s in sales])

@sale_bp.route('/', methods=['POST'])
def record_sale():
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()

    # Check if product exists and get stock + price
    cur.execute("SELECT stock, price FROM products WHERE id = %s;", (data['product_id'],))
    product = cur.fetchone()

    if not product:
        return jsonify({"error": "Product not found"}), 404

    if product['stock'] < data['quantity']:
        return jsonify({"error": "Not enough stock available"}), 400

    total_price = product['price'] * data['quantity']

    # Insert Sale
    cur.execute(
        "INSERT INTO sales (product_id, quantity, total_price) VALUES (%s, %s, %s) RETURNING id;",
        (data['product_id'], data['quantity'], total_price)
    )

    # Update Stock
    cur.execute("UPDATE products SET stock = stock - %s WHERE id = %s;", (data['quantity'], data['product_id']))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Sale recorded"}), 201


@sale_bp.route('/<int:sale_id>', methods=['DELETE'])
def remove_sale(sale_id):
    conn = get_db_connection()
    cur = conn.cursor()

    # Check if sale exists
    cur.execute("SELECT product_id, quantity FROM sales WHERE id = %s;", (sale_id,))
    sale = cur.fetchone()

    if not sale:
        cur.close()
        conn.close()
        return jsonify({"error": "Sale not found"}), 404

    # Restore stock
    cur.execute("UPDATE products SET stock = stock + %s WHERE id = %s;", (sale[1], sale[0]))

    # Delete sale record
    cur.execute("DELETE FROM sales WHERE id = %s;", (sale_id,))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Sale removed"}), 200
