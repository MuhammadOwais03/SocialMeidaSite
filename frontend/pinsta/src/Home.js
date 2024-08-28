import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import { LikePostRequest, get_token, fetchingCommentPost, AddComment, get_all_friends_request, followRequest } from './server-requests';
import download from './download.jpeg';
import './Home.css';
import useWebSocket from './useWebSockets.js';
import { Friends } from './Friends.js';
import Post from './Post.js';
import Comment from './Comment.js';



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
