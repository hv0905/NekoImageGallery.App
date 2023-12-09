import { AppBar, Box, Button, ListItemIcon, ListItemText, Menu, MenuItem, Toolbar, Typography } from "@mui/material";
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { GitHub } from "@mui/icons-material";
import { useState } from "react";

export function AppNav() {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const menuOpen = !!menuAnchor;

  const handleClose = () => {
    setMenuAnchor(null);
  };

   return (
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
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            NekoImageGallery
          </Typography>
          <Button
          id="related-site-button"
          aria-controls={menuOpen ? 'related-site-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={menuOpen ? 'true' : undefined}
          onClick={e => setMenuAnchor(e.currentTarget)}
          color="inherit"
        >
          <GitHub/>
        </Button>
        </Toolbar>
      </AppBar>
      <Menu
        id="related-site-menu"
        aria-labelledby="related-site-button"
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={handleClose}
      >
        <MenuItem component="a" onClick={handleClose} href="https://edgeneko.com" target="_blank">
          <ListItemIcon><OpenInNewIcon/></ListItemIcon>
          <ListItemText>EdgeNeko&apos;s Blog</ListItemText>
        </MenuItem>
        <MenuItem component="a" onClick={handleClose} href="https://github.com/hv0905/NekoImageGallery" target="_blank">
          <ListItemIcon><GitHub/></ListItemIcon>
          <ListItemText>Server</ListItemText>
        </MenuItem>
        <MenuItem component="a" href="https://github.com/hv0905/NekoImageGallery.App" target="_blank">
          <ListItemIcon><GitHub/></ListItemIcon>
          <ListItemText>App</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
   ) 
}