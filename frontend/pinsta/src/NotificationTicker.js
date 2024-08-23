import React, {useState, useEffect} from 'react';



const NotificationTicker = ({
    tickerActive, setTickerActive, tickerContent
})=>{

    useEffect(()=>{
        const timeoutId = setTimeout(() => {
            setTickerActive('ticker-not-active');
        
          }, 6000);
        
         
          return () => clearTimeout(timeoutId);
    })
    

    return (
        <>
        <div className={`notify-ticker-container ${tickerActive}`}>
          <div className="notify-ticker">
            <div className="notify-ticker-sign">
              <i className="fa-solid fa-exclamation"></i>
            </div>
            <div className="notify-ticker-content">
              <p>{tickerContent}</p>
            </div>
          </div>
          <div className="loading-bar">
            <div className="bar"></div>
          </div>
      </div>
        </>
    )
}

export default NotificationTicker;