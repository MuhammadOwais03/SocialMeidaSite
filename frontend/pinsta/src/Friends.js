import React, { useEffect } from 'react'
import defaultImage from './default_image.jpg'
import {acceptFollow, followRequest} from './server-requests.js'
import { url } from './image_source.js'

export const Friends = ({data, removeFollowRequest, authorizedUser}) => {


   

    const onAcceptHandle = async () => {
        try {
            // Execute follow request
            await acceptFollow(data.id);

            // Call removePost to remove this post from the UI
            // removeFollowRequest(data.id);
        } catch (error) {
            console.error('Error accepting follow request:', error);
        } finally {
            removeFollowRequest(data.id);
        }
    };
    const onRejectHandle = async () => {
        try {
            // Execute follow request
            await followRequest('btn-pending',data.user_profile.id,authorizedUser.user.id );

            // Call removePost to remove this post from the UI
            // removeFollowRequest(data.id);
        } catch (error) {
            console.error('Error accepting follow request:', error);
        } finally {
            removeFollowRequest(data.id);
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
                        <img src={`${url}${data.user_profile.profile_picture}`} alt="" width="50px" height="50px" />
                    )    
                
                }
                    
                </div>
                <div className="follow-card-header-body">
                    <h4>{data.user_profile.full_name}</h4>
                    <p>{`@${data.user_profile.username}`}</p>
                </div>
            </div>
            <div className="follow-card-body">
                <button onClick={()=>onRejectHandle()}>Reject</button>
                <button onClick={()=>onAcceptHandle('accept')}  >Accept</button>
            </div>
        </div>
    </>
  )
}
