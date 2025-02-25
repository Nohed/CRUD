import { useState, useEffect } from "react";
import {
  getRestockOrders,
  addRestockOrder,
  deleteRestockOrder,
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
} from "@mui/material";

export default function RestockList() {
  const [restockOrders, setRestockOrders] = useState([]);
  const [newRestock, setNewRestock] = useState({
    productId: "",
    quantity: "",
  });

  useEffect(() => {
    fetchRestockOrders();
  }, []);

  const fetchRestockOrders = async () => {
    const data = await getRestockOrders();
    setRestockOrders(data);
  };

  const handleAddRestockOrder = async () => {
    if (!newRestock.productId || !newRestock.quantity) return;
    await addRestockOrder({
      ...newRestock,
      quantity: parseInt(newRestock.quantity, 10),
    });
    setNewRestock({ productId: "", quantity: "" });
    fetchRestockOrders();
  };

  const handleDeleteRestockOrder = async (id) => {
    await deleteRestockOrder(id);
    fetchRestockOrders();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Restock Orders
      </Typography>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Product ID"
          value={newRestock.productId}
          onChange={(e) =>
            setNewRestock({ ...newRestock, productId: e.target.value })
          }
        />
        <TextField
          label="Quantity"
          type="number"
          value={newRestock.quantity}
          onChange={(e) =>
            setNewRestock({ ...newRestock, quantity: e.target.value })
          }
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddRestockOrder}
        >
          Add Restock Order
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Restock ID</TableCell>
              <TableCell>Product ID</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {restockOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.product_id}</TableCell>
                <TableCell>{order.quantity}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleDeleteRestockOrder(order.id)}
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
