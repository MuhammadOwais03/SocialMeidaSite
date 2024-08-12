// const socket = new WebSocket(`ws://127.0.0.1:8000/ws/notifications/`);

// socket.onopen = function(e) {
//     console.log('WebSocket connection opened');
// };

// socket.onmessage = function(e) {
//     console.log(e)
//     const data = JSON.parse(e.data);
//     console.log('Notification:', data.message);
//     // Display the notification to the user
// };

// socket.onclose = function(e) {
//     console.log('WebSocket connection closed');
// };

// console.log("Hello")

// //ws://127.0.0.1:8000/ws/notifications/

// Function to set a cookie
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Example usage






const login_fun = () => {
    fetch('http://127.0.0.1:8000/api/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: 'm_O',
            password: 'owais2021'
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); // Parse the JSON response
    })
    .then(data => {
        // Assuming `data` contains the tokens
        setCookie('refreshToken', data.refresh, 1); // Save refresh token for 7 days
        setCookie('accessToken', data.access, 1); // Save access token for 1 day
        
        console.log('Success:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// login_fun();

// Function to get a cookie by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Example usage
const refreshToken = getCookie('refreshToken');
const accessToken = getCookie('accessToken');
console.log('Refresh Token:', refreshToken);
console.log('Access Token:', accessToken);


const socket = new WebSocket(`ws://127.0.0.1:8000/ws/notifications/?access_token=${accessToken}`);

socket.onopen = function(e) {
    console.log('WebSocket connection opened');
    // Optionally send a message to the server
    // socket.send(JSON.stringify({ 'message': 'Hello, server!' }));
};

socket.onmessage = function(e) {
    e.preventDefault()
    
    const data = JSON.parse(e.data);
    console.log('Message received:', e);
    console.log('Notification:', data.message);
    alert('Message received:', data.message);
    // Display the notification to the user
};

socket.onclose = function(e) {
    console.log('WebSocket connection closed');
};

socket.onerror = function(e) {
    console.error('WebSocket error:', e);
};

// Optionally, a function to send messages
function sendNotification(message) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ 'message': message }));
    } else {
        console.error('WebSocket is not open. Ready state is:', socket.readyState);
    }
}


function likeThePost(){
    let data = {
        'like_by':4,
        'post':2
    }

    json_data = JSON.stringify(data)

    const url = 'http://127.0.0.1:8000/api/like/';

    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: json_data
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
}

// likeThePost()



