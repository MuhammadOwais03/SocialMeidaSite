import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from "react-router-dom";
import { get_token, fetchingCommentPost, get_all_friends_request, fetchPost } from './server-requests';
import { Friends } from './Friends.js';
import Post from './Post.js';
import Comment from './Comment.js';

export const HomePost = ({
    setTickerActive,
    checkAuthAndFetchPosts,
    authorizedUser,
    setTickerContent,
    setNotifyChannelCount,
    messages,
    followRequestData,
    setFollowRequestData
}) => {
    const { postID } = useParams();
    const [readMore, setReadMore] = useState(false);
    const [close, setClose] = useState("comment-not-active");
    const [isLoading, setIsLoading] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentId, setCommentId] = useState();
    const [posts, setPosts] = useState("");

    const location = useLocation();

    useEffect(()=>{
        
        setTickerActive('ticker-not-active')
    }, [location.pathname])

    useEffect(() => {
        async function post() {
            let response = await fetchPost(postID)
            console.log(response)
            setPosts(response)
            console.log(posts)
        }
        post()
        console.log(followRequestData)
    }, [postID]);
    
    // useEffect(() => {
    //     if (commentId) {
    //         const getComment = async () => {
    //             try {
    //                 const data = await fetchingCommentPost(commentId);
    //                 setComments(data);
    //             } catch (error) {
    //                 console.error('Error fetching comment:', error);
    //             }
    //         };

    //         getComment();
    //     }
    // }, [commentId]);

    const removeFollowRequest = (followID) => {
        setFollowRequestData(prevFollowRequestData =>
            prevFollowRequestData.filter(data => data.id !== followID)
        );
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
            }
        };

        const fetchRequest = async () => {
            setIsLoading(true);
            try {
                const response = await get_all_friends_request(authorizedUser.user.id);
                setFollowRequestData(response);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        fetchRequest();
    }, [authorizedUser, setFollowRequestData]);

    const handlePostUpdate = (postId) => {
        console.log(`Post with ID ${postId} was updated.`);
    };

    const caption = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos expedita molestias reiciendis fuga. Corporis ullam corrupti quae reiciendis rerum suscipit officia repellendus, optio accusantium voluptate commodi fugit officiis at excepturi!";

    return (
        <div className='home-container'>
            <div className="posts">
                {isLoading ? (
                    <p>Loading posts...</p>
                ) : (
                    posts && (
                        <Post
                            key={posts.id}
                            readMore={readMore}
                            setReadMore={setReadMore}
                            caption={caption}
                            close={close}
                            setClose={setClose}
                            post={posts}
                            authorizedUser={authorizedUser}
                            onUpdate={() => handlePostUpdate(posts.id)}
                            setTickerActive={setTickerActive}
                            setTickerContent={setTickerContent}
                            setCommentId={setCommentId}
                            setNotifyChannelCount={setNotifyChannelCount}
                            messages={messages}
                            setComments={setComments}
                            commentId={commentId}
                            comments={comments}
                        />
                    )
                    
                )}
            </div>

            <div className={`comment-container ${close}`}>
                <div className="comment-cont">
                    {comments.length > 0 ? (
                        comments.map(comment => (
                            <Comment key={comment.id} comment={comment} setCommentId={setCommentId} commentId={commentId} />
                        ))
                    ) : (
                        <p>No Comment Yet</p>
                    )}
                </div>
                <div className='cut' onClick={() => setClose(close === "comment-active" ? "comment-not-active" : "comment-active")}>
                    <i className="fa-solid fa-x"></i>
                </div>
            </div>
            <div className="follow_container">
                {/* {followRequestData.length > 0 ? (
                    followRequestData.map((data, index) => (
                        <Friends key={index} data={data} removeFollowRequest={removeFollowRequest} authorizedUser={authorizedUser} />
                    ))
                ) : null} */}
            </div>
        </div>
    );
};
