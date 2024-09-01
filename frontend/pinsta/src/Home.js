import React, { useEffect, useState } from 'react';
import {  get_all_friends_request } from './server-requests';

import './Home.css';

import { Friends } from './Friends.js';
import Post from './Post.js';
import Comment from './Comment.js';
import { LoadingSpinner } from './LoadingSpinner.js';



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

    // async function getComment() {
    //     let get_comment_response = await fetchingCommentPost(commentId);
    //     return get_comment_response;
    // }


    useEffect(() => {
        if (messages) {
            if (messages.category === 'post_posted') {
                setPosts(prevPosts => [messages.response, ...prevPosts])
            }
        }
    }, [messages])

    

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
        const fetchRequest = async () => {
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






    const handlePostUpdate = (postId) => {
        console.log(`Post with ID ${postId} was updated.`);

    };


    let caption = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos expedita molestias reiciendis fuga. Corporis ullam corrupti quae reiciendis rerum suscipit officia repellendus, optio accusantium voluptate commodi fugit officiis at excepturi!";

    return (
        <>
        <div className='home-container'>
            <div className="posts">
                {isLoading ? (
                    <LoadingSpinner/>
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
                            // getComment={getComment}
                            // get_comments={get_comments}
                            setComments={setComments}
                            commentId={commentId}
                            comments={comments}



                        />
                    ))
                )}
            </div>
            <div className={`comment-container ${close}`}>
                <div className="comment-cont">

                    {comments ? (comments.map(comment => (
                        <Comment key={comment.id} comment={comment} setCommentId={setCommentId} commentId={commentId} />
                    ))) : ("No Comment Yet")}
                </div>
                <div className='cut' onClick={() => {setClose(close === "comment-active" ? "comment-not-active" : "comment-active"); setComments([])}}>
                    <i className="fa-solid fa-x"></i>
                </div>
            </div>
            <div className="follow_container">
                {followRequestData.length > 0 ? (
                    <>
                        {followRequestData.map((data, index) => (
                            <Friends key={index} data={data} removeFollowRequest={removeFollowRequest} authorizedUser={authorizedUser} />
                        ))}
                    </>
                ) : (
                    ""
                )}

            </div>
        </div>
        
        </>
    );
}


export default Home;
