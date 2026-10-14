import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    text: {
      primary: '#0f172a',
      secondary: '#334155',
      disabled: '#64748b',
    },
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { color: '#0f172a', fontWeight: 700 },
    h2: { color: '#0f172a', fontWeight: 700 },
    h3: { color: '#0f172a', fontWeight: 700 },
    h4: { color: '#0f172a', fontWeight: 700 },
    h5: { color: '#0f172a', fontWeight: 600 },
    h6: { color: '#0f172a', fontWeight: 600 },
    subtitle1: { color: '#334155' },
    subtitle2: { color: '#334155' },
    body1: { color: '#0f172a' },
    body2: { color: '#334155' },
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#0f172a',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          color: '#0f172a',
        },
        head: {
          color: '#0f172a',
          fontWeight: 700,
        },
        body: {
          color: '#1e293b',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          color: '#0f172a',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

export default theme;