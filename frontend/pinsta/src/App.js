import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { checking_token, checkingTokenExpired, allPosts, getUserInfo, get_token, get_all_friends_request } from './server-requests';
import './App.css';

import Auth from './auth.js';
import Sidebar from './Sidebar.js';
import Home from './Home.js';
import NotificationTicker from './NotificationTicker.js';
import { HomePost } from './HomePost.js';
import { UserProfile } from './UserProfile.js';
import { CreatePost } from './CreatePost.js';
import Edit from './Edit.js';
import { Friends } from './Friends.js';
import { FriendContainer } from './FriendContainer.js';

import useWebSocket from './useWebSockets.js';

function App() {

  const navigate = useNavigate();
  const location = useLocation();
  const hideSidebar = location.pathname === '/auth'; // Hide Sidebar on the Auth page
  const [posts, setPosts] = useState([]);
  const [authorizedUser, setAuthorizedUser] = useState({})
  // const [isLoading, setIsLoading] = useState(false);
  const [tickerActive, setTickerActive] = useState('ticker-not-active')
  const [tickerContent, setTickerContent] = useState("")
  const [notifyChannelCount, setNotifyChannelCount] = useState(-1)
  const [followRequestData, setFollowRequestData] = useState([])
  const [create, setCreate] = useState('create-not-active')
  const [edit, setEdit] = useState('edit-not-active')
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [profPic, setProfPic] = useState("")

  const { messages } = useWebSocket(`ws://192.168.100.11:8000/ws/like-notifications/?token=${get_token('accessToken')}`);


  useEffect(() => {
    setEdit('edit-not-active')
    setCreate('create-not-active')
    setTickerActive('ticker-not-active')
  }, [location.pathname])

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

  function isObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value) && value !== null;
  }


 




  useEffect(() => {
    async function fetchData() {
      try {
        let token_check = await checking_token();
        console.log(token_check)
        if (token_check) {
          const status_code = await checkingTokenExpired();
          console.log(status_code)
          if (status_code === 401) {
            // Redirect to /auth without a full page reload
            console.log(status_code)
            return navigate('/auth');;
          }

          // Fetch user info if token is valid
          let data = await getUserInfo();

          if (isObject(data)) {
            setAuthorizedUser(data);
          }
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (isObject(authorizedUser) && Object.keys(authorizedUser).length > 0) {
      setFullName(authorizedUser.user.first_name + " " + authorizedUser.user.last_name)
      setUsername(authorizedUser.user.username)
      setBio(authorizedUser.user.bio)
      setProfPic(authorizedUser.profile_picture)
      console.log(authorizedUser)
    }

  }, [authorizedUser])




  // console.log(location.pathname, authorizedUser )

  return (
    <div className="App">
      {Object.keys(authorizedUser).length ? (
        !hideSidebar && <Sidebar
          authorizedUser={authorizedUser}
          notifyChannelCount={notifyChannelCount}
          messages={messages}
          setTickerActive={setTickerActive}
          setTickerContent={setTickerContent}
          followRequestData={followRequestData}
          setFollowRequestData={setFollowRequestData}
          create={create}
          setCreate={setCreate}
          profPic={profPic}
          setProfPic={setProfPic}
        />
      ) : (
        ""
      )}
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
                  followRequestData={followRequestData}
                  setFollowRequestData={setFollowRequestData}
                />
              }
            />
            <Route
              path='/:postID'
              element={
                <HomePost
                  setTickerActive={setTickerActive}
                  checkAuthAndFetchPosts={checkAuthAndFetchPosts}
                  authorizedUser={authorizedUser}
                  setTickerContent={setTickerContent}
                  setNotifyChannelCount={setNotifyChannelCount}
                  messages={messages}
                  followRequestData={followRequestData}
                  setFollowRequestData={setFollowRequestData}
                />
              }

            />
            <Route
              path='/user-profile/:id'
              element={
                <UserProfile

                  authorizedUser={authorizedUser}
                  messages={messages}
                  setTickerActive={setTickerActive}
                  setTickerContent={setTickerContent}
                  setEdit={setEdit}
                  fullName={fullName}
                  username={username}
                  bio={bio}
                  profPic={profPic}
                  setProfPic={setProfPic}

                />
              }

            />

            <Route
              path='/friends/'
              element={
                <FriendContainer
                  followRequestData={followRequestData}
                  setFollowRequestData={setFollowRequestData}
                  authorizedUser={authorizedUser}
                
                />
              }

            />



          </>
        ) : (
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
        )}


        {/* Add more routes as needed */}
      </Routes>

      <NotificationTicker
        tickerActive={tickerActive}
        setTickerActive={setTickerActive}
        tickerContent={tickerContent}
      />
      {Object.keys(authorizedUser).length > 0 ? (
        <>
          <CreatePost create={create} setCreate={setCreate} authorizedUser={authorizedUser} setPosts={setPosts} />
          <Edit
            edit={edit}
            setEdit={setEdit}
            authorizedUser={authorizedUser}
            setFullName={setFullName}
            setUsername={setUsername}
            setBio={setBio}
            fullName={fullName}
            username={username}
            bio={bio}
            setTickerActive={setTickerActive}
            setTickerContent={setTickerContent}
          />
        </>
      ) : (
        ""
      )}

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
