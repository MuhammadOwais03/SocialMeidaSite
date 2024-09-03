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
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                // Handle HTTP errors
                if (response.status === 401) {
                    // Unauthorized access - maybe the token is invalid or expired
                    console.error('Unauthorized access. Please log in again.');
                    
                    return response.status
                    // Optionally, redirect to the login page or clear the token
                } else if (response.status >= 500) {
                    // Server error
                    console.error('Server error. Please try again later.');
                    
                } else {
                    // Other types of errors
                    console.error('Error fetching user info:', response.statusText);
                    
                }
                return null;
            }

            const data = await response.json();
            return data;

        } catch (error) {
            // Handle network errors or other unexpected issues
            console.error('Network or unexpected error:', error);
            return null;
        }
    } else {
        // Handle the case where the token is not available
        console.error('No token found. User might not be logged in.');
        return null;
    }
}

export async function checkingTokenExpired() {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/protected/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${get_token('accessToken')}` // Set the token in the header
            }
        });

        if (response.ok) {
            return 200; // Token is valid
        } else {
            return response.status; // Return status code if response is not ok
        }
    } catch (error) {
        console.error('Error checking token status:', error);
        return 'Something Went Wrong'; // Return a generic message or handle error as needed
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

export async function changePic(id, file) {
    const formData = new FormData();
    formData.append('id', id);
    formData.append('file', file)
    formData.append('type', 'image')
    const response = await fetch(`http://127.0.0.1:8000/api/user-info/${id}/`, {
        method: 'PATCH',
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
    console.log(result)
    return result;
}


export async function editProfile(fullName, username, bio, id) {
    const response = await fetch(`http://127.0.0.1:8000/api/user-info/${id}/`,{
        method:"PATCH",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${get_token('accessToken')}`
        },
        body:JSON.stringify({
            'username':username,
            "fullName":fullName,
            "bio":bio,
            "type":"edit",
            "id":id
        })
    })

    if (!response.ok) {
        console.log("Status Code: ", response.status)
        return response.status
        // throw new Error(`Error creating post: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log(result)
    return result;
}


export async function savedPost(user_id, post_id) {
    const response = await fetch('http://127.0.0.1:8000/api/saved/', {
        method:"POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${get_token('accessToken')}`
        }, 
        body: JSON.stringify({
            "user":user_id,
            "post":post_id
        })
    })
    if (!response.ok) {
        console.log("Status Code: ", response.status)
        return response.status
        // throw new Error(`Error creating post: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log(result)
    return result;
}

export async function getSavedPost(user_id) {
    const response = await fetch("http://127.0.0.1:8000/api/saved/", {
        method:"GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${get_token('accessToken')}`
        },
    })

    if (!response.ok) {
        console.log("Status Code: ", response.status)
        return response.status
        
    }

    const result = await response.json();
    console.log(result)
    return result;
}

export async function getOnHover(id) {
    const response = await fetch(`http://127.0.0.1:8000/api/on-hover/?id=${id}`, {
        method:"GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${get_token('accessToken')}`
        },
    })

    if (!response.ok) {
        console.log("Status Code: ", response.status)
        return response.status
        
    }

    const result = await response.json();
    console.log(result)
    return result;
}