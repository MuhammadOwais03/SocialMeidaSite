import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import { LikePostRequest, get_token, fetchingCommentPost, AddComment, get_all_friends_request, followRequest } from './server-requests';
import download from './download.jpeg';
import './Home.css';
import useWebSocket from './useWebSockets.js';
import { Friends } from './Friends.js';


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



const Comment = ({ comment, commentId }) => {
    
   
    console.log(comment)
    
    let time = timeSince(comment.created_at)

    

    return (
        <div className="comment">
            <div className="comment-header">
                <img src={`http://127.0.0.1:8000${comment.user_profile.profile_picture}`} alt="" width="40px" height="40px" />
                <h5>{comment.user_profile.user.username}</h5>
            </div>
            <div className="comment-main">
                <p>{comment.content}</p>
            </div>
            <div className="comment-footer">
                <p>{comment.created_at}</p>
                
            </div>
        </div>
    );
};

const Home = ({
    setTickerActive,
    posts, setPosts,
    
    checkAuthAndFetchPosts,
    authorizedUser, setTickerContent,
    setNotifyChannelCount,
    messages, followRequestData, setFollowRequestData

}) => {
    const [readMore, setReadMore] = useState(false);
    const [close, setClose] = useState("comment-not-active");
    const [isLoading, setIsLoading] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentId, setCommentId] = useState()
    // const [followRequestData, setFollowRequestData] = useState([])
    
    useEffect(()=>{

        async function getComment() {
            let get_comment_response = await fetchingCommentPost(commentId);
            return get_comment_response;
        }
        
        if (commentId) {
            getComment().then(
                (data) => {
                    console.log(data)
                    setComments(data)
                    // setCommentId()
                    comments.map(comment=>{
                        console.log(comment)
                    })
                }  
    
            ).catch(
                (error) => console.error('Error fetching comment:', error)
            );
        }

        

    }, [commentId])
        
    const removeFollowRequest = (followID) => {
        setFollowRequestData(prevFollowRequestData => prevFollowRequestData.filter(data => data.id !== followID));
    };
        

    useEffect(() => {

        

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await checkAuthAndFetchPosts();
                // Handle the response, e.g., set the posts data state here
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
                console.log(authorizedUser)
            }
        };
        const fetchRequest = async ()=>{
            setIsLoading(true);
            try {
                const response = await get_all_friends_request(authorizedUser.user.id);
                // Handle the response, e.g., set the posts data state here
                setFollowRequestData(response)
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
                console.log(followRequestData)
            }
        }

        
    
        fetchData();
        fetchRequest()
        console.log(authorizedUser)
    }, []);

    // useEffect(()=>{
    //     const fetchRequest = async ()=>{
    //         setIsLoading(true);
    //         try {
    //             const response = await get_all_friends_request(authorizedUser.user.id);
    //             // Handle the response, e.g., set the posts data state here
    //         } catch (error) {
    //             console.error('Error fetching data:', error);
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     }
    // },[authorizedUser])
    

    

    const handlePostUpdate = (postId) => {
        console.log(`Post with ID ${postId} was updated.`);
        
    };


    let caption = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos expedita molestias reiciendis fuga. Corporis ullam corrupti quae reiciendis rerum suscipit officia repellendus, optio accusantium voluptate commodi fugit officiis at excepturi!";
    
    return (
        <div className='home-container'>
            <div className="posts">
                {isLoading ? (
                    <p>Loading posts...</p>
                ) : (
                    posts.map((post, index) => (
                        <Post
                            key={post.id}
                            readMore={readMore}
                            setReadMore={setReadMore}
                            caption={caption}
                            close={close}
                            setClose={setClose}
                            post={post}
                            authorizedUser={authorizedUser}
                            // socket={socket}
                            // commentSocket={commentSocket}
                            onUpdate={() => handlePostUpdate(post.id)}
                            setTickerActive={setTickerActive}
                            setTickerContent={setTickerContent}
                            setCommentId={setCommentId}
                            setNotifyChannelCount={setNotifyChannelCount}
                            messages={messages}
                            
                           
                        />
                    ))
                )}
            </div>
            <div className={`comment-container ${close}`}>
                <div className="comment-cont">
                    
                    {comments?(comments.map(comment => (
                        <Comment key={comment.id} comment={comment} setCommentId={setCommentId} commentId={commentId} />
                    ))):("No Comment Yet")}
                </div>
                <div className='cut' onClick={() => setClose(close === "comment-active" ? "comment-not-active" : "comment-active")}>
                    <i className="fa-solid fa-x"></i>
                </div>
            </div>
            <div className="follow_container">
            {followRequestData.length > 0 ? (
                <>
                    {followRequestData.map((data, index) => (
                    <Friends key={index} data={data} removeFollowRequest={removeFollowRequest} authorizedUser={authorizedUser}/>
                    ))}
                </>
                ) : (
                ""
            )}
                    
            </div>
        </div>
    );
}


export default Home;
