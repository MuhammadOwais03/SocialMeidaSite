import React, { useState, useEffect } from 'react';
import { loginAuth, get_token } from './server-requests';
import './auth.css'


const LoginAuth = ({
  authType,setAuthType
})=>{


  const [loginBtn, setLoginBtn] = useState('a')
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  async function handleSubmit(e){
    
    e.preventDefault();

    
    try {
      let res = await loginAuth(username, password);
      console.log(res)

      if (res) {
        // console.log("successfull")
        console.log(get_token('accessToken'))
        window.location.href = '/'

      }

     

    } catch (e) {
      console.log(e);
    }
    
    
    

  }



    return (
        <>
          <div className="form_container">
            <form onSubmit={(e)=>handleSubmit(e)}>
              <input type="text"
               placeholder='username...'
               value={username}
               onChange={(e)=>setUsername(e.target.value)}
                required />
              <input type="password"
               placeholder='Password...'
               value={password}
               onChange={(e)=>setPassword(e.target.value)}
                required />
              <div className="log_in_btn">
                <button type="submit">Log In</button>
              </div>
            </form>
          </div>
          <div className="link">
            <p>Don't have an account? <a onClick={() => setAuthType('sign_up')}>  Sign Up</a></p>
          </div>
          <p className='hr-lines'>OR</p>
          <button className='forgot-password'>Forgot Password?</button>
        </>
    )

}


export default LoginAuth;