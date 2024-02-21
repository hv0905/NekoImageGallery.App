import '../Styles/App.css';
import { AppNav } from './AppNav';
import {
  CssBaseline,
  ThemeProvider,
  colors,
  createTheme,
  useMediaQuery,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Home } from './Home';
import { ApiInfo, AppSettings } from './Contexts';
import {
  AppSettingsModel,
  loadFromLocalStorage,
  saveSettingsToLocalStorage,
} from '../Models/AppSettings';
import { HomeApiResponse } from '../Models/HomeApiResponse';
import { WelcomeApi } from '../Services/WelcomeApi';

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const [appSettings, setAppSettings] = useState<AppSettingsModel>(
    loadFromLocalStorage()
  );

  const [apiInfo, setApiInfo] = useState<HomeApiResponse | null>(null);

  useEffect(() => {
    void WelcomeApi().then(resp => {
      setApiInfo(resp);
    });
  }, []);

  function handleSettingsUpdate(newval: AppSettingsModel) {
    setAppSettings(newval);
    saveSettingsToLocalStorage(newval);
  }

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
          primary: colors.blue,
        },
      }),
    [prefersDarkMode]
  );

  useEffect(() => {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', prefersDarkMode ? '#272727' : '#2196f3');
  }, [prefersDarkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline></CssBaseline>
      <AppSettings.Provider value={[appSettings, handleSettingsUpdate]}>
        <ApiInfo.Provider value={apiInfo}>
          <AppNav></AppNav>
          <Home></Home>
        </ApiInfo.Provider>
      </AppSettings.Provider>
    </ThemeProvider>
  );
}

export default App;
