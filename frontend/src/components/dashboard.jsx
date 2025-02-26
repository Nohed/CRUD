import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from "recharts";
import { getProducts, getSales, getRestockOrders } from "../api/api";

const Dashboard = () => {
  // State for data
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [restockOrders, setRestockOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsData, salesData, restockData] = await Promise.all([
        getProducts(),
        getSales(),
        getRestockOrders(),
      ]);

      // Ensure all data has the expected structure
      const validatedProducts = productsData.map((product) => ({
        id: product.id || 0,
        name: product.name || "Unknown Product",
        description: product.description || "",
        price: parseFloat(product.price) || 0,
        stock: parseInt(product.stock) || 0,
      }));

      const validatedSales = salesData.map((sale) => ({
        id: sale.id || 0,
        product_id: sale.product_id || 0,
        quantity: parseInt(sale.quantity) || 0,
        total_price: parseFloat(sale.total_price) || 0,
        sale_date: sale.sale_date || new Date().toISOString(),
      }));

      setProducts(validatedProducts);
      setSales(validatedSales);
      setRestockOrders(restockData || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again later.");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Calculate metrics
  const calculateMetrics = () => {
    // Total inventory value
    const totalInventoryValue = products.reduce(
      (total, product) =>
        total + parseFloat(product.price || 0) * parseInt(product.stock || 0),
      0
    );

    // Total sales value
    const totalSalesValue = sales.reduce(
      (total, sale) => total + parseFloat(sale.total_price || 0),
      0
    );

    // Low stock items (less than 10 units)
    const lowStockItems = products.filter(
      (product) => parseInt(product.stock || 0) < 10
    );

    // Pending restock orders
    const pendingRestocks = Array.isArray(restockOrders)
      ? restockOrders.filter((order) => !order.received_date)
      : [];

    return {
      totalInventoryValue,
      totalSalesValue,
      lowStockItems,
      pendingRestocks,
    };
  };

  // Prepare data for charts
  const prepareChartData = () => {
    // Top selling products
    const productSalesMap = {};

    sales.forEach((sale) => {
      const productId = sale.product_id;
      if (!productSalesMap[productId]) {
        productSalesMap[productId] = 0;
      }
      productSalesMap[productId] += parseInt(sale.quantity || 0);
    });

    const topSellingProducts = products
      .map((product) => ({
        name: (product.name || "Unknown").substring(0, 20), // Limit name length
        sales: productSalesMap[product.id] || 0,
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10); // Show top 10

    // Products by stock level
    const stockLevels = products
      .map((product) => ({
        name: (product.name || "Unknown").substring(0, 20),
        stock: parseInt(product.stock || 0),
      }))
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 10);

    return {
      topSellingProducts,
      stockLevels,
    };
  };

  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  // If loading, show loading indicator
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const metrics = calculateMetrics();
  const chartData = prepareChartData();

  // Fallbacks in case calculations fail
  const {
    totalInventoryValue = 0,
    totalSalesValue = 0,
    lowStockItems = [],
    pendingRestocks = [],
  } = metrics;

  const { topSellingProducts = [], stockLevels = [] } = chartData;

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchData}
        >
          Refresh
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Inventory Value
                  </Typography>
                  <Typography variant="h5" component="div">
                    ${totalInventoryValue.toFixed(2)}
                  </Typography>
                </Box>
                <InventoryIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Sales
                  </Typography>
                  <Typography variant="h5" component="div">
                    ${totalSalesValue.toFixed(2)}
                  </Typography>
                </Box>
                <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Low Stock Items
                  </Typography>
                  <Typography variant="h5" component="div">
                    {lowStockItems.length}
                  </Typography>
                </Box>
                <WarningIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Pending Restocks
                  </Typography>
                  <Typography variant="h5" component="div">
                    {pendingRestocks.length}
                  </Typography>
                </Box>
                <ShoppingCartIcon color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Selling Products
            </Typography>
            {topSellingProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topSellingProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <ChartTooltip />
                  <Bar dataKey="sales" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 300,
                }}
              >
                <Typography variant="body1" color="textSecondary">
                  No sales data available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Current Stock Levels
            </Typography>
            {stockLevels.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stockLevels}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <ChartTooltip />
                  <Bar dataKey="stock" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 300,
                }}
              >
                <Typography variant="body1" color="textSecondary">
                  No stock data available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Tables Row */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Low Stock Items
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Current Stock</TableCell>
                    <TableCell align="right">Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lowStockItems.map((product, index) => (
                    <TableRow
                      key={product.id || index}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {product.name || "Unknown"}
                      </TableCell>
                      <TableCell align="right">{product.stock || 0}</TableCell>
                      <TableCell align="right">
                        ${(parseFloat(product.price) || 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {lowStockItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No low stock items
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Sales
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="right">Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sales.slice(0, 5).map((sale, index) => {
                    const product = products.find(
                      (p) => p.id === sale.product_id
                    );
                    return (
                      <TableRow
                        key={sale.id || index}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {product
                            ? product.name
                            : `Product #${sale.product_id}`}
                        </TableCell>
                        <TableCell align="right">
                          {sale.quantity || 0}
                        </TableCell>
                        <TableCell align="right">
                          ${(parseFloat(sale.total_price) || 0).toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          {sale.sale_date
                            ? new Date(sale.sale_date).toLocaleDateString()
                            : "Unknown"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {sales.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No recent sales
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Error Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
