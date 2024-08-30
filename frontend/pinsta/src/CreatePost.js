import React, { useState, useRef } from 'react';
import { createPost } from './server-requests';

export const CreatePost = ({ create, setCreate, authorizedUser, setPosts }) => {
    const [fileInfo, setFileInfo] = useState({ name: '', type: '', path: '', file: '' });
    const [_file, set_File] = useState()
    const [next, setNext] = useState(false);
    const [caption, setCaption] = useState('');
    const textAreaRef = useRef(null);

    const handleFileClick = () => {
        document.getElementById('fileInput').click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        set_File(file)
        if (file) {
            const truncatedName = file.name.length > 10 ? file.name.substring(0, 10) + '...' : file.name;
            const fileType = file.type; // Use file.type to get MIME type

            const filePath = URL.createObjectURL(file);

            setFileInfo({ name: truncatedName, type: fileType, path: filePath, file: file });
            setNext(true);
        } else {
            setFileInfo({ name: '', type: '', path: '' });
            setNext(false);
        }
    };

    const handleInputChange = (event) => {
        // Auto resize textarea
        const textarea = textAreaRef.current;
        textarea.style.height = 'auto'; // Reset height to auto to calculate scrollHeight
        textarea.style.height = `${textarea.scrollHeight}px`; // Set height to scrollHeight

        setCaption(event.target.value);
    };

    const handlePostSubmit = async (event) => {
        event.preventDefault();
        
        const author = authorizedUser.user.id;
        let type = '';
        const formData = new FormData();
    
        formData.append('author', author);
        formData.append('caption', caption);
    
        if (fileInfo.type.includes('image')) {
            type = 'image';
            formData.append('post_image', fileInfo.file);
        } else if (fileInfo.type.includes('video')) {
            type = 'video';
            formData.append('video_file', fileInfo.file);
        }
    
        formData.append('post_type', type);
    
        try {
            const result = await createPost(formData);
            console.log('Post created successfully:', result);

            setPosts(prevPosts => [result, ...prevPosts]);

            // Optionally, reset the form or close the modal after successful submission
            setCreate('create-not-active');
            setFileInfo({ name: '', type: '', path: '' });
            setNext(false);
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };
    
    

    return (
        <div className={`create-post-container ${create}`}>
            <div className="create-post-inside-container">
                <h3>Create Post</h3>
                <form className="create-post-inside-body" onSubmit={handlePostSubmit}>
                    {!next ? (
                        <>
                            <input
                                type="file"
                                id="fileInput"
                                accept="image/*,video/*"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                            <button
                                type="button"
                                onClick={handleFileClick}
                                className="plus-button"
                            >
                                +
                            </button>
                            {fileInfo.name && (
                                <p className="file-info">
                                    {fileInfo.name} ({fileInfo.type.split('/').pop()})
                                </p>
                            )}
                        </>
                    ) : (
                        <>

                            <textarea
                                id="caption"
                                ref={textAreaRef}
                                onChange={handleInputChange}
                                placeholder="Type your caption here..."
                                rows="3" // Initial number of rows
                                value={caption}
                            />

                            {fileInfo.path && (
                                <div className="file-preview">

                                    {fileInfo.type.startsWith('image') ? (
                                        <img src={fileInfo.path} alt="Preview" />
                                    ) : (
                                        <video src={fileInfo.path} controls loop muted />
                                    )}
                                </div>
                            )}

                            <button type='submit'>Create</button>
                        </>
                    )}
                </form>
            </div>
            <div className="cut" onClick={() => {
                setCreate('create-not-active');
                setFileInfo({ name: '', type: '', path: '' });
                setNext(false)
            }}>
                <i className="fa-solid fa-x"></i>
            </div>
            <div className="left" onClick={() => {
                setNext(false);
                setFileInfo({ name: '', type: '', path: '' })
            }}>
                <i class="fa-solid fa-arrow-left"></i>
            </div>
        </div>
    );
};
