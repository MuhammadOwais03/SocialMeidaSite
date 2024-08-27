import React, { useEffect } from 'react'
import defaultImage from './default_image.jpg'
import {acceptFollow} from './server-requests.js'

export const Friends = ({data, removeFollowRequest}) => {


   

    const onAcceptHandle = async () => {
        try {
            // Execute follow request
            await acceptFollow(data.id);

            // Call removePost to remove this post from the UI
            removeFollowRequest(data.id);
        } catch (error) {
            console.error('Error accepting follow request:', error);
        }
    };

    useEffect(()=>{
        console.log(data)
        console.log(data.friend_request_profile.profile_picture)
    }, [data])
    
  return (
    <>
        <h2>Follow Requests</h2>
        <div className='follow-card' >
            <div className="follow-card-header">
                <div className="follow-card-header-img">
                    {!data.user_profile.profile_picture?
                    <img src={defaultImage} alt="" width="50px" height="50px" />:
                    (
                        <img src={`http://127.0.0.1:8000${data.user_profile.profile_picture}`} alt="" width="50px" height="50px" />
                    )    
                
                }
                    
                </div>
                <div className="follow-card-header-body">
                    <h4>{data.user_profile.full_name}</h4>
                    <p>{`@${data.user_profile.username}`}</p>
                </div>
            </div>
            <div className="follow-card-body">
                <button>Reject</button>
                <button onClick={()=>onAcceptHandle('accept')}  >Accept</button>
            </div>
        </div>
    </>
  )
}
