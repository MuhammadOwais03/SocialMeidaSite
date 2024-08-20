import React, { useState, useEffect } from 'react';
// import { checking_token, get_token, checkingTokenExpired, allPosts } from './server-requests';
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
    caption, post
}) => {


    let Time = timeSince(post.created_at)
    let mainContent;

    let captionContent;

    if (post.post_type === 'image') {
        mainContent = (
            <img src={post.post_image} alt="" width="750" height="500" />
        );
        captionContent = (
            <p>
            {post.caption ? (
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
            ) : (
                <></>
            )}
        </p>
        )
    } else if (post.post_type === 'video') {
        mainContent = (
            <video width="750" height="500" controls autoPlay loop>
                <source src={post.post_image} type="video/mp4" />
            </video>
        );
        captionContent = (
            <p>
            {post.caption ? (
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
            ) : (
                <></>
            )}
        </p>
        )
    } else if (post.post_type === 'text') {
        mainContent = (
            <p>{post.caption}</p>
        );
        captionContent = ""
    }





    

    return (
        <div className="post">
            <div className="post-header">
                <img src={download} alt="" width="40px" height="40px" />
                <div className="post-header-content">
                    <h4>{post.author.first_name + post.author.last_name} <br />@{post.author.username} </h4>
                    <p>{Time}</p>
                </div>
            </div>
            <div className="post-main">
            {mainContent}
                
            </div>
            <div className="post-footer">
                <div className="post-other-actions">
                    <div className="post-like-share-comment">
                        <i className="fa-regular fa-heart"></i>
                        <i className="fa-regular fa-message"></i>
                        <i class="fa-duotone fa-solid fa-share"></i>
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
                <p>{post.likes_count} Likes</p>
                <div className="post-caption">
                

                </div>
                <div className="comments">
                    <p onClick={() => setClose(close === "comment-not-active" ? "comment-active" : "comment-not-active")}>
                        {`View ${post.comment_count} comments`}
                    </p>
                    <input type="text" placeholder='Add a comment...' />
                </div>
            </div>
        </div>
    );
}


const Comment = ({ comment, onAddReply }) => {
    const [showReplies, setShowReplies] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [newReplyContent, setNewReplyContent] = useState('');

    const handleReplyChange = (e) => {
        console.log(e.target.value)
        setNewReplyContent(e.target.value);
    };

    const handleAddReply = () => {
        console.log(newReplyContent)
        // handleAddReply()
        if (newReplyContent.trim()) {
            onAddReply(comment.id, newReplyContent);
            setNewReplyContent('');
            setShowReplyForm(false);
        }
        console.log(comment)
    };

    return (
        <div className="comment">
            <div className="comment-header">
                <img src={download} alt="" width="40px" height="40px" />
                <h5>{comment.author}</h5>
            </div>
            <div className="comment-main">
                <p>{comment.content}</p>
            </div>
            <div className="comment-footer">
                <p>{comment.time}</p>
                <span className="reply-toggle" onClick={() => setShowReplyForm(!showReplyForm)}>
                    Reply
                </span>
            </div>
            {showReplyForm && (
                <div className="reply-form">
                    <textarea
                        value={newReplyContent}
                        onChange={handleReplyChange}
                        placeholder="Write a reply..."
                    />
                    <button onClick={handleAddReply}>Add Reply</button>
                </div>
            )}
            <div className="view-reply">
                <span className='hr-line' onClick={() => setShowReplies(!showReplies)}>
                    {!showReplies ? "View Replies" : "Less Replies"}
                </span>
            </div>

            {showReplies && comment.replies && (
                <div className="replies">
                    {comment.replies.map(reply => (
                        <Comment key={reply.id} comment={reply} onAddReply={handleAddReply} />

                    ))}
                </div>
            )}
        </div>
    );
};

const Home = ({
    setTickerActive,
    posts, setPosts,
    
    checkAuthAndFetchPosts

}) => {
    const [readMore, setReadMore] = useState(false);
    const [close, setClose] = useState("comment-not-active");
    const [isLoading, setIsLoading] = useState(false);
    const [comments, setComments] = useState([]);
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
            }
        };
    
        fetchData();
    }, []);
    

    const handleAddReply = (commentId, replyContent) => {
        const addReplyToComment = (comments) => {
            return comments.map(comment => {
                if (comment.id === commentId) {
                    return {
                        ...comment,
                        replies: [
                            ...comment.replies,
                            {
                                id: Date.now(), // Generate a unique ID
                                author: 'New User', // Replace with current user's name
                                content: replyContent,
                                time: 'Just now',
                                replies: [] // Start with an empty array for nested replies
                            }
                        ]
                    };
                } else if (comment.replies.length > 0) {
                    return {
                        ...comment,
                        replies: addReplyToComment(comment.replies) // Recursively handle replies
                    };
                }
                return comment;
            });
        };

        setComments(addReplyToComment(comments));
    };


    let caption = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos expedita molestias reiciendis fuga. Corporis ullam corrupti quae reiciendis rerum suscipit officia repellendus, optio accusantium voluptate commodi fugit officiis at excepturi!";
    console.log(isLoading)
    return (
        <div className='home-container'>
            <div className="posts">
                {isLoading ? (
                    <p>Loading posts...</p>
                ) : (
                    posts.map((post, index) => (
                        <Post
                            key={index}
                            readMore={readMore}
                            setReadMore={setReadMore}
                            caption={caption}
                            close={close}
                            setClose={setClose}
                            post={post}
                        />
                    ))
                )}
            </div>
            <div className={`comment-container ${close}`}>
                <div className="comment-cont">
                    {comments.map(comment => (
                        <Comment key={comment.id} comment={comment} onAddReply={handleAddReply} />
                    ))}
                </div>
                <div className='cut' onClick={() => setClose(close === "comment-active" ? "comment-not-active" : "comment-active")}>
                    <i className="fa-solid fa-x"></i>
                </div>
            </div>
        </div>
    );
}


export default Home;
