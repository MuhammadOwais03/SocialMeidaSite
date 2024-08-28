import React, { useEffect, useState, useMemo } from "react";
import {  followRequest } from "./server-requests";
import './Sidebar.css';

const RenderButton = ({ data, auth_user, to_user }) => {
    const [followBtn, setFollowBtn] = useState("");
  
    async function follow() {
      let response = await followRequest(followBtn, auth_user, to_user)
      console.log(response)
      return response
    }
  
    async function setFollow(newClass) {
      let r = await setFollowBtn(newClass);
    }
  
    function handleFollowing(e) {
  
  
  
      const newClass = e.target.className;
      if (newClass==="btn-none") {
        setFollow(newClass)
        follow()
        console.log("in")
      } else if (newClass==='btn-accepted') {
        console.log(follow())
        console.log("in")
      }
  
      console.log("Button class set to:", newClass);
    }
  
    useEffect(() => {
      if (data) {
        setFollowBtn(data);
      }
    }, [data]);
  
  
  
  
  
    // useEffect(() => {
    //   let res = follow()
    //   console.log(res)
    //   if (res === 'fetch error') {
    //     console.log(res)
    //   }
    // }, [followBtn])
  
    let btnClass = '';
    let btnText = '';
    let isDisabled=false;
    const status = followBtn; // Initialize `status` after the state has been updated
  
    console.log("Current status:", status);
  
    switch (status) {
      case 'btn-accepted':
        btnClass = 'btn-none';
        btnText = 'Follow';
        break;
      case 'accepted':
        btnClass = 'btn-accepted';
        btnText = 'Following';
        break;
      case 'btn-pending':
        btnClass = 'btn-none';
        btnText = 'Follow';
        break;
      case 'pending':
        btnClass = 'btn-pending';
        btnText = 'Pending...';
        break;
      case 'btn-none':
        btnClass = 'requested';
        btnText = 'requested';
        isDisabled=true;
        break;
      case 'to_accept':
        btnClass = 'to-accept';
        btnText = 'To Accept'
        isDisabled=true;
        break;
      case 'requested':
        btnClass = 'requested';
        btnText = 'Requested'
        isDisabled=true;
        break;
      case 'none':
        btnClass = 'btn-none';
        btnText = 'Follow';
        break;
      default:
        return null;
    }
  
    return (
      <button className={btnClass} onClick={handleFollowing} disabled={isDisabled}>
        {btnText}
      </button>
    );
  };
  
export default RenderButton;