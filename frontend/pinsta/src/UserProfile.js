import React, {useEffect, useState} from 'react'
import './UserProfile.css'
import default_image from './default_image.jpg'
import {get_friend_status, acceptFollow, followRequest} from './server-requests'
import { useParams } from "react-router-dom";
import RenderButton from './RenderButton';
// import './Sidebar.css';

export const UserProfile = ({
    authorizedUser, messages,
    setTickerActive, setTickerContent
}) => {
    const [toggleNav, setToggleNav] = useState('post')
    const [data, setData] = useState("")
    const { id } = useParams();

    useEffect(()=>{
        console.log(id)
        setData("")
        get_friend_status(authorizedUser.user.id, id)
    .then((data) => {
        setData(data)
        console.log(data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });

        
    }, [id])


    useEffect(() => {
        if (messages) { // Check if messages is defined
            console.log('Received message:', messages); // Debugging output
    
            if (messages.category === 'like_post' || messages.category === 'dislike') {
                // if (messages.post_id === post.id) {
                    
                    setTickerContent(messages.message);
                    setTickerActive('ticker-active');
                // }
            } else if (messages.category === 'comment') {
                // if (messages.post === post.id) {
                    
                    setTickerContent(messages.message);
                    setTickerActive('ticker-active');
                // }
            } 
        messages = ""
        }
    }, [messages]);



    const onAcceptHandle = async () => {
        try {
            // Execute follow request
            await acceptFollow(data.id);

            // Call removePost to remove this post from the UI
            // removeFollowRequest(data.id);
        } catch (error) {
            console.error('Error accepting follow request:', error);
        } finally {
            // removeFollowRequest(data.id);
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
            // removeFollowRequest(data.id);
        }
    };

  return (
    <>
        <div className="user-profile-page">
            {data?(
                <>
                    <div className="user-profile-page-header">
                <div className="user-profile-page-header-img">

                    <img src={data.friendStatus.friend_request_profile.profile_picture?`http://127.0.0.1:8000${data.friendStatus.friend_request_profile.profile_picture}`:default_image} alt="" />
                </div>
                <div className="user-profile-page-header-body">
                    <div className="user-profile-page-header-body-header">
                        <h4>{data.friendStatus.friend_request_profile.full_name}</h4>
                        {/* <button>Edit Profile</button> */}
                        {authorizedUser.user.id !== data.friendStatus.friend_request_profile.id ? (
                            data.friendStatus.is_pending ? (
                                <RenderButton data="requested" auth_user={authorizedUser.user.id} to_user={id} />
                            ) : (
                                data.friendStatus.status==='none'?<RenderButton data="none" auth_user={authorizedUser.user.id} to_user={id} /> 
                                :
                                <RenderButton data="accepted" auth_user={authorizedUser.user.id} to_user={id} />
                                                            )
                        ) : (
                            data.friendStatus.friend_request_profile.id === data.friendStatus.friend_request_profile.user.id ?  <button>Edit Profile</button>:
                            <div className="follow-card-body">
                                <button onClick={()=>onRejectHandle()}>Reject</button>
                                <button onClick={()=>onAcceptHandle('accept')}  >Accept</button>
                            </div>
                        )}

                        
                    </div>
                    <div className="user-profile-page-header-body-post-numbers">
                        <p>{data.post.length} posts</p>
                        <p>{data.friendStatus.followers} followers</p>
                        
                    </div>
                    <div className="user-profile-page-header-body-names">
                        <h4>{data.friendStatus.friend_request_profile.full_name}</h4>
                        <p>@{data.friendStatus.friend_request_profile.username}</p>
                    </div>
                    <div className="user-profile-page-header-body-bio">
                        <p>{data.friendStatus.friend_request_profile.bio}</p>
                    </div>
                </div>

            </div>
            <div className="user-profile-navigation">
                <p className={`post-nav ${toggleNav==='post'?'Post':""}`} onClick={()=>setToggleNav('post')}  >Post</p>
                {authorizedUser.user.id===data.friendStatus.friend_request_profile.id?<p className={`saved-nav ${toggleNav==='saved'?'Saved':""}`} onClick={()=>setToggleNav('saved')}>Saved</p>:""}
                
            </div>
            <div className="user-profile-body">
                {toggleNav==='post'?(
                    <>
                        <div className="all-post-container">
                        {data.post ? (
                                data.post.map((p) => (
                                    p.post_type.toLowerCase() !== 'text' ? (
                                        <div className="post-container" key={p.id}>
                                            <div className="post-img">
                                                {p.post_type.toLowerCase()==='image'?
                                                
                                                <img src={`http://127.0.0.1:8000${p.post_image}`} alt="" />
                                                :(
                                                    <video  controls  loop>
                                                        <source src={`http://127.0.0.1:8000${p.video_file}`} type="video/mp4" />
                                                    </video>
                                                )}
                                                
                                            </div>
                                        </div>
                                    ) : null
                                ))
                            ) : (
                                "Share Photos and Videos"
                            )}

                            
                            
                        </div>
                        
                    </>
                ):(
                    <>
                        <div className="all-post-container">
                            <div className="post-container">
                                <div className="post-img">
                                    <img src={default_image} alt="" />
                                </div>
                            </div>
                            <div className="post-container">
                                <div className="post-img">
                                    <img src={default_image} alt="" />
                                </div>
                            </div>
                            <div className="post-container">
                                <div className="post-img">
                                    <img src={default_image} alt="" />
                                </div>
                            </div>
                            <div className="post-container">
                                <div className="post-img">
                                    <img src={default_image} alt="" />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
                
                
                </>
            ):""}

            



        </div>

    
    
    </>
  )
}
