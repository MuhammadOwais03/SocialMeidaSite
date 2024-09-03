import React from 'react';
import './Modal.css'; // Ensure to include the CSS for modal styling

const Modal = ({ isOpen, onClose, imageSrc, authorName }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                {/* <h3 className='author-name'>{authorName}</h3> */}

                <img src={imageSrc} alt="Popup" className="modal-image" />
                <button className="modal-close" onClick={onClose}><i className="fa-solid fa-x"></i></button>
            </div>
        </div>
    );
};

export default Modal;
