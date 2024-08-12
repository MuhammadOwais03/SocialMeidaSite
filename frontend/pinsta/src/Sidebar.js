import React, { useState, useEffect } from "react";
import './Sidebar.css';
// import LoadingSpinner from './LoadingSpinner';







const Sidebar = () => {
  const [homeLogo, setHomeLogo] = useState(""); 
  const [searchLogo, setSearchLogo] = useState(""); 
  const [msgLogo, setMsgLogo] = useState(""); 
  const [notifyLogo, setNotifyLogo] = useState(""); 
  const [sidebarClass, setSidebarClass] = useState(""); 
  const [heading, setHeading] = useState("")
  const [searchContainer, setSearchContainer] = useState("search_container_not_active")
  const [inputValue, setInputValue] = useState('');
  const [moreContent, setMoreContent] = useState("more-not-active")

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
};




const handleSearch = () => {
    setLoading(true); // Start loading
    setTimeout(() => {
      // Simulate a delay
      setLoading(false); // End loading
    }, 2000); // 2 seconds delay for demonstration
  };

//   if (loading) {
//     return <LoadingSpinner />;
//   }
  const sideBarStyle = (div) => {
        if (div === "home") {
            setHomeLogo(homeLogo === "" ? "black" : "");
            setHeading("")

            if (searchLogo==='black') {
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
            
            

            if (msgLogo === "black") {
                setMsgLogo("")
            } 
            if (notifyLogo === "black") {
                setNotifyLogo("")
                // setSearchContainer(searchContainer === "search_container_active"?" search_container_not_active":"search_container_active")
                
            } else {
                setSearchContainer(searchContainer === "search_container_not_active"?"search_container_active":"search_container_not_active")
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
            
            if (searchLogo==='black') {
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
            
            // setSidebarClass(sidebarClass === "" ? "reduced-width" : "");
            
            if (searchLogo==='black') {
                setSearchLogo("")
                // setSearchContainer(searchContainer === "search_container_active"?" search_container_not_active":"search_container_active")
                
            }  else {
                setSearchContainer(searchContainer === "search_container_not_active"?"search_container_active":"search_container_not_active")
                setSidebarClass(sidebarClass === "" ? "reduced-width" : ""); 
                setHeading(heading === "" ? "pic" : "");
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

  return (
    <>
    <div className={`sidebar ${sidebarClass}`}>
        {heading === ""?(
            <h1 className="lobster-bold">Pinstagram</h1>
        ):(
            <h1 className="pic-heading"><i class="fa-brands fa-instagram"></i></h1>
        )}
      

      <div className="content_side">
        <div className="main_side">
          <div
            className="home_side side"
            onClick={() => sideBarStyle("home")}
          >
            {homeLogo === "" ? (
              <box-icon name="home-alt"></box-icon>
            ) : (
              <box-icon name="home-alt-2" type="solid"></box-icon>
            )}
            <h3>Home</h3>
          </div>
          <div className="search_side side" onClick={() => sideBarStyle("search")}>
            {searchLogo === "" ? (
              <box-icon name="search-alt-2"></box-icon>
            ) : (
              <box-icon name="search" type="solid"></box-icon>
            )}
            <h3>Search</h3>
          </div>
          <div className="message_side side" onClick={() => sideBarStyle("message")}>
            {msgLogo === "" ? (
              <i className="fa-regular fa-message"></i>
            ) : (
                <i className="fa-solid fa-message"></i>
            )}
            <h3>Messages</h3>
          </div>
          <div className="notification_side side" onClick={() => sideBarStyle("notify")}>
            {notifyLogo === "" ? (
              <i className="fa-regular fa-heart"></i>
            ) : (
                <box-icon name="heart" type="solid"></box-icon>
            )}
            <h3>Notificatons</h3>
          </div>
          <div className="profile_side side">
            <box-icon name="user-circle" type="solid"></box-icon>
            <h3>Profile</h3>
          </div>
          
        </div>
        <div className="more_side side" onClick={()=>setMoreContent(moreContent === 'more-not-active'? 'more-active':"more-not-active")}>
          <box-icon name="menu"></box-icon>
          <h3>More</h3>

            

        </div>
        
      </div>
    </div>


    <div className={`search_container ${searchContainer}`}>
        <h1>Search</h1>
        <div className="search_form">
            <box-icon name="search-alt-2" class="search_icon"></box-icon>
            <input 
                type="text" 
                value={inputValue} // Bind input value to state
                onChange={handleInputChange} // Update state on change
                placeholder="Search..."
                onKeyUp={(e) => {
                    handleSearch(); // Trigger search on Enter key press
                  }}
            />
            {/* <i class="fa-solid fa-square-xmark" onClick={()=>{
                console.log("clicked")
                setInputValue("")}}></i> */}
                {loading ? (
                    <div className="loading-spinner">
                    <div className="spinner"></div>
                    </div>
                ) : (
                    <i className="fa-solid fa-square-xmark" onClick={() => setInputValue('')}></i>
                )}
        </div>
    </div>

    <div className={`more_content ${moreContent}`}>
                <div className="more_1 more_inside">
                <i class="fa-solid fa-gear"></i>
                <h3>Settings</h3>
                </div>
                <div className="more_1 more_inside">
                <svg width="24" height="24" viewBox="0 0 24 24">
                    <polygon 
                        fill="none" 
                        points="20 21 12 13.44 4 21 4 3 20 3 20 21" 
                        stroke="currentColor" 
                        stroke-linecap="round" 
                        stroke-linejoin="round" 
                        stroke-width="2">
                    </polygon>
                    </svg>

                <h3>Saved</h3>
                </div>
                <div className="more_1 more_inside">
                <box-icon name='log-out'></box-icon>
                <h3>Log Out</h3>
                </div>
            </div>

    </>
  );
};

export default Sidebar;
