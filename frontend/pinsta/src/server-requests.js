




export function checking_token() {
    let token = localStorage.getItem('accessToken')
    if (token) return true
    return false
}


export function setLocalStorage(tokenType, token) {
    localStorage.setItem(tokenType, token);
}

export function get_token(tokenType) {
    let token = localStorage.getItem(tokenType)
    return token
}


export async function getUserInfo() {
    const token = get_token('accessToken');
    if (token) {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/authenticated-user-info/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${get_token('accessToken')}`
                }
            });
            const data = await response.json();
            // console.log('Logged in user:', data);
            return data;
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    }
}
export async function checkingTokenExpired() {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/protected/', {
            method: 'GET',  // Use 'GET' since that's what your view expects
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${get_token('accessToken')}` // Set the token in the header
            }
        });

        return response.status

    } catch (error) {
        console.log('catch', error);
        return 'Something Went Wrong'; // Return 'catch' or handle the error as needed
    }
}


export async function signUp(data) {
    try {

        const response = await fetch('http://127.0.0.1:8000/api/user-registration/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });


        if (!response.ok) {
            return "Network response was not ok"
        }


        const responseData = await response.json();

        console.log(responseData)

        return responseData

        // if (responseData.ac) {
        //     setLocalStorage('accessToken', responseData.access);
        //     setLocalStorage('refreshToken', responseData.access);
        //     return true;
        // } else {

        //     return false;
        // }
    } catch (error) {

        console.error('Error during registration:', error);
        return false;
    }
}



export async function loginAuth(username, password) {

    const data = {
        username: username,
        password: password
    };

    try {

        const response = await fetch('http://127.0.0.1:8000/api/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });


        if (!response.ok) {

            return "Network response was not ok"
        }


        const responseData = await response.json();


        if (responseData.access) {
            setLocalStorage('accessToken', responseData.access);
            setLocalStorage('refreshToken', responseData.access);
            return true;
        } else {

            return false;
        }
    } catch (error) {

        console.error('Error during authentication:', error);
        return "Error Authentication";
    }
}

export async function fetchPost(postID) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/post/${postID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${get_token('accessToken')}`
            }
        });

        if (!response.ok) {
            console.error(`Failed to fetch post with ID ${postID}: ${response.status}`);
            return null; // Explicitly return null or some error value
        }

        const responseData = await response.json();
        console.log("Fetched post data:", responseData); // Log the data
        return responseData;

    } catch (error) {
        console.error("Error occurred while fetching post:", error);
        return null; // Handle fetch error by returning null or some error value
    }
}

export async function allPosts() {

    const response = await fetch('http://127.0.0.1:8000/api/post/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${get_token('accessToken')}`
        }
    })

    if (!response.ok) {
        return `Some Server Error ${response.status}`
    }

    let responseData = await response.json()
    return responseData

}

export async function LikePostRequest(post, likeType, authUserId) {

    console.log(likeType)
    if (likeType === "+") {


        const response = await fetch('http://127.0.0.1:8000/api/like/', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${get_token('accessToken')}`
            },
            body: JSON.stringify({
                'like_by': authUserId,
                "post": post
            })
        })

        if (!response.ok) {
            return 'Network not Ok'
        }

        const result = await response.json()
        console.log(result)
        return result
    }

    else if (likeType === '-') {
        const response = await fetch('http://127.0.0.1:8000/api/unlike-post/', {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${get_token('accessToken')}`
            },
            body: JSON.stringify({
                'like_by': authUserId,
                "post": post
            })
        })

        if (!response.ok) {
            return 'Network not Ok'
        }

        const result = await response.json()
        console.log(result)
        return result
    }

}


export async function fetchingCommentPost(post_id) {

    const response = await fetch(`http://127.0.0.1:8000/api/comment?post=${post_id}`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${get_token('accessToken')}`
        },
    })


    if (!response.ok) {
        return 'Network not Ok'
    }

    const result = await response.json()
    console.log(result)
    return result

}


export async function AddComment(content, comment_author, post) {
    const response = await fetch(`http://127.0.0.1:8000/api/comment/`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${get_token('accessToken')}`
        },
        body: JSON.stringify({
            "content": content,
            "comment_author": comment_author,
            "post": post
        })
    })


    if (!response.ok) {
        return 'Network not Ok'
    }

    const result = await response.json()
    console.log(result)
    return result
}



export async function SearchUsers(name) {
    const response = await fetch(`http://127.0.0.1:8000/api/search?name=${name}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${get_token('accessToken')}`
        },

    })


    if (!response.ok) {
        return 'Network not Ok'
    }

    const result = await response.json()
    console.log(result)
    return result
}

