import { createTheme } from "@mui/material/styles";

const FUENTE =
  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

// El esquema oscuro lo gestionan TemaScript/BotonTema con la clase `dark` en <html>.
// El selector personalizado (no empieza por ".") evita que MUI escriba sus propias clases en <html>.
export const temaMui = createTheme({
  cssVariables: { colorSchemeSelector: "html.%s" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#b45309", dark: "#92400e", contrastText: "#ffffff" },
        error: { main: "#b91c1c", dark: "#991b1b" },
        background: { default: "#faf8f5", paper: "#ffffff" },
        text: { primary: "#1c1917", secondary: "#57534e" },
        divider: "#d6d3d1",
      },
    },
    dark: {
      palette: {
        primary: { main: "#f59e0b", dark: "#fbbf24", contrastText: "#1c1917" },
        error: { main: "#fca5a5", dark: "#fecaca", contrastText: "#450a0a" },
        background: { default: "#0c0a09", paper: "#1c1917" },
        text: { primary: "#f5f5f4", secondary: "#a8a29e" },
        divider: "#44403c",
      },
    },
  },
  typography: { fontFamily: FUENTE },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: "none", fontWeight: 500 } } },
    MuiTextField: { defaultProps: { variant: "outlined", fullWidth: true } },
  },
});
