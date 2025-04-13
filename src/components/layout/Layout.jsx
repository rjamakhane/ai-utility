// PersistentDrawerLeft.js
import React, { Children } from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from './AppBar';
import Drawer from './Drawer';

export default function Layout({
    children
}) {
  return (
    <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar />
        <Drawer />
        {children}
    </Box>
  );
}