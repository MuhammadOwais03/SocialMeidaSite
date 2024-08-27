import React, {useState, useEffect} from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { checking_token, checkingTokenExpired, allPosts, getUserInfo, get_token } from './server-requests';
import './App.css';

import Auth from './auth.js';
import Sidebar from './Sidebar.js';
import Home from './Home.js';
import NotificationTicker from './NotificationTicker.js';

import useWebSocket from './useWebSockets.js';

function App() {
  const location = useLocation();
  const hideSidebar = location.pathname === '/auth'; // Hide Sidebar on the Auth page
  const [posts, setPosts] = useState([]);
  const [authorizedUser, setAuthorizedUser] = useState({})
  // const [isLoading, setIsLoading] = useState(false);
  const [tickerActive, setTickerActive] = useState('ticker-not-active')
  const [tickerContent, setTickerContent] = useState("")
  const [notifyChannelCount, setNotifyChannelCount] = useState(-1)

  const { messages } = useWebSocket(`ws://127.0.0.1:8000/ws/like-notifications/?token=${get_token('accessToken')}`);
  

    const checkAuthAndFetchPosts = async () => {
      try {
          let token_check = checking_token();

          if (token_check) {
              const status_code = await checkingTokenExpired();
              if (status_code === 401) {
                  window.location.href = '/auth';
                  return;
              }

              const data = await allPosts();
              setPosts(data);
              // setIsLoading(true)
          } else {
              window.location.href = '/auth';
          }
      } catch (error) {
          console.error("Error checking token status:", error);
      } finally {
          // setIsLoading(false);
      }
  };



  useEffect(()=>{
    
    

    async function getUser() {
      let data = await getUserInfo();
      setAuthorizedUser(data)
      console.log(authorizedUser)
    }

    getUser()

  }, [])


  // console.log(location.pathname, authorizedUser )

  return (
    <div className="App">
      {!hideSidebar && <Sidebar authorizedUser={authorizedUser} notifyChannelCount={notifyChannelCount} messages={messages} />} {/* Render Sidebar only if not on the Auth page */}
      <Routes>
        {Object.keys(authorizedUser).length > 0 ? (
          <>
            <Route
              path="/"
              element={
                <Home
                  setTickerActive={setTickerActive}
                  posts={posts}
                  setPosts={setPosts}
                  checkAuthAndFetchPosts={checkAuthAndFetchPosts}
                  authorizedUser={authorizedUser}
                  setTickerContent={setTickerContent}
                  setNotifyChannelCount={setNotifyChannelCount}
                  messages={messages}
                />
              }
            />
            <Route
              path="/auth"
              element={
                <Auth
                  setTickerActive={setTickerActive}
                  setTickerContent={setTickerContent}
                  notifyChannelCount={notifyChannelCount}
                  
                />
              }
            />
          </>
        ) : (
          ""
        )}

        
        {/* Add more routes as needed */}
      </Routes>

      <NotificationTicker 
        tickerActive={tickerActive}
        setTickerActive={setTickerActive}
        tickerContent={tickerContent}
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
