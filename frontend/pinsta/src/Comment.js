import React from 'react';
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
        return differenceInDays === 1 ? `${differenceInDays} day` : `${differenceInDays} days`;
    } else if (differenceInHours > 0) {
        return differenceInDays === 1 ? `${differenceInDays} hour` : `${differenceInDays} hours`;
    } else {
        return differenceInDays === 1 ? `${differenceInDays} minute` : `${differenceInDays} minutes`;
    }
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


export default Comment;