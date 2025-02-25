import { AppBar, Toolbar, Typography } from "@mui/material";
import WarehouseIcon from "@mui/icons-material/Warehouse"; // Import the Warehouse icon

const Header = () => {
  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "white", // Set the background to white
      }}
    >
      <Toolbar sx={{ justifyContent: "center", gap: 1 }}>
        <Typography
          variant="h6"
          noWrap
          sx={{
            fontFamily: '"Sigmar"',
            color: (theme) => theme.palette.secondary.main, // Use the primary color for text
          }}
        >
          Inventory Management
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
