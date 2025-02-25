from flask import Blueprint, request, jsonify
from db import get_db_connection  # Import from db.py
import psycopg2


restock_bp = Blueprint('restock_bp', __name__)

@restock_bp.route('/', methods=['GET'])
def get_restock_orders():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, product_id, quantity, status, order_date FROM restock_orders;")
    orders = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify([dict(o) for o in orders])

@restock_bp.route('/', methods=['POST'])
def place_restock_order():
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()

    # Check if product exists
    cur.execute("SELECT id FROM products WHERE id = %s;", (data['product_id'],))
    product = cur.fetchone()

    if not product:
        return jsonify({"error": "Product not found"}), 404

    cur.execute(
        "INSERT INTO restock_orders (product_id, quantity, status) VALUES (%s, %s, 'pending') RETURNING id;",
        (data['product_id'], data['quantity'])
    )

    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Restock order placed"}), 201

@restock_bp.route('/<int:order_id>', methods=['PUT'])
def update_restock_order(order_id):
    conn = get_db_connection()
    cur = conn.cursor()

    # Get order details
    cur.execute("SELECT product_id, quantity FROM restock_orders WHERE id = %s AND status = 'pending';", (order_id,))
    order = cur.fetchone()

    if not order:
        return jsonify({"error": "Order not found or already completed"}), 404

    # Update stock
    cur.execute("UPDATE products SET stock = stock + %s WHERE id = %s;", (order['quantity'], order['product_id']))

    # Mark order as completed
    cur.execute("UPDATE restock_orders SET status = 'completed' WHERE id = %s;", (order_id,))

    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Restock order completed"}), 200

@restock_bp.route('/<int:order_id>', methods=['DELETE'])
def delete_restock_order(order_id):
    conn = get_db_connection()
    cur = conn.cursor()

    # Check if order exists and is pending
    cur.execute("SELECT id FROM restock_orders WHERE id = %s AND status = 'pending';", (order_id,))
    order = cur.fetchone()

    if not order:
        cur.close()
        conn.close()
        return jsonify({"error": "Order not found or already processed"}), 404

    # Delete the order
    cur.execute("DELETE FROM restock_orders WHERE id = %s;", (order_id,))

    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Restock order deleted"}), 200
