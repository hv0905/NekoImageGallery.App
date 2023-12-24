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
import { AppSettings } from './Contexts';
import { AppSettingsModel } from '../Models/AppSettings';

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const appSettingsGroup = React.useState<AppSettingsModel>(
    new AppSettingsModel()
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
          primary: colors.blue,
        },
      }),
    [prefersDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline></CssBaseline>
      <AppSettings.Provider value={appSettingsGroup}>
        <AppNav></AppNav>
        <Home></Home>
      </AppSettings.Provider>
    </ThemeProvider>
  );
}

export default App;
