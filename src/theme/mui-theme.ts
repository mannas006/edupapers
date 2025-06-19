import { createTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// Custom color palette
const colors = {
  primary: {
    main: '#4F46E5', // Indigo
    light: '#6366F1',
    dark: '#3730A3',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#06B6D4', // Cyan
    light: '#22D3EE',
    dark: '#0891B2',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#10B981', // Emerald
    light: '#34D399',
    dark: '#059669',
  },
  warning: {
    main: '#F59E0B', // Amber
    light: '#FCD34D',
    dark: '#D97706',
  },
  error: {
    main: '#EF4444', // Red
    light: '#F87171',
    dark: '#DC2626',
  },
  background: {
    default: '#F8FAFC', // Slate 50
    paper: '#FFFFFF',
    secondary: '#F1F5F9', // Slate 100
  },
  text: {
    primary: '#0F172A', // Slate 900
    secondary: '#475569', // Slate 600
    disabled: '#94A3B8', // Slate 400
  },
  grey: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
};

// Create custom theme
export const theme = createTheme({
  palette: {
    mode: 'light',
    ...colors,
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.08)',
    '0px 1px 4px rgba(0, 0, 0, 0.1)',
    '0px 2px 8px rgba(0, 0, 0, 0.12)',
    '0px 4px 16px rgba(0, 0, 0, 0.14)',
    '0px 8px 24px rgba(0, 0, 0, 0.16)',
    '0px 12px 32px rgba(0, 0, 0, 0.18)',
    '0px 16px 40px rgba(0, 0, 0, 0.2)',
    '0px 20px 48px rgba(0, 0, 0, 0.22)',
    '0px 24px 56px rgba(0, 0, 0, 0.24)',
    ...Array(15).fill('0px 24px 56px rgba(0, 0, 0, 0.24)'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.background.default,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: colors.grey[100],
          },
          '&::-webkit-scrollbar-thumb': {
            background: colors.grey[400],
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: colors.grey[500],
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '10px 20px',
          fontSize: '0.875rem',
          fontWeight: 500,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          border: `1px solid ${colors.grey[200]}`,
          '&:hover': {
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
        elevation1: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            '& fieldset': {
              borderColor: colors.grey[300],
            },
            '&:hover fieldset': {
              borderColor: colors.grey[400],
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary.main,
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          fontWeight: 500,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          minHeight: '48px',
          '&.Mui-selected': {
            fontWeight: 600,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${colors.grey[200]}`,
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${colors.grey[200]}`,
          backgroundColor: colors.background.paper,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          margin: '2px 8px',
          '&.Mui-selected': {
            backgroundColor: alpha(colors.primary.main, 0.08),
            '&:hover': {
              backgroundColor: alpha(colors.primary.main, 0.12),
            },
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.grey[800],
          fontSize: '0.75rem',
          borderRadius: '6px',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '16px',
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiAlert-root': {
            borderRadius: '8px',
          },
        },
      },
    },
  },
});

export default theme;
