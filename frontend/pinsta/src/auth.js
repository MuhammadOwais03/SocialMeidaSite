import React, { useState } from 'react';
import SignUp from './signupAuth.js'
import Login from './LoginAuth.js'


import './auth.css'

const Auth = ({
  setTickerActive
}) => {
  const [authType, setAuthType] = useState('sign_up');
  

  
  return (

    <div className="auth_container">
      <h1 className='lobster-bold'>Pinstagram</h1>
      {authType === 'sign_up' ? (
        <SignUp
        
        authType={authType}
        setAuthType={setAuthType}
        setTickerActive={setTickerActive}
        
        />
      ) : (
        <Login
        
        authType={authType}
        setAuthType={setAuthType}
        setTickerActive={setTickerActive}
        
        />
      )}
    </div>
  );
};

export default Auth;
