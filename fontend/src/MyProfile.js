import React from 'react';
import { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import MyBlog from "./MyBlog";

const MyProfile = () => {
  const { userInfo } = useContext(UserContext);
  const [postCount, setPostCount] = useState(null);
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    const fetchUserAvatar = async () => {
      try {
        if (userInfo.avatar) {
          const response = await fetch(`http://localhost:4000/avatar/${userInfo.avatar}`);
          if (response.ok) {
            
            const avatarUrl = await response.url;
            setAvatar(avatarUrl);
          } else {
            console.error("Failed to fetch user avatar");
          }
        }
      } catch (error) {
        console.error("Error fetching user avatar:", error);
      }
    };

    fetchUserAvatar();
  }, [userInfo.avatar]);

  useEffect(() => {
    const fetchUserPostCount = async () => {
      try {
        const response = await fetch("http://localhost:4000/post-count", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setPostCount(data.postCount);
        } else {
          console.error("Failed to fetch user post count");
        }
      } catch (error) {
        console.error("Error fetching user post count:", error);
      }
    };

    fetchUserPostCount();
  }, []);

  return (
    <div>
          <div className="my-profile">
      {avatar && <img className="avatar_myprofile" src={avatar} alt="Avatar" />}
      <div className="user-info">
        <h2>Xin chào, {userInfo.username}</h2>
        <p>Email: {userInfo.email}</p>
        <p>Number of Posts: {postCount !== null ? postCount : 0}</p>
      </div>
      
    </div>
    <div>
      <MyBlog />
    </div>
    </div>

  );
};

export default MyProfile;
