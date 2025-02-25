import { useState, useEffect } from "react";
import { getSales, addSale, deleteSale, getProducts } from "../api/api";
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
} from "@mui/material";

export default function SaleList() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState({});
  const [newSale, setNewSale] = useState({
    productId: "",
    quantity: "",
  });

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  const fetchSales = async () => {
    const data = await getSales();
    setSales(data);
  };

  const fetchProducts = async () => {
    const data = await getProducts();
    const productMap = data.reduce((map, product) => {
      map[product.id] = product.name; // Create lookup for product name
      return map;
    }, {});
    setProducts(productMap);
  };

  const handleAddSale = async () => {
    if (!newSale.productId || !newSale.quantity) return;
    await addSale({
      ...newSale,
      quantity: parseInt(newSale.quantity, 10),
    });
    setNewSale({ productId: "", quantity: "" });
    fetchSales();
  };

  const handleDeleteSale = async (id) => {
    await deleteSale(id);
    fetchSales();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Sales
      </Typography>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Product ID"
          value={newSale.productId}
          onChange={(e) =>
            setNewSale({ ...newSale, productId: e.target.value })
          }
        />
        <TextField
          label="Quantity"
          type="number"
          value={newSale.quantity}
          onChange={(e) => setNewSale({ ...newSale, quantity: e.target.value })}
        />
        <Button variant="contained" color="primary" onClick={handleAddSale}>
          Add Sale
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sale ID</TableCell>
              <TableCell>Product Name</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Sale Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{sale.id}</TableCell>
                <TableCell>{products[sale.product_id] || "Unknown"}</TableCell>
                <TableCell>{sale.quantity}</TableCell>
                <TableCell>
                  {new Date(sale.sale_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleDeleteSale(sale.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
