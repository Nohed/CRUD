import { useState, useEffect } from "react";
import {
  getProducts,
  addProduct,
  deleteProduct,
  addSale,
  updateProduct,
  addRestockOrder,
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
} from "@mui/material";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
  });
  const [editProduct, setEditProduct] = useState(null); // Holds product being edited
  const [restockProduct, setRestockProduct] = useState(null); // Holds product for restock
  const [restockQuantity, setRestockQuantity] = useState(""); // Holds restock quantity
  const [sellProduct, setSellProduct] = useState(null); // Holds product being sold
  const [sellQuantity, setSellQuantity] = useState(""); // Holds sell quantity
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false); // Controls add product dialog

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const data = await getProducts();
    setProducts(data);
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) return;
    await addProduct({
      ...newProduct,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock, 10),
    });
    setNewProduct({ name: "", description: "", price: "", stock: "" });
    setAddProductDialogOpen(false);
    fetchProducts();
  };

  const handleDeleteProduct = async (id) => {
    await deleteProduct(id);
    fetchProducts();
  };

  const handleRecordSale = async () => {
    if (!sellProduct || !sellQuantity) return;
    const quantity = parseInt(sellQuantity, 10);
    if (quantity <= 0) return;

    await addSale({
      product_id: sellProduct.id,
      quantity,
      sale_date: new Date().toISOString(),
    });

    setSellProduct(null);
    setSellQuantity("");
    fetchProducts(); // Refresh product list to update stock
  };

  const handleEditProduct = (product) => {
    setEditProduct({ ...product }); // Open edit dialog with current product data
  };

  const handleSaveEdit = async () => {
    if (!editProduct) return;

    await updateProduct(editProduct.id, {
      name: editProduct.name,
      description: editProduct.description,
      price: parseFloat(editProduct.price),
      stock: parseInt(editProduct.stock, 10),
    });

    setEditProduct(null);
    fetchProducts();
  };

  const handleRestock = async () => {
    if (!restockProduct || !restockQuantity) return;

    await addRestockOrder({
      product_id: restockProduct.id,
      quantity: parseInt(restockQuantity, 10),
      restock_date: new Date().toISOString(),
    });

    setRestockProduct(null);
    setRestockQuantity("");
    fetchProducts();
  };

  const openAddProductDialog = () => {
    setNewProduct({ name: "", description: "", price: "", stock: "" });
    setAddProductDialogOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
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
              .sort((a, b) => a.id - b.id) // Sort by product ID in ascending order
              .map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
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
                      onClick={() => handleDeleteProduct(product.id)}
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

      {/* Restock Order Dialog */}
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
    </Box>
  );
}