export async function getNotification(user_id, type) {
    console.log(user_id)
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/notification/?id=${user_id}&type=${type}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${get_token('accessToken')}`
            }
        });

        if (!response.ok) {
            console.error(`Network response was not ok: ${response.statusText}`);
            return 'Network not Ok';
        }

        const result = await response.json();
        console.log('Notifications:', result);
        return result;

    } catch (error) {
        console.error('Fetch error:', error);
        return 'Fetch error';
    }
}


export async function followRequest(type, auth_user, to_user) {


    let data;



    data = {
        "user": auth_user,
        "friend": to_user
    }
    let method;

    console.log(type)

    if (type === 'btn-none' || type === 'none') {
        method = "POST"
    } else if (type === 'btn-pending' || type === 'accepted') {
        method = "DELETE"
    }

    let response;
    try {
        if (method === "POST") {

            response = await fetch(`http://127.0.0.1:8000/api/friend/`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${get_token('accessToken')}`
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                console.error(`Network response was not ok: ${response.statusText}`);
                return 'Network not Ok';
            }

            const result = await response.json();
            console.log('friend-request:', result);
            return result;
        }

        else if (method === 'DELETE') {
            response = await fetch(`http://127.0.0.1:8000/api/friend/?auth_user=${auth_user}&to_user=${to_user}`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${get_token('accessToken')}`
                },

            });
            if (!response.ok) {
                // console.error(`Network response was not ok: ${response.statusText}`);
                return 'Network not Ok';
            }

            const result = await response.json();
            console.log('friend-request:', result);
            return result;
        }



    } catch (error) {
        // console.error('Fetch error:', error);
        return 'Fetch error';
    }
}


export async function get_all_friends_request(auth_user) {
    let response = await fetch(`http://127.0.0.1:8000/api/friend/?auth_user=${auth_user}`,
        {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${get_token('accessToken')}`
            }
        }

    )

    if (!response.ok) {
        // console.error(`Network response was not ok: ${response.statusText}`);
        return 'Network not Ok';
    }

    const result = await response.json();
    console.log('friend-request:', result);
    return result;
}



export async function acceptFollow(instance_id) {
    let response = await fetch(`http://127.0.0.1:8000/api/friend/${instance_id}`,
        {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${get_token('accessToken')}`
            }
        }

    )

    if (!response.ok) {
        // console.error(`Network response was not ok: ${response.statusText}`);
        return 'Network not Ok';
    }

    const result = await response.json();
    console.log('friend-request:', result);
    return result;
}


export async function get_friend_status(auth_id, req_id) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${get_token('accessToken')}`
    };
    console.log(auth_id, parseInt(req_id))
    try {
        const response1 = await fetch(`http://127.0.0.1:8000/api/search/?auth_id=${auth_id}&req_id=${parseInt(req_id)}`, {
            method: "GET",
            headers: headers
        });

        if (!response1.ok) {
            throw new Error(`Error fetching friend status: ${response1.status} ${response1.statusText}`);
        }

        const result1 = await response1.json();
        console.log(result1);

        const response2 = await fetch(`http://127.0.0.1:8000/api/user-info/${req_id}`, {
            method: "GET",
            headers: headers
        });

        if (!response2.ok) {
            throw new Error(`Error fetching user info: ${response2.status} ${response2.statusText}`);
        }

        const result2 = await response2.json();
        console.log(result2);
        const response3 = await fetch(`http://127.0.0.1:8000/api/post/?req_id=${req_id}`, {
            method: "GET",
            headers: headers
        });

        if (!response3.ok) {
            throw new Error(`Error fetching user info: ${response3.status} ${response3.statusText}`);
        }

        const result3 = await response3.json();
        console.log(result3);

        // Return the results or combine them as needed
        return { friendStatus: result1, userInfo: result2, 'post':result3 };

    } catch (error) {
        console.error(`Network request failed: ${error.message}`);
        return null; // Return null or an appropriate fallback value
    }
}


// export async function createPost(author, caption, post_image, video_file, post_type) {
    
//     // console.log(formData)
//     const response = await fetch('http://127.0.0.1:8000/api/post/', {
//         method: "POST",
//         headers: {
//             'Authorization': `Bearer ${get_token('accessToken')}`
//         },
//         body: JSON.stringify({
//             "author":author,
//             "caption":caption,
//             "post_image":post_image,
//             "video_file":video_file,
//             "post_type":post_type
//         })
//     });

//     if (!response.ok) {
//         throw new Error(`Error creating post: ${response.status} ${response.statusText}`);
//     }

//     const result = await response.json();
//     console.log(result);

//     return result;
// }


export async function createPost(formData) {
    const response = await fetch('http://127.0.0.1:8000/api/post/', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${get_token('accessToken')}`
            // No need to set 'Content-Type' header when using FormData
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error(`Error creating post: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
}
