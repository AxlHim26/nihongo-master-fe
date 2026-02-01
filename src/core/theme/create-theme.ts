import { createTheme, type PaletteMode } from "@mui/material/styles";

const paletteTokens = {
  light: {
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#64748b",
    },
    divider: "#e2e8f0",
  },
  dark: {
    background: {
      default: "#0b1020",
      paper: "#0f172a",
    },
    text: {
      primary: "#e2e8f0",
      secondary: "#94a3b8",
    },
    divider: "#1e293b",
  },
} satisfies Record<PaletteMode, Record<string, unknown>>;

const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    primary: {
      main: "#2563eb",
    },
    secondary: {
      main: "#9333ea",
    },
    background: paletteTokens[mode].background,
    text: paletteTokens[mode].text,
    divider: paletteTokens[mode].divider,
  },
  typography: {
    fontFamily: "var(--font-roboto), ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: paletteTokens[mode].background.default,
          color: paletteTokens[mode].text.primary,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 10,
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

export const createAppTheme = (mode: PaletteMode) => createTheme(getDesignTokens(mode));
