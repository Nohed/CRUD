// src/theme.js
import { createTheme } from "@mui/material/styles";

// Create your theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#8ecae6",
    },
    secondary: {
      main: "#219ebc",
    },
    third: {
      main: "#023047",
    },
    fourth: {
      main: "#ffb703",
    },
    fifth: {
      main: "#fb8500",
    },
  },
  typography: {
    fontFamily: "Manrope, Arial, sans-serif", // Font style for your app
    h1: {
      fontSize: "2rem",
    },
    h2: {
      fontSize: "1.5rem",
    },
  },
  spacing: 4, // Controls the spacing between elements in your app (e.g., margin, padding)
});

export default theme;
