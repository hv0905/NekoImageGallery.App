import { AppBar, Box, Button, IconButton, Toolbar, Typography } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

export function AppNav() {
   return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon></MenuIcon>
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            NekoImageGallery
          </Typography>
          <Button color="inherit" href="https://edgeneko.com" target="_blank"><OpenInNewIcon></OpenInNewIcon>EdgeNeko&apos;s Blog</Button>
        </Toolbar>
      </AppBar>
    </Box>
   ) 
}