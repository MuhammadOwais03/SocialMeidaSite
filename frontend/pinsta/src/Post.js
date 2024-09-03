import React, { useEffect, useState } from 'react';
import { LikePostRequest, AddComment, savedPost, fetchingCommentPost, getOnHover } from './server-requests';
import download from './download.jpeg';
import './Home.css';
import Modal from './Modal'; // Import the Modal component
import { LoadingSpinner } from './LoadingSpinner';
import { Link } from 'react-router-dom';


function timeSince(dateString) {
    const postDate = new Date(dateString);
    const now = new Date();
    const differenceInMilliseconds = now - postDate;

    const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));
    const differenceInHours = Math.floor(differenceInMilliseconds / (1000 * 60 * 60));
    const differenceInDays = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));


    if (differenceInDays === 0) {
        return differenceInHours + "hrs";
    }

    else if (differenceInDays > 0) {
        return differenceInDays === 1 ? `${differenceInDays} day` : `${differenceInDays} days`;
    } else if (differenceInHours > 0) {
        return differenceInDays === 1 ? `${differenceInDays} hour` : `${differenceInDays} hours`;
    } else {
        return differenceInDays === 1 ? `${differenceInDays} minute` : `${differenceInDays} minutes`;
    }
}

const Post = ({
    readMore, setReadMore,
    close, setClose,
    caption, post,
    authorizedUser,
    // socket,
    setTickerActive,
    setTickerContent, setCommentId,
    setNotifyChannelCount, messages,
    setComments, commentId, comments

}) => {

    //     const { messages } = useWebSocket(`ws://127.0.0.1:8000/ws/notifications/?token=${get_token('accessToken')}`);

    //   useEffect(() => {
    //     console.log(messages); // Handle WebSocket messages here if needed
    //   }, [messages]);


    const [likesCount, setLikesCount] = useState(post.likes_count);
    const [commentCount, setCommentCount] = useState(post.comment_count)
    const [likeUsers, setLikeUsers] = useState(post.like_obj);
    const [isLikeAuth, setIsLikeAuth] = useState(false);
    const [addComment, setAddComment] = useState("")
    const [fillColor, setFillColor] = useState('none');
    const [isImageOpen, setIsImageOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [onHoverData, setOnHoverData] = useState(null)
    const [hoverShow, setHoverShow] = useState('hover-not-active')

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    // const { messages } = useWebSocket(`ws://127.0.0.1:8000/ws/like-notifications/?token=${get_token('accessToken')}`);


    async function getComment() {
        let get_comment_response = await fetchingCommentPost(post.id);
        return get_comment_response;
    }


    const get_comments = () => {
        console.log("ENTERING")
        getComment().then(
            (data) => {
                console.log(data)
                setComments(data)
            }

        ).catch(
            (error) => console.error('Error fetching comment:', error)
        );
        if (commentId) {

        }
    }

    useEffect(() => {
        if (messages) { // Check if messages is defined
            console.log('Received message:', messages); // Debugging output

            if (messages.category === 'like_post' || messages.category === 'dislike') {
                if (messages.post_id === post.id) {
                    setLikesCount(messages.like_count);
                    setTickerContent(messages.message);
                    setNotifyChannelCount(messages.notification_count);
                    setTickerActive('ticker-active');
                }
            } else if (messages.category === 'comment') {
                if (messages.post === post.id) {
                    setCommentCount(messages.comment_count);
                    setTickerContent(messages.message);
                    setNotifyChannelCount(messages.notification_count);
                    setTickerActive('ticker-active');
                }

            } else if (messages.category === 'post_posted') {

                setTickerContent(messages.message);
                setNotifyChannelCount(messages.notification_count);
                setTickerActive('ticker-active');
            }

            messages = ""
        }
    }, [messages]);


    useEffect(() => {
        const userHasLiked = likeUsers.some(obj => obj.like_by === authorizedUser.user.id);
        if (userHasLiked) {
            setIsLikeAuth(true);
        }
    }, [likeUsers, authorizedUser]);

    useEffect(() => {
        if (post.saved_by_user) {
            setFillColor(true)
        }
    }, [])




    const handleLike = async () => {
        const likeAction = isLikeAuth ? "-" : "+";
        const data = await LikePostRequest(post.id, likeAction, authorizedUser.user.id);

        if (isLikeAuth) {
            setLikesCount(prevCount => prevCount - 1);
        } else {
            setLikesCount(prevCount => prevCount + 1);
        }

        console.log(likesCount)

        setIsLikeAuth(!isLikeAuth);
    };


    const handleChange = (e) => {
        setAddComment(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        async function Comment() {
            let response = await AddComment(addComment, authorizedUser.user.id, post.id)
            return response
        }

        console.log(Comment())

        setCommentCount(commentCount + 1)






        setAddComment('');
    };

    console.log(post)

    const Time = timeSince(post.created_at);


    const handleSavedClick = () => {
        console.log("ENTER")
        let saved = async () => {

            let res = await savedPost(authorizedUser.user.id, post.id)
            setFillColor(prevColor => (prevColor === 'none' ? 'black' : 'none'));

        }

        saved()




    }

    const handleImageClick = () => {
        setIsImageOpen(!isImageOpen);
    };

    let mainContent, captionContent;
    if (post.post_type === 'image') {
        mainContent =
            <img
                src={post.post_image.includes('http') ? post.post_image : `http://127.0.0.1:8000${post.post_image}`}
                alt=""
                width="750"
                height="500"
                onClick={openModal}
            />;
        captionContent = (
            <p>
                {post.caption && (
                    <>
                        <strong>galaxies: </strong>
                        {post.caption.length > 100 ? (
                            <>
                                {readMore ? post.caption : `${post.caption.slice(0, 100)}...`}
                                {!readMore && (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setReadMore(true);
                                        }}
                                    >
                                        more
                                    </button>
                                )}
                            </>
                        ) : (
                            post.caption
                        )}
                    </>
                )}
            </p>
        );
    } else if (post.post_type === 'video') {
        mainContent = (
            <video width="750" height="500" controls loop>
                <source src={post.video_file} type="video/mp4" />
            </video>
        );
        captionContent = (
            <p>
                {post.caption && (
                    <>
                        <strong>galaxies: </strong>
                        {post.caption.length > 100 ? (
                            <>
                                {readMore ? post.caption : `${post.caption.slice(0, 100)}...`}
                                {!readMore && (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setReadMore(true);
                                        }}
                                    >
                                        more
                                    </button>
                                )}
                            </>
                        ) : (
                            post.caption
                        )}
                    </>
                )}
            </p>
        );
    } else if (post.post_type === 'text') {
        mainContent = <p>{post.caption}</p>;
        captionContent = "";
    }

    const commentInputFocus = (post_id) => {
        let elements = document.querySelectorAll('.comment-input');

        elements.forEach((element) => {
            if (element.getAttribute('data-post-id') == post_id) {
                element.focus();
            }
        });
    };

    const handleMouseEnter = (e, id) => {
        console.log(e.target, id)
        setHoverShow('hover-active')
        getOnHover(id).then(
            res => setOnHoverData(res)
        )
    }

    const handleMouseLeave = () => {
        setOnHoverData(null)
        setHoverShow('hover-not-active')
    }

    return (
        <>
            <div className="post">
                <div className="post-header">
                    <img src={post.profile_picture ? `http://127.0.0.1:8000${post.profile_picture}` : download} alt="" width="40px" height="40px" />
                    {post.author.profile_picture}
                    <Link to={`/user-profile/${post.author.id}`} className="post-header-content">
                        <h4 onMouseEnter={(e) => handleMouseEnter(e, post.author.id)} onMouseLeave={handleMouseLeave}>
                            {`${post.author.first_name} ${post.author.last_name}`} <br />
                            <span>{`@${post.author.username}`}</span>
                            <div className={`hover-name-container ${hoverShow}`} >
                                {onHoverData ? (
                                    <>
                                        <div className="hover-name-header">
                                            <div className="hover-name-image">
                                                <img src={post.profile_picture ? `http://127.0.0.1:8000${post.profile_picture}` : download} alt="" />
                                                {post.author.profile_picture}
                                            </div>
                                            <Link to={`/user-profile/${post.author.id}`} className="hover-name-content">
                                                <h4>
                                                    {`${post.author.first_name} ${post.author.last_name}`} <br />
                                                    <span>{`@${post.author.username}`}</span>
                                                </h4>
                                            </Link>

                                        </div>
                                        <div className="hover-name-body">
                                            <div className="post-count">Post: {onHoverData.post_count}</div>
                                            <span className='separator-line' ></span>
                                            <div className="follower-count">Followers: {onHoverData.follower_count}</div>
                                        </div>
                                    </>
                                ) :
                                    (
                                        <LoadingSpinner />
                                    )}

                            </div>
                        </h4>

                        <p>{Time}</p>
                    </Link>
                </div>
                <div className="post-main">
                    {mainContent}
                </div>
                <div className="post-footer">
                    <div className="post-other-actions">
                        <div className="post-like-share-comment">
                            {isLikeAuth
                                ? <i className="fa-solid fa-heart" onClick={handleLike}></i>
                                : <i className="fa-regular fa-heart" onClick={handleLike}></i>}
                            <i className="fa-regular fa-message" onClick={() => commentInputFocus(post.id)}></i>
                            <i className="fa-duotone fa-solid fa-share"></i>
                        </div>
                        <svg
                            width="25"
                            height="25"
                            viewBox="0 0 24 24"
                            onClick={handleSavedClick}
                            style={{ cursor: 'pointer' }}
                        >
                            <polygon
                                fill={fillColor}
                                points="20 21 12 13.44 4 21 4 3 20 3 20 21"
                                stroke="black"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                            />
                        </svg>

                    </div>
                    <p className={`like-post-${post.id}`}>{likesCount} Likes</p>
                    <div className="post-caption">{captionContent}</div>
                    <div className="comments">
                        <p onClick={() => {
                            setClose(close === "comment-not-active" ? "comment-active" : "comment-not-active");
                            setCommentId(post.id);
                            get_comments()

                        }}>
                            {`View ${commentCount} comments`}
                        </p>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder='Add a comment...'
                                value={addComment}
                                onChange={handleChange}
                                className='comment-input'
                                data-post-id={post.id}
                            />
                            <button type='submit'>Add</button>
                        </form>

                    </div>
                </div>

            </div>


            <Modal isOpen={isModalOpen} onClose={closeModal} imageSrc={post.post_image} authorName={`${post.author.first_name} ${post.author.last_name}`} />
        </>
    );
}


export default Post;