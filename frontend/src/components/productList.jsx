import { useState, useEffect } from "react";
import {
  getProducts,
  addProduct,
  deleteProduct,
  addSale,
  updateProduct,
  addRestockOrder,
  getSales,
  deleteSale,
} from "../api/api";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

// State management
export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
  });

  // States
  const [editProduct, setEditProduct] = useState(null);
  const [restockProduct, setRestockProduct] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState("");
  const [sellProduct, setSellProduct] = useState(null);
  const [sellQuantity, setSellQuantity] = useState("");
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);
  const [error, setError] = useState(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState(null);
  const [relatedSales, setRelatedSales] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // react hooks, load products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // ------------------- API function Calls -------------------

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error("Fetch products failed: ", err);
      setError("Could not load products.");
    }
  };

  // Add a new product
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) return; // Make sure fields are filled

    try {
      await addProduct({
        ...newProduct,
        // Convert price and stock to numbers
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock, 10),
      });
      setNewProduct({ name: "", description: "", price: "", stock: "" }); // Clear form
      setAddProductDialogOpen(false);
      fetchProducts(); // Get new products
    } catch (err) {
      console.error("Failed to add product: ", err);
      setError("Failed to add product.");
    }
  };

  // From a ID, delete product
  const handleDeleteProduct = async (id) => {
    try {
      setIsDeleting(true);
      await deleteProduct(id);
      fetchProducts();
      setDeleteConfirmProduct(null);
      setIsDeleting(false);
    } catch (err) {
      setIsDeleting(false);

      // The product has existing sales and cannot be directly removed
      if (
        err.isApiError &&
        err.status === 400 &&
        err.data.error?.includes("has existing sales")
      ) {
        try {
          // If the product has sales, try to get sales to show related sales
          const salesData = await getSales();
          const productSales = salesData.filter(
            (sale) => sale.product_id === id
          );
          setRelatedSales(productSales);
        } catch (salesErr) {
          setError("Failed to fetch related sales data");
          setDeleteConfirmProduct(null);
        }
      } else {
        // Unexpected error occured, prob network / timeout
        setError(err.data?.error || "Failed to delete product");
        setDeleteConfirmProduct(null);
      }
    }
  };
  // Deletes the product along with all related sales
  const handleDeleteWithSales = async () => {
    if (!deleteConfirmProduct) return;

    try {
      setIsDeleting(true);

      // Delete related sales
      for (const sale of relatedSales) {
        await deleteSale(sale.id);
      }

      // Delete the product
      await deleteProduct(deleteConfirmProduct.id);

      setIsDeleting(false);
      setDeleteConfirmProduct(null);
      setRelatedSales([]);
      fetchProducts();
    } catch (err) {
      setIsDeleting(false);
      setError(err.data?.error || "Failed to delete sales or product");
    }
  };
  // init deletion
  const initiateDelete = (product) => {
    setRelatedSales([]);
    setDeleteConfirmProduct(product);
  };
  // Record a sale
  const handleRecordSale = async () => {
    if (!sellProduct || !sellQuantity) return;
    const quantity = parseInt(sellQuantity, 10);
    if (quantity <= 0) return;

    try {
      await addSale({
        product_id: sellProduct.id,
        quantity,
        sale_date: new Date().toISOString(),
      });

      setSellProduct(null);
      setSellQuantity("");
      fetchProducts(); // Refresh product list to update stock
    } catch (err) {
      console.error("Failed to record sale:", err);
      setError("Failed to record sale. Please try again.");
    }
  };

  // Start editing a product
  const handleEditProduct = (product) => {
    setEditProduct({ ...product }); // Open edit dialog with current product data
  };

  // save changes to product
  const handleSaveEdit = async () => {
    if (!editProduct) return;

    try {
      await updateProduct(editProduct.id, {
        name: editProduct.name,
        description: editProduct.description,
        price: parseFloat(editProduct.price),
        stock: parseInt(editProduct.stock, 10),
      });

      setEditProduct(null);
      fetchProducts();
    } catch (err) {
      console.error("Failed to update product:", err);
      setError("Failed to update product. Please try again.");
    }
  };
  // Create a restock order
  const handleRestock = async () => {
    if (!restockProduct || !restockQuantity) return;

    try {
      await addRestockOrder({
        product_id: restockProduct.id,
        quantity: parseInt(restockQuantity, 10),
        restock_date: new Date().toISOString(),
      });

      setRestockProduct(null);
      setRestockQuantity("");
      fetchProducts();
    } catch (err) {
      console.error("Failed to restock product:", err);
      setError("Failed to restock product. Please try again.");
    }
  };

  const openAddProductDialog = () => {
    setNewProduct({ name: "", description: "", price: "", stock: "" });
    setAddProductDialogOpen(true);
  };
  // Render that shit
  return (
    <Box sx={{ p: 3 }}>
      {/* Header*/}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4">Products</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={openAddProductDialog}
        >
          Add New Product
        </Button>
      </Box>
      {/* Display error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {/* Acutall table with the content*/}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products
              .sort((a, b) => a.id - b.id) // Sort by ID, lowest ID item first
              .map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    {/* Action to perform per product */}
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => {
                        setSellProduct(product);
                        setSellQuantity("");
                      }}
                    >
                      Sell
                    </Button>
                    <Button
                      variant="contained"
                      color="warning"
                      size="small"
                      sx={{ ml: 1 }}
                      onClick={() => handleEditProduct(product)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      color="info"
                      size="small"
                      sx={{ ml: 1 }}
                      onClick={() => setRestockProduct(product)}
                    >
                      Restock
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      sx={{ ml: 1 }}
                      onClick={() => initiateDelete(product)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Product Dialog */}
      <Dialog
        open={addProductDialogOpen}
        onClose={() => setAddProductDialogOpen(false)}
      >
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          {/* Add product */}
          <TextField
            label="Name"
            fullWidth
            margin="dense"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
          />
          <TextField
            label="Description"
            fullWidth
            margin="dense"
            value={newProduct.description}
            onChange={(e) =>
              setNewProduct({ ...newProduct, description: e.target.value })
            }
          />
          <TextField
            label="Price"
            type="number"
            fullWidth
            margin="dense"
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: e.target.value })
            }
          />
          <TextField
            label="Stock"
            type="number"
            fullWidth
            margin="dense"
            value={newProduct.stock}
            onChange={(e) =>
              setNewProduct({ ...newProduct, stock: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddProductDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddProduct} color="primary">
            Add Product
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editProduct} onClose={() => setEditProduct(null)}>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="dense"
            value={editProduct?.name || ""}
            onChange={(e) =>
              setEditProduct({ ...editProduct, name: e.target.value })
            }
          />
          <TextField
            label="Description"
            fullWidth
            margin="dense"
            value={editProduct?.description || ""}
            onChange={(e) =>
              setEditProduct({ ...editProduct, description: e.target.value })
            }
          />
          <TextField
            label="Price"
            type="number"
            fullWidth
            margin="dense"
            value={editProduct?.price || ""}
            onChange={(e) =>
              setEditProduct({ ...editProduct, price: e.target.value })
            }
          />
          <TextField
            label="Stock"
            type="number"
            fullWidth
            margin="dense"
            value={editProduct?.stock || ""}
            onChange={(e) =>
              setEditProduct({ ...editProduct, stock: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditProduct(null)}>Cancel</Button>
          <Button onClick={handleSaveEdit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Restock Order Dialog */}
      <Dialog open={!!restockProduct} onClose={() => setRestockProduct(null)}>
        <DialogTitle>Restock Product</DialogTitle>
        <DialogContent>
          <TextField
            label="Quantity"
            type="number"
            fullWidth
            margin="dense"
            value={restockQuantity}
            onChange={(e) => setRestockQuantity(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestockProduct(null)}>Cancel</Button>
          <Button onClick={handleRestock} color="primary">
            Restock
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sell Product Dialog */}
      <Dialog open={!!sellProduct} onClose={() => setSellProduct(null)}>
        <DialogTitle>Sell Product</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            {sellProduct?.name} - Current Stock: {sellProduct?.stock}
          </Typography>
          <TextField
            label="Quantity"
            type="number"
            fullWidth
            margin="dense"
            value={sellQuantity}
            onChange={(e) => setSellQuantity(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSellProduct(null)}>Cancel</Button>
          <Button onClick={handleRecordSale} color="primary">
            Sell
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmProduct}
        onClose={() => {
          setDeleteConfirmProduct(null);
          setRelatedSales([]);
        }}
      >
        <DialogTitle>
          {relatedSales.length > 0 ? "Cannot Delete Product" : "Confirm Delete"}
        </DialogTitle>
        <DialogContent>
          {relatedSales.length > 0 ? (
            <>
              <Alert severity="warning" sx={{ mb: 2 }}>
                This product has {relatedSales.length} related sales and cannot
                be deleted directly.
              </Alert>
              <Typography variant="body1" gutterBottom>
                Product: {deleteConfirmProduct?.name} (ID:{" "}
                {deleteConfirmProduct?.id})
              </Typography>
              <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
                Related Sales:
              </Typography>
              <List dense>
                {relatedSales.map((sale) => (
                  <ListItem key={sale.id}>
                    <ListItemText
                      primary={`Sale #${sale.id}`}
                      secondary={`Date: ${new Date(
                        sale.sale_date
                      ).toLocaleDateString()} - Quantity: ${sale.quantity}`}
                    />
                  </ListItem>
                ))}
              </List>
              <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                If you still want to delete this product, all sales will also be
                deleted{" "}
              </Typography>
            </>
          ) : (
            <Typography variant="body1">
              Are you sure you want to delete "{deleteConfirmProduct?.name}"?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteConfirmProduct(null);
              setRelatedSales([]);
            }}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          {relatedSales.length > 0 ? (
            <Button
              onClick={handleDeleteWithSales}
              color="error"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Product & Sales"}
            </Button>
          ) : (
            <Button
              onClick={() => handleDeleteProduct(deleteConfirmProduct.id)}
              color="error"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
