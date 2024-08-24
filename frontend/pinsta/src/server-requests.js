




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
            "content":content,
            "comment_author":comment_author,
            "post":post
        })
    })


    if (!response.ok) {
        return 'Network not Ok'
    }

    const result = await response.json()
    console.log(result)
    return result
}