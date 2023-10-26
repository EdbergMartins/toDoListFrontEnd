import { Box } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import FooterBar from './components/FooterBar';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Tasks from './pages/Tasks';

const App = () => {
  const [tokenLoged, setTokenLoged] = useState(localStorage.getItem('token') && localStorage.getItem('token'))
  useEffect(() => {
    setTokenLoged(localStorage.getItem('token'))
  })

  return (
    <div>
      <NavBar token={tokenLoged} />
      <Box style={{
        'height': '100%', minHeight: 'calc(100vh - 149px)', 'scroll': 'scrolla', paddingTop: '10px',
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