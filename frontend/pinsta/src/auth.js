import React, { useState } from 'react';
import './auth.css'

const Auth = () => {
  const [authType, setAuthType] = useState('sign_up');

  return (
    <div className="auth_container">
      <h1 className='lobster-bold'>Pinstagram</h1>
      {authType === 'sign_up' ? (
        <>
          <p className='para_auth'><strong>Sign up to see photos and videos from your friends.</strong></p>
          <div className="form_container">
            <form>
              <input type="email" placeholder='Email...' required />
              <input type="text" placeholder='Username...' required />
              <input type="text" placeholder='First Name...' required />
              <input type="text" placeholder='Last Name...' required />
              <input type="password" placeholder='Password...' required />
              <input type="password" placeholder='Confirm Password...' required />
              <div className="sign_up_btn">
                <button type="submit">Sign Up</button>
              </div>
            </form>
          </div>
          <div className="link">
            <p>Have an account? <a href="#" onClick={() => setAuthType('log_in')}>  Log In</a></p>
          </div>
        </>
      ) : (
        <>
          <div className="form_container">
            <form>
              <input type="email" placeholder='Email...' required />
              <input type="password" placeholder='Password...' required />
              <div className="log_in_btn">
                <button type="submit">Log In</button>
              </div>
            </form>
          </div>
          <div className="link">
            <p>Don't have an account? <a href="#" onClick={() => setAuthType('sign_up')}>  Sign Up</a></p>
          </div>
          <p className='hr-lines'>OR</p>
          <a href="" className='forgot-password'>Forgot Password?</a>
        </>
      )}
    </div>
  );
};

export default Auth;
