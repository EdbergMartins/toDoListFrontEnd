import { Box } from '@mui/material';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import FooterBar from './components/FooterBar';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Tasks from './pages/Tasks';

const App = ({ user, token, isLoggedIn }) => {

  return (
    <div>
      <NavBar />
      <Box style={{
        'height': '100%', minHeight: '690px', 'scroll': 'scrolla', paddingTop: '10px'
      }} >
        <BrowserRouter>
          <Routes>
            <Route index element={<Home />} />
            <Route path="/tasks" element={<Tasks/>} />
          </Routes>
        </BrowserRouter>
      </Box>
      <FooterBar />
    </div>
  );
};



export default App; 