import React, {useState} from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';

import Auth from './auth.js';
import Sidebar from './Sidebar.js';
import Home from './Home.js';
import NotificationTicker from './NotificationTicker.js';

function App() {
  const location = useLocation();
  const hideSidebar = location.pathname === '/auth'; // Hide Sidebar on the Auth page

  const [tickerActive, setTickerActive] = useState('ticker-not-active')


  // console.log(showReplies)

  return (
    <div className="App">
      {!hideSidebar && <Sidebar />} {/* Render Sidebar only if not on the Auth page */}
      <Routes>
        <Route path="/" element={<Home setTickerActive={setTickerActive} />} />
        <Route path="/auth" element={<Auth setTickerActive={setTickerActive}/>} />
        {/* Add more routes as needed */}
      </Routes>

      <NotificationTicker 
        tickerActive={tickerActive}
        setTickerActive={setTickerActive}
      />
      


    </div>
  );
}

function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

export default AppWrapper;
