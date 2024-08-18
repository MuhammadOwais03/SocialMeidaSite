import React, { useState } from 'react';
import { signUp } from './server-requests';
import './auth.css';

const SignupAuth = ({ authType, setAuthType, setTickerActive }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();


    let first_name = firstName;
    let last_name = lastName;
    // Example: Basic validation
    if (password !== password2) {
      alert('Passwords do not match');
      return;
    }

    const data = {
      email,
      username,
      first_name,
      last_name,
      password,
      password2
    };

    try {
      // Example: Simulating an API request
      const response = await signUp(data);
      if (response) {
        setTickerActive('ticker-active')
        setAuthType('log_in')
      } else if (response === "Error Authentication") {
        console.log("Error Authentication")
      } else if (response === "Network response was not ok") {
        console.log(response)
      } else if (response === false) {
        console.log(response)
      } else {
        console.log("Something went wrong")
      }
        
      
      
    } catch (error) {
      console.error('Sign up error', error);
    }
  };

  // Example function simulating an API call
  const fakeSignupAPI = async (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data });
      }, 1000);
    });
  };

  return (
    <>
      <p className='para_auth'><strong>Sign up to see photos and videos from your friends.</strong></p>
      <div className="form_container">
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder='Email...'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder='Username...'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder='First Name...'
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder='Last Name...'
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder='Password...'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder='Confirm Password...'
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
          />
          <div className="sign_up_btn">
            <button type="submit">Sign Up</button>
          </div>
        </form>
      </div>
      <div className="link">
        <p>Have an account? <button onClick={() => setAuthType('log_in')}>Log In</button></p>
      </div>
    </>
  );
};

export default SignupAuth;
