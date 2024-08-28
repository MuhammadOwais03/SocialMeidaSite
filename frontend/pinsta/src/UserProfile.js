import React, {useEffect, useState} from 'react'
import './UserProfile.css'
import default_image from './default_image.jpg'
import {get_friend_status} from './server-requests'
import { useParams } from "react-router-dom";
import RenderButton from './RenderButton';

export const UserProfile = ({
    authorizedUser
}) => {
    const [toggleNav, setToggleNav] = useState('post')
    const [data, setData] = useState("")
    const { id } = useParams();

    useEffect(()=>{
        console.log(id)
        get_friend_status(authorizedUser.user.id, id)
    .then((data) => {
        setData(data)
        console.log(data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });

        
    }, [id])

  return (
    <>
        <div className="user-profile-page">

            <div className="user-profile-page-header">
                <div className="user-profile-page-header-img">
                    <img src={default_image} alt="" />
                </div>
                <div className="user-profile-page-header-body">
                    <div className="user-profile-page-header-body-header">
                        <h4>AlkylHalide</h4>
                        {/* <button>Edit Profile</button> */}
                        <RenderButton data='accepted' auth_user={authorizedUser.user.id} to_user={id} />
                    </div>
                    <div className="user-profile-page-header-body-post-numbers">
                        <p>0 posts</p>
                        <p>0 followers</p>
                        <p>0 followings</p>
                    </div>
                    <div className="user-profile-page-header-body-names">
                        <h4>Wukong</h4>
                        <p>@AlkylHalide</p>
                    </div>
                    <div className="user-profile-page-header-body-bio">
                        <p>The only limit is your imagination</p>
                    </div>
                </div>

            </div>
            <div className="user-profile-navigation">
                <p className={`post-nav ${toggleNav==='post'?'Post':""}`} onClick={()=>setToggleNav('post')}  >Post</p>
                <p className={`saved-nav ${toggleNav==='saved'?'Saved':""}`} onClick={()=>setToggleNav('saved')}>Saved</p>
            </div>
            <div className="user-profile-body">
                {toggleNav==='post'?(
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



        </div>

    
    
    </>
  )
}
