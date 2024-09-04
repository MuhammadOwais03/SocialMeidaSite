import React, {useEffect, useState} from 'react'
import './Home.css'
import { get_all_friends_request } from './server-requests';
import { Friends } from './Friends';

export const FriendContainer = ({
    followRequestData, setFollowRequestData,
    authorizedUser
}) => {


    const removeFollowRequest = (followID) => {
        setFollowRequestData(prevFollowRequestData => prevFollowRequestData.filter(data => data.id !== followID));
      };
    
      useEffect(() => {
        const fetchRequest = async () => {
          // setIsLoading(true);
          try {
            const response = await get_all_friends_request(authorizedUser.user.id);
            // Handle the response, e.g., set the posts data state here
            setFollowRequestData(response)
          } catch (error) {
            console.error('Error fetching data:', error);
          } finally {
            // setIsLoading(false);
            console.log(followRequestData)
          }
        }
        fetchRequest()
    
      }, [])


  return (
    <>

        <div className="follow_container">
            <h1> Follow Requests </h1>
                {followRequestData.length > 0 ? (
                    <>
                        {followRequestData.map((data, index) => (
                            <Friends key={index} data={data} removeFollowRequest={removeFollowRequest} authorizedUser={authorizedUser} />
                        ))}
                    </>
                ) : (
                    ""
                )}

            </div>

    </>
  )
}
