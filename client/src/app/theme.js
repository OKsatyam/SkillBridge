import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#4338CA', light: '#6366F1', dark: '#3730A3', contrastText: '#fff' }, // indigo
    secondary: { main: '#0D9488', light: '#14B8A6', dark: '#0F766E', contrastText: '#fff' }, // teal
    background: { default: '#F9FAFB', paper: '#FFFFFF' },
    text: { primary: '#111827', secondary: '#6B7280' },
    divider: '#E5E7EB',
    success: { main: '#059669' },
    warning: { main: '#D97706' },
    error: { main: '#DC2626' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: ['Inter', 'Roboto', '-apple-system', 'Segoe UI', 'sans-serif'].join(','),
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 800, letterSpacing: '-0.02em' },
    h3: { fontWeight: 800, letterSpacing: '-0.01em' },
    h4: { fontWeight: 700, letterSpacing: '-0.01em' },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shadows: [
    'none',
    '0 1px 2px rgba(16,24,40,0.06)',
    '0 1px 3px rgba(16,24,40,0.08)',
    '0 2px 4px rgba(16,24,40,0.08)',
    '0 4px 8px rgba(16,24,40,0.08)',
    '0 4px 8px rgba(16,24,40,0.08)',
    '0 6px 12px rgba(16,24,40,0.1)',
    '0 6px 12px rgba(16,24,40,0.1)',
    '0 8px 16px rgba(16,24,40,0.1)',
    '0 8px 16px rgba(16,24,40,0.1)',
    '0 10px 20px rgba(16,24,40,0.12)',
    '0 10px 20px rgba(16,24,40,0.12)',
    '0 12px 24px rgba(16,24,40,0.12)',
    '0 12px 24px rgba(16,24,40,0.12)',
    '0 14px 28px rgba(16,24,40,0.14)',
    '0 14px 28px rgba(16,24,40,0.14)',
    '0 16px 32px rgba(16,24,40,0.14)',
    '0 16px 32px rgba(16,24,40,0.14)',
    '0 18px 36px rgba(16,24,40,0.16)',
    '0 18px 36px rgba(16,24,40,0.16)',
    '0 20px 40px rgba(16,24,40,0.16)',
    '0 20px 40px rgba(16,24,40,0.16)',
    '0 22px 44px rgba(16,24,40,0.18)',
    '0 22px 44px rgba(16,24,40,0.18)',
    '0 24px 48px rgba(16,24,40,0.18)',
    '0 24px 48px rgba(16,24,40,0.18)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#F9FAFB' },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8, paddingInline: 18, paddingBlock: 8 },
        containedPrimary: {
          '&:hover': { boxShadow: '0 4px 12px rgba(67,56,202,0.28)' },
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid #E5E7EB',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
        },
        colorDefault: { backgroundColor: '#FFFFFF' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'medium' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
    },
  },
});
