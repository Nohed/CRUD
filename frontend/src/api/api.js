import axios from "axios";

/*
 * PRODUCTS_BASE_URL = "http://127.0.0.1:5000/products";
 * Get all products by base_url
 * Post to base_url to add a new product
 * Put to base_url/{id} to update a product
 * Delete to base_url/{id} to delete a product
 */

/*
 * RESTOCK_BASE_URL = "http://127.0.0.1:5000/restock-orders";
 * Get from base_url to fetch all restock orders
 * Post to base_url to add a new restock order
 * Put to base_url/{id} to update a restock order
 * Delete to base_url/{id} to delete a restock order
 */

/*
 * SALES_BASE_URL = "http://127.0.0.1:5000/sales";
 * Get from base_url to fetch all sales
 * Post to base_url to add a new sale
 * Delete to base_url/{id} to delete a sale
 */

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"; // Use env variable or fallback

// Helper function to make API requests
/**
 *
 * @param {*} method  GET, POST, PUT, DELETE
 * @param {*} endpoint endpoint after base API_URL, such as /products/
 * @param {*} data JSON data to send with the request
 * @returns JSON response
 */
const apiRequest = async (method, endpoint, data = null) => {
  console.log('Creating REQUEST:', method.toUpperCase(), `${API_URL}${endpoint}`, data || '');
  try {
    const response = await axios({
      method,
      url: `${API_URL}${endpoint}`,
      data,
      withCredentials: true,
    });

    console.log('RESPONSE:', response.data);

    return response.data;

  }
  catch (error) {
    console.error('ERROR:', method.toUpperCase(), endpoint);

    // If there is a response, show it, 400, 500 etc
    if (error.response) {
      console.error('Server response:', error.response.status, error.response.data);

      // Pass it to UI to display what went wrong
      throw {
        status: error.response.status,
        data: error.response.data,
        isApiError: true
      };
    } else {
      // Network problem or timeout
      console.error('Network error:', error.message);
      throw error;
    }
  }
};

// ---------------------------- PRODUCTS ----------------------------
export const getProducts = () => apiRequest("get", "/products/");
export const addProduct = (product) =>
  apiRequest("post", "/products/", product);
export const updateProduct = (id, product) =>
  apiRequest("put", `/products/${id}`, product);
export const deleteProduct = (id) => apiRequest("delete", `/products/${id}`);

// ---------------------------- RESTOCK ORDERS ----------------------------
export const getRestockOrders = () => apiRequest("get", "/restock-orders/");
export const addRestockOrder = (restockOrder) =>
  apiRequest("post", "/restock-orders/", restockOrder);
export const updateRestockOrder = (id, restockOrder) =>
  apiRequest("put", `/restock-orders/${id}`, restockOrder);
export const deleteRestockOrder = (id) =>
  apiRequest("delete", `/restock-orders/${id}`);

// ---------------------------- SALES ----------------------------
export const getSales = () => apiRequest("get", "/sales/");
export const addSale = (sale) => apiRequest("post", "/sales/", sale);
export const deleteSale = (id) => apiRequest("delete", `/sales/${id}`);
