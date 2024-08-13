import React, { useState } from 'react';
import download from './download.jpeg';
import './Home.css';




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

const Home = () => {
    let [readMore, setReadMore] = useState(false);
    let [close, setClose] = useState("comment-not-active")
    const [comments, setComments] = useState([
        // Example comment data
        {
            id: 1,
            author: 'Owais',
            content: 'Lorem ipsum dolor sit amet...',
            time: '1w',
            replies: [
                {
                    id: 2,
                    author: 'Ali',
                    content: 'Lorem ipsum dolor sit amet...',
                    time: '2d',
                    replies: [
                        {
                            id: 3,
                            author: 'Ahmed',
                            content: 'Lorem ipsum dolor sit...',
                            time: '1d',
                        }
                    ]
                }
            ]
        }
    ]);

    const handleAddReply = (commentId, replyContent) => {
        console.log('Adding reply to commentId:', commentId);
        console.log('Reply content:', replyContent);

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

    return (
        <>
            <div className='home-container'>
                <div className="posts">
                    <div className="post">
                        <div className="post-header">
                            <img src={download} alt="" width="40px" height="40px" />
                            <div className="post-header-content">
                                <h4>Galaxies</h4>
                                <p>1h</p>
                            </div>
                        </div>
                        <div className="post-main">
                            <video width="750" height="500" controls autoPlay loop>
                                <source src="" type="video/mp4" />
                            </video>
                        </div>
                        <div className="post-footer">
                            <div className="post-other-actions">
                                <div className="post-like-share-comment">
                                    <i className="fa-regular fa-message"></i>
                                    <i className="fa-regular fa-heart"></i>
                                    <i className="fa-regular fa-heart"></i>
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
                            <p>133 Likes</p>
                            <div className="post-caption">
                                <p><strong>galaxies: </strong>
                                    {readMore ? caption : `${caption.slice(0, 100)}...`}
                                    {!readMore && (
                                        <a href="#" onClick={(e) => {
                                            e.preventDefault();
                                            setReadMore(true);
                                        }}>more</a>
                                    )}
                                </p>
                            </div>
                            <div className="comments">
                                <p onClick={()=>setClose(close === "comment-not-active"?"comment-active":"comment-not-active")}>View 10 comments</p>
                                <input type="text" placeholder='Add a comment...' />
                            </div>
                        </div>
                    </div>
                    <div className="post">
                        <div className="post-header">
                            <img src={download} alt="" width="40px" height="40px" />
                            <div className="post-header-content">
                                <h4>Galaxies</h4>
                                <p>1h</p>
                            </div>
                        </div>
                        <div className="post-main">
                            <video width="750" height="500" controls autoPlay loop>
                                <source src="" type="video/mp4" />
                            </video>
                        </div>
                        <div className="post-footer">
                            <div className="post-other-actions">
                                <div className="post-like-share-comment">
                                    <i className="fa-regular fa-message"></i>
                                    <i className="fa-regular fa-heart"></i>
                                    <i className="fa-regular fa-heart"></i>
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
                            <p>133 Likes</p>
                            <div className="post-caption">
                                <p><strong>galaxies: </strong>
                                    {readMore ? caption : `${caption.slice(0, 100)}...`}
                                    {!readMore && (
                                        <a href="#" onClick={(e) => {
                                            e.preventDefault();
                                            setReadMore(true);
                                        }}>more</a>
                                    )}
                                </p>
                            </div>
                            <div className="comments">
                                <p onClick={()=>setClose(close === "comment-not-active"?"comment-active":"comment-not-active")}>View 10 comments</p>
                                <input type="text" placeholder='Add a comment...' />
                            </div>
                        </div>
                    </div>
                    <div className="post">
                        <div className="post-header">
                            <img src={download} alt="" width="40px" height="40px" />
                            <div className="post-header-content">
                                <h4>Galaxies</h4>
                                <p>1h</p>
                            </div>
                        </div>
                        <div className="post-main">
                            <video width="750" height="500" controls autoPlay loop>
                                <source src="" type="video/mp4" />
                            </video>
                        </div>
                        <div className="post-footer">
                            <div className="post-other-actions">
                                <div className="post-like-share-comment">
                                    <i className="fa-regular fa-message"></i>
                                    <i className="fa-regular fa-heart"></i>
                                    <i className="fa-regular fa-heart"></i>
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
                            <p>133 Likes</p>
                            <div className="post-caption">
                                <p><strong>galaxies: </strong>
                                    {readMore ? caption : `${caption.slice(0, 100)}...`}
                                    {!readMore && (
                                        <a href="#" onClick={(e) => {
                                            e.preventDefault();
                                            setReadMore(true);
                                        }}>more</a>
                                    )}
                                </p>
                            </div>
                            <div className="comments">
                                <p onClick={()=>setClose(close === "comment-not-active"?"comment-active":"comment-not-active")}>View 10 comments</p>
                                <input type="text" placeholder='Add a comment...' />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`comment-container ${close}`}>
                <div className="comment-cont">
                    {comments.map(comment => (
                        <Comment key={comment.id} comment={comment} onAddReply={handleAddReply} />
                    ))}
                </div>
                <div className='cut' onClick={()=>setClose(close === "comment-active"?"comment-not-active":"comment-active")}><i class="fa-solid fa-x"></i></div>
            </div>
        </>
    );
}

export default Home;
