import React, { useState, useContext } from "react";
import { UserContext } from "./UserContext";

const ChangePassword = () => {
  const { userInfo } = useContext(UserContext); 
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("New password and confirm password do not match");
      return;
    }
    try {
      const response = await fetch("http://localhost:4000/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: userInfo.email, 
          currentPassword,
          newPassword 
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Password changed successfully");
        window.alert("Password changed successfully");
        window.location.href = "/";
      } else {
        setMessage(data.error || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage("An error occurred while changing password");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Change Password</h2>
      <div>
        <label htmlFor="currentPassword">Current Password:</label>
        <input
          type="password"
          id="currentPassword"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="newPassword">New Password:</label>
        <input
          type="password"
          id="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="confirmPassword">Confirm Password:</label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit">Change Password</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default ChangePassword;
