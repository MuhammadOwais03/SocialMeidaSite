import React, {useEffect, useState} from 'react'
import { editProfile } from './server-requests'
import './Edit.css'


const Edit = ({
    edit, setEdit,
    authorizedUser, setFullName,
    setUsername, setBio,
    fullName, username, bio,
    setTickerActive, setTickerContent
}) => {

    const [full_name_1,setFull_name_1] = useState("")
    const [username_1,setUsername_1] = useState("")
    const [bio_1,setBio_1] = useState("")
    const [_error, set_Error] = useState(false)

    const handleFullNameChange = (e)=>{
        setFull_name_1(e.target.value)
    }
    const handleUsernameChange = (e)=>{
        setUsername_1(e.target.value)
    }
    const handleBioChange = (e)=>{
        setBio_1(e.target.value)
    }

    const handleSubmit_1 = async (event) => {
        event.preventDefault()
        let res = await editProfile(full_name_1, username_1, bio_1, authorizedUser.user.id)
        console.log(res)
        if (res===409) {
            setTickerActive('ticker-active')
            setTickerContent('username already existed')
            set_Error(true)
            return
        }
        if (Object.keys(res).length>0 && res.status === 'Successfully Changed') {
            
            set_Error(false)
            
            setFullName(res.serializer.full_name)
            setBio(res.serializer.bio)
            setUsername(res.serializer.username)
            setEdit('edit-not-active')
        }
    }

    useEffect(()=>{
        setFull_name_1(authorizedUser.full_name)
        setUsername_1(authorizedUser.username)
        setBio_1(authorizedUser.bio)
    },[])

    return (
        <div className={`edit-container ${edit}`}>
            <div className="cut" onClick={() => {
                setEdit('create-not-active');
                
            }}>
                <i className="fa-solid fa-x"></i>
            </div>


            <div className="edit-inside-container">
                <h3>Edit Profile</h3>

                <form onSubmit={handleSubmit_1}>
                    <div className="full_name">
                        <label htmlFor="">Full Name</label>
                        <input 
                        type="text" 
                        value={full_name_1}
                        onChange={handleFullNameChange} 
                        />
                    <div className="username">
                        <label htmlFor="">Username</label>
                        <input 
                        type="text" 
                        value={username_1}
                        onChange={handleUsernameChange} 
                        />
                        {_error?<i className="fa-sharp fa-solid fa-circle-exclamation"></i>:""}
                        
                    </div>
                    <div className="bio">
                        <label htmlFor="">Bio</label>
                        <textarea 
                        type="text" 
                        value={bio_1}
                        onChange={handleBioChange} 
                        />
                    </div>
                    </div>
                    

                <button type='submit' >Save</button>
                </form>
            </div>
        
        

        </div>
    )
}

export default Edit