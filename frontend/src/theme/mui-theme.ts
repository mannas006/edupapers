import { createTheme } from '@mui/material/styles';

// Custom color palette
const baseColors = {
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
};

// Function to create theme based on mode
export const createAppTheme = (isDarkMode: boolean) => {
  return createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      ...baseColors,
      background: {
        default: isDarkMode ? '#0F172A' : '#F8FAFC',
        paper: isDarkMode ? '#1E293B' : '#FFFFFF',
      },
      text: {
        primary: isDarkMode ? '#F8FAFC' : '#0F172A',
        secondary: isDarkMode ? '#CBD5E1' : '#475569',
        disabled: isDarkMode ? '#64748B' : '#94A3B8',
      },
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
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode 
              ? 'rgba(30, 41, 59, 0.95)' // Dark slate with transparency
              : 'rgba(255, 255, 255, 0.95)', // Light white with transparency
            backdropFilter: 'blur(8px)',
            borderBottom: `1px solid ${isDarkMode ? 'rgba(203, 213, 225, 0.1)' : 'rgba(226, 232, 240, 0.8)'}`,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: isDarkMode 
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
    },
  });
};

// Default light theme for backwards compatibility
export default createAppTheme(false);
