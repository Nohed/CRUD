import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Toolbar,
  Typography,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom"; // Import useLocation for active state
import MenuIcon from "@mui/icons-material/Menu";
import InventoryIcon from "@mui/icons-material/Inventory2Outlined";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ReceiptIcon from "@mui/icons-material/ReceiptOutlined";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

const drawerWidth = 240;

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const location = useLocation(); // Get current route

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: "Products", icon: <InventoryIcon />, path: "/products" },
    { text: "Sales", icon: <ReceiptIcon />, path: "/sales" },
    { text: "Restocks", icon: <ExitToAppIcon />, path: "/restocks" },
  ];

  return (
    <>
      {/* Sidebar Toggle Button */}
      <IconButton
        onClick={toggleDrawer}
        sx={{
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: 1301,
          color: "secondary.main",
          backgroundColor: "white",
          "&:hover": { backgroundColor: "primary.dark" },
        }}
      >
        {open ? <ChevronLeftIcon /> : <MenuIcon />}
      </IconButton>

      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? drawerWidth : 60,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: open ? drawerWidth : 60,
            boxSizing: "border-box",
            transition: "width 0.3s",
            backgroundColor: "white",
            color: "black",
          },
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: open ? "center" : "flex-start",
            p: 2,
          }}
        >
          {open && (
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Inventory
            </Typography>
          )}
        </Toolbar>
        <Divider />

        {/* Sidebar Items */}
        <List>
          {menuItems.map((item, index) => (
            <ListItem key={index} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                component={Link} // Use Link for navigation
                to={item.path}
                disableRipple
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  backgroundColor:
                    location.pathname === item.path
                      ? "primary.main"
                      : "transparent",
                  color: location.pathname === item.path ? "white" : "black",
                  "&:hover": {
                    backgroundColor: "primary.light",
                    color: "black",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === item.path ? "white" : "black",
                    minWidth: 0,
                    mr: open ? 2 : "auto",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {open && <ListItemText primary={item.text} />}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default Sidebar;
