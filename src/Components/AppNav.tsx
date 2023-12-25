import {
  AppBar,
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { FilterList, FilterListOff, GitHub, Settings } from '@mui/icons-material';
import { useContext, useState } from 'react';
import { Environment } from '../environment';
import { AppSettings } from './Contexts';
import { SettingsDialog } from './SettingsModal';

export function AppNav() {
  const [appSettings, setAppSettings] = useContext(AppSettings);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [displaySettings, setDisplaySettings] = useState(false);

  const menuOpen = !!menuAnchor;

  const handleClose = () => {
    setMenuAnchor(null);
  };

  return (
    <>
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          {/* <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon></MenuIcon>
          </IconButton> */}

          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {Environment.AppDisplayName}
          </Typography>
          <IconButton
            size="large"
            color="inherit"
            aria-label="settings"
            onClick={() => setDisplaySettings(true)}
          >
            <Settings />
          </IconButton>
          <IconButton
            size="large"
            color="inherit"
            aria-label="filter"
            onClick={() =>
              setAppSettings({
                ...appSettings,
                useFilter: !appSettings.useFilter,
              })
            }
          >
            {appSettings.useFilter ? <FilterListOff /> : <FilterList />}
          </IconButton>
          <IconButton
            id="related-site-button"
            size="large"
            edge="end"
            aria-controls={menuOpen ? 'related-site-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={menuOpen ? 'true' : undefined}
            onClick={e => setMenuAnchor(e.currentTarget)}
            color="inherit"
          >
            <GitHub />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Menu
        id="related-site-menu"
        aria-labelledby="related-site-button"
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={handleClose}
      >
        <MenuItem
          component="a"
          onClick={handleClose}
          href="https://edgeneko.com"
          target="_blank"
        >
          <ListItemIcon>
            <OpenInNewIcon />
          </ListItemIcon>
          <ListItemText>EdgeNeko&apos;s Blog</ListItemText>
        </MenuItem>
        <MenuItem
          component="a"
          onClick={handleClose}
          href="https://github.com/hv0905/NekoImageGallery"
          target="_blank"
        >
          <ListItemIcon>
            <GitHub />
          </ListItemIcon>
          <ListItemText>Server</ListItemText>
        </MenuItem>
        <MenuItem
          component="a"
          href="https://github.com/hv0905/NekoImageGallery.App"
          target="_blank"
        >
          <ListItemIcon>
            <GitHub />
          </ListItemIcon>
          <ListItemText>App</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
    <SettingsDialog open={displaySettings} onClose={() => setDisplaySettings(false)}></SettingsDialog>
    </>
  );
}
