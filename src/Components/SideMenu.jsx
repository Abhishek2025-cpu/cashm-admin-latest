import React, { useState,useRef ,useEffect } from 'react';
import {Container, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, CssBaseline, Box, Switch, Tooltip, Avatar } from '@mui/material';
import { Add, Dashboard, ListAlt, CheckCircle, Group, Settings, BarChart, Logout } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { ImageListItem } from "@mui/material";
import logoImg from '../assets/cashmLogo.png';
import { Event } from '@mui/icons-material';





const drawerWidth = 240;

const SideMenu = () => {
  const [drawerOpen, setDrawerOpen] = useState(false); // Drawer open/close state
  const [darkMode, setDarkMode] = useState(false); // Dark theme state
  const navigate = useNavigate();




 

  // Toggle Drawer
  // Toggle Drawer
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };



  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Handle Logout
  const handleLogout = () => {
    sessionStorage.clear(); // Clear session storage
    navigate('/admin/login'); // Redirect to AdminLogin page
  };
 
  // Menu Items
  const menuItems = [
    { text: 'Add Agent', icon: <Add />, route: '/admin/add-agents' },
    { text: 'Dashboard', icon: <Dashboard />, route: '/admin/dashboard' },
   {text: 'Events', icon: <Event />, route: '/admin/events'},
{ text: 'Requests', icon: <ListAlt />, route: '/admin/Requests' },
    {text:'Add Balance',icon:<Add/>,route:'/admin/add-balance'},
    { text: 'Approved Requests', icon: <CheckCircle />, route: '/admin/approved-requests' },
    { text: 'User Management', icon: <Group />, route: '/user-management' },
    { text: 'Settings', icon: <Settings />, route: '/settings' },
    { text: 'Reports', icon: <BarChart />, route: '/reports' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Header */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: darkMode ? '#333' : '#1976d2', // Toggle header color
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Menu Icon */}
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer}
              sx={{ '&:focus': { outline: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            {/* Logo Image */}
           

            {/* Heading */}
        

     <h2  style={styles.header}>CashM Admin Panel</h2> 

            
          </Box>

          {/* Action Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Dark Theme Toggle */}
            <Tooltip title="Toggle Dark Mode">
              <Switch checked={darkMode} onChange={toggleDarkMode} />
            </Tooltip>

       

            {/* Logout Icon */}
            <Tooltip title="Logout">
              <IconButton color="inherit" onClick={handleLogout}>
                <Logout />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Side Menu */}
      <Drawer
        variant="persistent"
        open={drawerOpen}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            display: drawerOpen ? 'block' : 'none',
            backgroundColor: darkMode ? '#424242' : '#fff', // Toggle menu color
            color: darkMode ? '#fff' : '#000', // Toggle text color
          },
        }}
      >
        <Toolbar />
        <List>
          {menuItems.map((item) => (
            <ListItem button key={item.text} onClick={() => navigate(item.route)}>
              <ListItemIcon sx={{ color: darkMode ? '#fff' : '#000' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      {/* <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginLeft: drawerOpen ? `${drawerWidth}px` : '0',
          backgroundColor: darkMode ? '#303030' : '#f5f5f5', // Toggle content background
          color: darkMode ? '#fff' : '#000', // Toggle content text color
        }}
      > */}
        <Toolbar />
 
      </Box>
    // </Box>
  );
};

export default SideMenu;

const styles = {
  header: {
    textAlign: "center",
  
    color: "#f5f5f5",
    fontSize: "24px",
    fontWeight: "bold",
  },
};
