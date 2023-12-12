import '../Styles/App.css';
import { AppNav } from './AppNav';
import {
  CssBaseline,
  ThemeProvider,
  colors,
  createTheme,
  useMediaQuery,
} from '@mui/material';
import React from 'react';
import { Home } from './Home';

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
          primary: colors.blue
        },
      }),
    [prefersDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline></CssBaseline>
      <AppNav></AppNav>
      <Home></Home>
    </ThemeProvider>
  );
}

export default App;
