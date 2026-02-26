import { alpha, createTheme, type PaletteMode } from "@mui/material/styles";

type ModeTokens = {
  background: {
    default: string;
    paper: string;
    surface: string;
  };
  text: {
    primary: string;
    secondary: string;
  };
  divider: string;
  primary: {
    main: string;
    hover: string;
  };
  secondary: {
    main: string;
  };
  success: string;
  warning: string;
  error: string;
  input: {
    background: string;
    border: string;
  };
};

const paletteTokens: Record<PaletteMode, ModeTokens> = {
  light: {
    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
      surface: "#F2F6FC",
    },
    text: {
      primary: "#0F172A",
      secondary: "#63738A",
    },
    divider: "#D6DFEB",
    primary: {
      main: "#60A5FA",
      hover: "#7CB7FB",
    },
    secondary: {
      main: "#94A3B8",
    },
    success: "#3DA485",
    warning: "#C99543",
    error: "#D16A6A",
    input: {
      background: "#FFFFFF",
      border: "#CCD7E6",
    },
  },
  dark: {
    background: {
      default: "#212121",
      paper: "#262626",
      surface: "#2E2E2E",
    },
    text: {
      primary: "#E5E7EB",
      secondary: "#A1A1AA",
    },
    divider: "rgba(255,255,255,0.09)",
    primary: {
      main: "#CBD5E1",
      hover: "#E2E8F0",
    },
    secondary: {
      main: "#9CA3AF",
    },
    success: "#73B49B",
    warning: "#D3A867",
    error: "#CF8A8A",
    input: {
      background: "#2A2A2A",
      border: "rgba(255,255,255,0.12)",
    },
  },
};

const getDesignTokens = (mode: PaletteMode) => {
  const tokens = paletteTokens[mode];

  return {
    palette: {
      mode,
      primary: {
        main: tokens.primary.main,
      },
      secondary: {
        main: tokens.secondary.main,
      },
      success: {
        main: tokens.success,
      },
      warning: {
        main: tokens.warning,
      },
      error: {
        main: tokens.error,
      },
      background: {
        default: tokens.background.default,
        paper: tokens.background.paper,
      },
      text: tokens.text,
      divider: tokens.divider,
      action: {
        hover: alpha(tokens.primary.main, mode === "dark" ? 0.16 : 0.1),
        selected: alpha(tokens.primary.main, mode === "dark" ? 0.22 : 0.14),
      },
    },
    typography: {
      fontFamily:
        "var(--font-roboto), ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: tokens.background.default,
            color: tokens.text.primary,
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
            borderRadius: 12,
            fontWeight: 600,
            transition: "all 180ms ease",
          },
          containedPrimary: {
            backgroundColor: tokens.primary.main,
            color: "#F8FBFF",
            "&:hover": {
              backgroundColor: tokens.primary.hover,
              boxShadow: `0 12px 24px -16px ${alpha(tokens.primary.main, 0.75)}`,
            },
          },
          outlined: {
            borderColor: tokens.divider,
            color: tokens.text.primary,
            backgroundColor: tokens.background.surface,
            "&:hover": {
              borderColor: tokens.primary.main,
              color: tokens.primary.main,
            },
          },
          text: {
            color: tokens.text.secondary,
            "&:hover": {
              color: tokens.primary.main,
              backgroundColor: alpha(tokens.primary.main, 0.12),
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: tokens.background.paper,
            border: `1px solid ${tokens.divider}`,
            boxShadow:
              mode === "dark"
                ? "0 20px 44px -34px rgba(0, 0, 0, 0.72)"
                : "0 18px 36px -30px rgba(15, 23, 42, 0.24)",
            transition: "border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: `1px solid ${tokens.divider}`,
            backgroundColor: tokens.background.paper,
            boxShadow:
              mode === "dark"
                ? "0 24px 56px -34px rgba(2, 6, 23, 0.75)"
                : "0 20px 44px -30px rgba(15, 23, 42, 0.2)",
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: tokens.input.background,
            borderRadius: 12,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: tokens.input.border,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: tokens.primary.main,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: tokens.primary.main,
              borderWidth: 2,
            },
          },
          input: {
            color: tokens.text.primary,
            "&::placeholder": {
              color: tokens.text.secondary,
              opacity: 1,
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: tokens.text.secondary,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            backgroundColor: alpha(tokens.primary.main, mode === "dark" ? 0.2 : 0.14),
          },
          bar: {
            borderRadius: 999,
            background: `linear-gradient(90deg, ${tokens.primary.main}, ${tokens.primary.hover})`,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            border: `1px solid ${tokens.divider}`,
            backgroundColor: tokens.background.surface,
            color: tokens.text.primary,
            fontWeight: 600,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          standardSuccess: {
            border: `1px solid ${alpha(tokens.success, 0.38)}`,
            color: tokens.success,
            backgroundColor: alpha(tokens.success, 0.14),
          },
          standardWarning: {
            border: `1px solid ${alpha(tokens.warning, 0.38)}`,
            color: tokens.warning,
            backgroundColor: alpha(tokens.warning, 0.14),
          },
          standardError: {
            border: `1px solid ${alpha(tokens.error, 0.38)}`,
            color: tokens.error,
            backgroundColor: alpha(tokens.error, 0.14),
          },
        },
      },
    },
  };
};

export const createAppTheme = (mode: PaletteMode) => createTheme(getDesignTokens(mode));
