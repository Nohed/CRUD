import { AppBar, Toolbar, Typography } from "@mui/material";
import WarehouseIcon from "@mui/icons-material/Warehouse";

const Header = () => {
  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "white",
      }}
    >
      <Toolbar sx={{ justifyContent: "center", gap: 1 }}>
        <Typography
          variant="h6"
          noWrap
          sx={{
            fontFamily: '"Sigmar"',
            color: (theme) => theme.palette.secondary.main,
          }}
        >
          Inventory Management
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
