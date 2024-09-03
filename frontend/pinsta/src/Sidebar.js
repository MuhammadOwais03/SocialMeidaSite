import React, { useEffect, useState, useMemo } from "react";
import { SearchUsers, getNotification, followRequest, get_token } from "./server-requests";
import './Sidebar.css';
import useWebSocket from './useWebSockets.js';
import { Link } from 'react-router-dom';
import RenderButton from "./RenderButton.js";
import { LoadingSpinner } from "./LoadingSpinner.js";
import download from './download.jpeg'




const Sidebar = ({ authorizedUser,
  notifyChannelCount, messages,
  setTickerActive, setTickerContent,
  followRequestData, setFollowRequestData,
  create, setCreate, profPic, setProfPic
}) => {
  const [homeLogo, setHomeLogo] = useState("");
  const [searchLogo, setSearchLogo] = useState("");
  const [msgLogo, setMsgLogo] = useState("");
  const [notifyLogo, setNotifyLogo] = useState("");
  const [sidebarClass, setSidebarClass] = useState("");
  const [heading, setHeading] = useState("");
  const [searchContainer, setSearchContainer] = useState("search_container_not_active");
  const [inputValue, setInputValue] = useState('');
  const [moreContent, setMoreContent] = useState("more-not-active");
  const [searchList, setSearchList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notifyCont, setNotifyCont] = useState(false)
  const [notifyContent, setNotifyContent] = useState([])
  const [notificationCount, setNotificationCount] = useState(-1)


  // const { messages } = useWebSocket(`ws://127.0.0.1:8000/ws/like-notifications/?token=${get_token('accessToken')}`);

  useEffect(() => {
    console.log(messages); // Handle WebSocket messages here if needed
    if (messages) {

      if (messages.category === 'friend_request') {
        setNotificationCount(messages.notification_count)
        setTickerContent(messages.message);
        setFollowRequestData(prevFollowRequestData => [...prevFollowRequestData, messages.data])
        setTickerActive('ticker-active');
      } else if (messages.category === 'friend_accepted') {
        console.log("ENTER")
        setTickerContent(messages.message);
        setTickerActive('ticker-active');
      } else {
        setNotificationCount(messages.notification_count)
      }
    }
  }, [messages]);

  useEffect(() => {
    console.log(authorizedUser)
  }, [])


  useEffect(() => {
    if (notifyLogo === 'black') {
      console.log(notifyLogo)
      setLoading(true)
      async function notification() {
        try {
          const response = await getNotification(authorizedUser.user.id, 'content');
          setNotifyContent(response);
          console.log(notifyContent)
        } catch (error) {
          console.error('notification failed', error);
        } finally {
          setLoading(false);
          console.log(notifyContent)
        }
      }

      notification()
      setNotificationCount(0)
    }
  }, [notifyLogo])

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await SearchUsers(inputValue);
      setSearchList(response);
      console.log(searchList)
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setLoading(false);
      console.log(searchList)
    }
  };

  useEffect(() => {
    async function notification() {
      if (authorizedUser && Object.keys(authorizedUser).length !== 0) {


        try {

          const response = await getNotification(authorizedUser.user.id, 'no');
          setNotificationCount(response);
          console.log(notificationCount, response)
          console.log(authorizedUser)
        } finally {
          // setLoading(false);
          console.log(notificationCount)
        }
      }
    }
    setTimeout(() => {
      notification()
    }, 2000)



  }, [authorizedUser])




  useEffect(() => {
    console.log(notifyChannelCount)
    if (notifyChannelCount > -1) {
      setNotificationCount(notifyChannelCount)
    }
  }, [notifyChannelCount])


  const toggleSidebarState = (div) => {
    if (div === "home") {
      setHomeLogo(homeLogo === "" ? "black" : "");
      setHeading("")

      if (searchLogo === 'black') {
        setSearchLogo("")
        setSidebarClass("");
        setSearchContainer(" search_container_not_active")
      }
      if (notifyLogo === "black") {
        setNotifyLogo("")
        setSidebarClass("");
        setSearchContainer(" search_container_not_active")
      }
      if (msgLogo === "black") {
        setMsgLogo("")
      }


    } else if (div === "search") {

      setSearchLogo(searchLogo === "" ? "black" : "");

      setNotifyCont(false)

      if (msgLogo === "black") {
        setMsgLogo("")
        setSearchContainer("search_container_active")
      }
      if (notifyLogo === "black") {
        setNotifyLogo("")
        // setSearchContainer(searchContainer === "search_container_active"?" search_container_not_active":"search_container_active")
        setNotifyCont(false)

      } else {
        setSearchContainer(searchContainer === "search_container_not_active" ? "search_container_active" : "search_container_not_active")
        setSidebarClass(sidebarClass === "" ? "reduced-width" : "");
        setHeading(heading === "" ? "pic" : "");
      }
      if (homeLogo === "black") {
        setHomeLogo("")
        setSearchContainer("search_container_active")
      }

    } else if (div === 'message') {
      setMsgLogo(msgLogo === "" ? "black" : "");
      setHeading("")

      if (searchLogo === 'black') {
        setSearchLogo("")
        setSidebarClass("");
        setSearchContainer(" search_container_not_active")
      }
      if (notifyLogo === "black") {
        setNotifyLogo("")
        setSidebarClass("");
        setSearchContainer(" search_container_not_active")
      }
      if (homeLogo === "black") {
        setHomeLogo("")
      }

    } else if (div === "notify") {
      setNotifyLogo(notifyLogo === "" ? "black" : "");
      setNotifyCont(true)
      // setSidebarClass(sidebarClass === "" ? "reduced-width" : "");

      if (searchLogo === 'black') {
        setSearchLogo("")
        // setSearchContainer(searchContainer === "search_container_active"?" search_container_not_active":"search_container_active")
        setNotifyCont(true)

      } else {
        setSearchContainer(searchContainer === "search_container_not_active" ? "search_container_active" : "search_container_not_active")
        setSidebarClass(sidebarClass === "" ? "reduced-width" : "");
        setHeading(heading === "" ? "pic" : "");
        setNotifyCont(true)
      }
      if (msgLogo === "black") {
        setMsgLogo("")
        setSearchContainer("search_container_active")
      }
      if (homeLogo === "black") {
        setHomeLogo("")
        setSearchContainer("search_container_active")
      }
    }
  }











  const hasUserData = authorizedUser && authorizedUser.user;

  return (
    Object.keys(authorizedUser).length ? (
      <>
        <div className={`sidebar ${sidebarClass}`}>
          {heading === "" ? (
            <h1 className="lobster-bold">Pinstagram</h1>
          ) : (
            <h1 className="pic-heading"><i className="fa-brands fa-instagram"></i></h1>
          )}

          <div className="content_side">
            <div className="main_side">
              <Link to="/" className="home_side side" onClick={() => toggleSidebarState("home")}>
                {homeLogo === "" ? (
                  <box-icon name="home-alt"></box-icon>
                ) : (
                  <box-icon name="home-alt-2" type="solid"></box-icon>
                )}
                <h3>Home</h3>
              </Link>
              <div className="search_side side" onClick={() => toggleSidebarState("search")}>
                {searchLogo === "" ? (
                  <box-icon name="search-alt-2"></box-icon>
                ) : (
                  <box-icon name="search" type="solid"></box-icon>
                )}
                <h3>Search</h3>
              </div>
              <div className="message_side side" onClick={() => toggleSidebarState("message")}>
                {msgLogo === "" ? (
                  <i className="fa-regular fa-message"></i>
                ) : (
                  <i className="fa-solid fa-message"></i>
                )}
                <h3>Messages</h3>
              </div>
              <div className="notification_side side" onClick={() => toggleSidebarState("notify")}>
                {notifyLogo === "" ? (
                  <i className="fa-regular fa-heart"></i>
                ) : (
                  <box-icon name="heart" type="solid"></box-icon>
                )}
                <h3>Notifications</h3>
                <div className="notification-count">
                  <p>{notificationCount && notificationCount.notification_count > -1
                    ? notificationCount.notification_count
                    : notificationCount !== -1
                      ? notificationCount
                      : 0}</p>
                </div>
              </div>
              <div className="create-side side" onClick={() => { setCreate('create-active') }}>
                <i className="fa-regular fa-square-plus"></i>
                <h3>Create</h3>
              </div>
              <Link to={`/user-profile/${authorizedUser.user.id}`} className="profile_side side">
                {hasUserData ? (
                  <>
                    <img
                      src={authorizedUser.profile_picture ? `http://127.0.0.1:8000${profPic}` : 'default_profile_picture_url'}
                      alt="Profile"
                    />
                    <h3>{authorizedUser.user.username}</h3>
                  </>
                ) : (
                  <>
                    <box-icon name="user-circle" type="solid"></box-icon>
                    <h3>Profile</h3>
                  </>
                )}
              </Link>
            </div>
            <div className="more_side side" onClick={() => setMoreContent(moreContent === 'more-not-active' ? 'more-active' : 'more-not-active')}>
              <box-icon name="menu"></box-icon>
              <h3>More</h3>
            </div>
          </div>
        </div>

        <div className={`search_container ${searchContainer}`}>
          {notifyCont ? (
            <>
              {loading ? (
                <LoadingSpinner/>
              ) : (
                <>
                  <h1>Notifications</h1>
                  <div className="notification-cont">
                    {notifyContent.length > 0 ? (
                      notifyContent.map((notification) => (
                        <Link to={notification.link_to_post ? `/${notification.content_object.id}` : ""} className="notification-card" key={notification.id}>
                          <div className="notification-card-head">
                            <div className="inside-logo">
                              <img
                                src={notification.profile_picture?`http://127.0.0.1:8000${notification.profile_picture}`:download}
                                alt={notification.by_user.username}
                                width="50px"
                                height="50px"
                              />
                            </div>
                            <div className="inside-content">
                              <h5>{notification.by_user.first_name} {notification.by_user.last_name}</h5>
                              <p>@{notification.by_user.username}</p>
                            </div>
                          </div>
                          <div className="notification-card-body">
                            <p>{notification.message}</p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p>No notifications found.</p>
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <h1>Search</h1>
              <div className="search_form">
                <box-icon name="search-alt-2" className="search_icon"></box-icon>
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Search..."
                  onKeyUp={handleSearch}
                  aria-label="Search input"
                />
                {loading ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                  </div>
                ) : (
                  <i
                    className="fa-solid fa-square-xmark"
                    onClick={() => setInputValue('')}
                    aria-label="Clear search"
                  ></i>
                )}
              </div>
              {loading ? (
                <LoadingSpinner/>
              ) : (
                <div className="search-cont">
                  {searchList.length > 0 ? (
                    searchList.map((data) => (
                      <div className="inside-search-cont" key={data.username}>
                        <div className="inside-main">
                          <div className="inside-logo">
                            <img
                              src={data.profile_picture?`http://127.0.0.1:8000${data.profile_picture}`:download}
                              alt={`${data.full_name} profile`}
                              width="50px"
                              height="50px"
                            />
                          </div>
                          <div className="inside-content">
                            <Link to={`/user-profile/${data.id}`} className="inside-Name">{data.full_name}</Link>
                            <p>@{data.username}</p>
                          </div>
                        </div>
                        {/* <div className="friend-content">
                          {data.user.id === authorizedUser.user.id ? (
                            <></>
                          ) : (
                            <RenderButton data={data.friendship_status} auth_user={authorizedUser.user.id} to_user={data.id} />
                          )}
                        </div> */}
                      </div>
                    ))
                  ) : (
                    <p>No results found.</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className={`more_content ${moreContent}`}>
          <div className="more_1 more_inside">
            <i className="fa-solid fa-gear"></i>
            <h3>Settings</h3>
          </div>
          <div className="more_1 more_inside">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <polygon
                fill="none"
                points="20 21 12 13.44 4 21 4 3 20 3 20 21"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <h3>Saved</h3>
          </div>
          <div className="more_1 more_inside">
            <box-icon name="log-out"></box-icon>
            <h3>Log Out</h3>
          </div>
        </div>
      </>
    ) : (
      <></>
    )
  );
}

export default Sidebar;
