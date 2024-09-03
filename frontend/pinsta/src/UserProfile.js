import React, { useEffect, useState } from 'react'
import './UserProfile.css'
import default_image from './default_image.jpg'
import { get_friend_status, acceptFollow, followRequest, changePic, getSavedPost } from './server-requests'
import { useParams } from "react-router-dom";
import RenderButton from './RenderButton';
import { LoadingSpinner } from './LoadingSpinner.js';
import { url } from './image_source.js';
// import './Sidebar.css';

export const UserProfile = ({
    authorizedUser, messages,
    setTickerActive, setTickerContent,
    setEdit, fullName, username, bio,
    profPic, setProfPic
}) => {
    const [toggleNav, setToggleNav] = useState('post')
    const [data, setData] = useState("")
    const [savedData, setSavedData] = useState({})
    const [isLoading, setIsLoading] = useState(false);
    const { id } = useParams();

    useEffect(() => {
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

        console.log(bio, "Bio")

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

    const handleFileClick = () => {
        document.getElementById('fileInput').click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        let res = await changePic(authorizedUser.user.id, file)
        setProfPic(res.serializer.profile_picture)
    };

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
            await followRequest('btn-pending', data.user_profile.id, authorizedUser.user.id);

            // Call removePost to remove this post from the UI
            // removeFollowRequest(data.id);
        } catch (error) {
            console.error('Error accepting follow request:', error);
        } finally {
            // removeFollowRequest(data.id);
        }
    };


    const handleSavedArea = async () => {
        setIsLoading(true)
        try {
            let res = await getSavedPost(authorizedUser.user.id)
            setSavedData(res)
        }

        finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <div className="user-profile-page">
                {data ? (
                    <>
                        <div className="user-profile-page-header">
                            <div className="user-profile-page-header-img">
                                {authorizedUser.user.id !== data.friendStatus.friend_request_profile.id ? (
                                    <>
                                        <img
                                            src={data.friendStatus.friend_request_profile.profile_picture
                                                ? `${url}${data.friendStatus.friend_request_profile.profile_picture}`
                                                : default_image}
                                            alt=""
                                        />
                                    </>
                                ) : (
                                    <>
                                        {profPic !== "" ? <img
                                            src={`${url}${profPic}`}
                                            alt=""
                                        /> : (
                                            <img
                                                src={data.friendStatus.friend_request_profile.profile_picture
                                                    ? `${url}${data.friendStatus.friend_request_profile.profile_picture}`
                                                    : default_image}
                                                alt=""
                                            />
                                        )}


                                        <div className="profile-pic-chage-hover-container">
                                            <div className="camera">
                                                <input
                                                    type="file"
                                                    id="fileInput"
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                    onChange={handleFileChange}

                                                />
                                                <i class="fa-solid fa-camera" onClick={handleFileClick}></i>
                                            </div>
                                        </div>
                                    </>
                                )}

                            </div>
                            <div className="user-profile-page-header-body">
                                <div className="user-profile-page-header-body-header">

                                    {/* <button>Edit Profile</button> */}
                                    {authorizedUser.user.id !== data.friendStatus.friend_request_profile.id ? (
                                        <>
                                            <h4>{data.friendStatus.friend_request_profile.full_name}</h4>
                                            {data.friendStatus.is_pending ? (
                                                <RenderButton data="requested" auth_user={authorizedUser.user.id} to_user={id} />
                                            ) : (
                                                data.friendStatus.status === 'none' ? (
                                                    <RenderButton data="none" auth_user={authorizedUser.user.id} to_user={id} />
                                                ) : (
                                                    <RenderButton data="accepted" auth_user={authorizedUser.user.id} to_user={id} />
                                                )
                                            )}
                                        </>
                                    ) : (
                                        data.friendStatus.friend_request_profile.id === authorizedUser.user.id ? (
                                            <>
                                                <h4>{fullName}</h4>
                                                <button onClick={() => setEdit('edit-active')}>Edit Profile</button>
                                            </>
                                        ) : (
                                            <div className="follow-card-body">
                                                <button onClick={() => onRejectHandle()}>Reject</button>
                                                <button onClick={() => onAcceptHandle('accept')}>Accept</button>
                                            </div>
                                        )
                                    )}



                                </div>
                                <div className="user-profile-page-header-body-post-numbers">
                                    <p>{data.post.length} posts</p>
                                    <p>{data.friendStatus.friend_request_profile.followers} followers</p>

                                </div>
                                <div className="user-profile-page-header-body-names">
                                    {authorizedUser.user.id !== data.friendStatus.friend_request_profile.id ?
                                        (<>

                                            <h4>{data.friendStatus.friend_request_profile.full_name}</h4>
                                            <p>@{data.friendStatus.friend_request_profile.username}</p>
                                        </>) : (<>

                                            <h4>{fullName}</h4>
                                            <p>@{username}</p>
                                        </>)}

                                </div>
                                <div className="user-profile-page-header-body-bio">
                                    {authorizedUser.user.id === data.friendStatus.friend_request_profile.id && bio ? (
                                        <p>{bio}</p>
                                    ) : (

                                        <p>{data.friendStatus.friend_request_profile.bio}</p>
                                    )}
                                </div>
                            </div>

                        </div>
                        <div className="user-profile-navigation">
                            <p className={`post-nav ${toggleNav === 'post' ? 'Post' : ""}`} onClick={() => setToggleNav('post')}  >Post</p>
                            {authorizedUser.user.id === data.friendStatus.friend_request_profile.id ? <p className={`saved-nav ${toggleNav === 'saved' ? 'Saved' : ""}`} onClick={() => {
                                setToggleNav('saved');
                                handleSavedArea();
                            }}>Saved</p> : ""}

                        </div>
                        <div className="user-profile-body">
                            {toggleNav === 'post' ? (
                                <>
                                    <div className="all-post-container">
                                        {data.post ? (
                                            data.post.map((p) => (
                                                p.post_type.toLowerCase() !== 'text' ? (
                                                    <div className="post-container" key={p.id}>
                                                        <div className="post-img">
                                                            {p.post_type.toLowerCase() === 'image' ?

                                                                <img src={`${url}${p.post_image}`} alt="" />
                                                                : (
                                                                    <video controls loop>
                                                                        <source src={`${url}${p.video_file}`} type="video/mp4" />
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
                            ) : (
                                <>
                                    <div className="all-post-container">
                                        {isLoading ? (
                                            <LoadingSpinner/>
                                        ) : (
                                            <>
                                                {Object.keys(savedData).length ? (
                                                    savedData.map((save) => (
                                                        save.post.post_type !== 'text' ?
                                                            <div key={save.id} className="post-container">
                                                                <div className="post-img">
                                                                    {save.post.post_type === 'image' ?

                                                                        <img src={`${url}${save.post.post_image}`} alt="" />
                                                                        :
                                                                        <video controls loop>
                                                                            <source src={`${url}${save.post.video_file}`} type="video/mp4" />
                                                                        </video>
                                                                    }
                                                                </div>
                                                            </div>
                                                            : ""
                                                    ))
                                                ) : (
                                                    <>
                                                        <p>No Saved</p>
                                                    </>
                                                )}



                                            </>
                                        )}
                                    </div>


                                </>
                            )}
                        </div>


                    </>
                ) : ""}





            </div>



        </>
    )
}
