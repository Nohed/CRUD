import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import Sidebar from "./components/sidebar";
import Header from "./components/header";
import ProductList from "./components/productList";
import SaleList from "./components/saleList";
import RestockList from "./components/restockList";
import Dashboard from "./components/dashboard";
import theme from "./theme/theme";
import "./App.css";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: "flex", height: "100vh" }}>
          <Sidebar />
          <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
            <Header />
            <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 20 }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/sales" element={<SaleList />} />
                <Route path="/restocks" element={<RestockList />} />
              </Routes>
            </Box>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
