import React, { useState, useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../UserContext";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const { userInfo } = useContext(UserContext); 
  const [redirect, setRedirect] = useState(false); 

  useEffect(() => {
    
    if (userInfo && userInfo.email) {
      setRedirect(true);
    }
  }, [userInfo]);

  async function register(ev) {
    ev.preventDefault();
    const response = await fetch("http://localhost:4000/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (response.status === 200) {
      alert("Registration successful");
      window.location.href = "/login";
    } else {
      setAlertMessage(data.error);
    }
  }

  if (redirect) {
    return <Navigate to={"/"} />; 
  }

  return (
    <form className="register" onSubmit={register}>
      <h1>Register</h1>
      <input
        type="text"
        placeholder="username"
        value={username}
        onChange={(ev) => setUsername(ev.target.value)}
      />
      <input className="register"
        type="email"
        placeholder="email"
        value={email}
        onChange={(ev) => setEmail(ev.target.value)}
      />
      <input className="register"
        type="password"
        placeholder="password"
        value={password}
        onChange={(ev) => setPassword(ev.target.value)}
      />
      <button className="register">Register</button>
      {alertMessage && <p>{alertMessage}</p>}
    </form>
  );
}
