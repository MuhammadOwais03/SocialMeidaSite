import React, { useEffect, useState } from 'react';
import { LikePostRequest, AddComment } from './server-requests';
import download from './download.jpeg';
import './Home.css';


function timeSince(dateString) {
    const postDate = new Date(dateString);
    const now = new Date();
    const differenceInMilliseconds = now - postDate;

    const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));
    const differenceInHours = Math.floor(differenceInMilliseconds / (1000 * 60 * 60));
    const differenceInDays = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));


    if (differenceInDays === 0) {
        return 'now';
    }

    else if (differenceInDays > 0) {
        return differenceInDays === 1? `${differenceInDays} day`:`${differenceInDays} days`;
    } else if (differenceInHours > 0) {
        return differenceInDays === 1? `${differenceInDays} hour`:`${differenceInDays} hours`;
    } else {
        return differenceInDays === 1? `${differenceInDays} minute`:`${differenceInDays} minutes`;
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
    setNotifyChannelCount, messages
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

    // const { messages } = useWebSocket(`ws://127.0.0.1:8000/ws/like-notifications/?token=${get_token('accessToken')}`);

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
            } 
        }
    }, [messages]);
    

    useEffect(() => {
        const userHasLiked = likeUsers.some(obj => obj.like_by === authorizedUser.user.id);
        if (userHasLiked) {
            setIsLikeAuth(true);
        }
    }, [likeUsers, authorizedUser]);


    

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
            let response = await AddComment(addComment, authorizedUser.user.id,post.id)
            return response
        }

        console.log(Comment())

        setCommentCount(commentCount+1)

        

        


        setAddComment(''); 
    };

    console.log(post)

    const Time = timeSince(post.created_at);

    let mainContent, captionContent;
    if (post.post_type === 'image') {
        mainContent = <img src={post.post_image} alt="" width="750" height="500" />;
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
            <video width="750" height="500" controls autoPlay loop>
                <source src={post.post_image} type="video/mp4" />
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

    return (
        <div className="post">
            <div className="post-header">
                <img src={download} alt="" width="40px" height="40px" />
                <div className="post-header-content">
                    <h4>{`${post.author.first_name} ${post.author.last_name} @${post.author.username} ${post.id}`}</h4>
                    <p>{Time}</p>
                </div>
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
                        <i className="fa-regular fa-message"></i>
                        <i className="fa-duotone fa-solid fa-share"></i>
                    </div>
                    <svg width="25" height="25" viewBox="0 0 24 24">
                        <polygon
                            fill="none"
                            points="20 21 12 13.44 4 21 4 3 20 3 20 21"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2">
                        </polygon>
                    </svg>
                </div>
                <p className={`like-post-${post.id}`}>{likesCount} Likes</p>
                <div className="post-caption">{captionContent}</div>
                <div className="comments">
                    <p onClick={() => {
                        setClose(close === "comment-not-active" ? "comment-active" : "comment-not-active");
                        setCommentId(post.id);
                    }}>
                        {`View ${commentCount} comments`}
                    </p>
                    <form onSubmit={handleSubmit}>
                        <input 
                            type="text" 
                            placeholder='Add a comment...'
                            value={addComment}
                            onChange={handleChange}
                        />
                        <button type='submit'>Add</button>
                    </form>
                    
                </div>
            </div>
        </div>
    );
}


export default Post;