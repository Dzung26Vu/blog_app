import React, { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../UserContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState(false);
  const { userInfo, setUserInfo } = useContext(UserContext);

  
  function checkAuth() {
    const token = document.cookie.split(";").find((cookie) => cookie.includes("token"));
    return token ? true : false;
  }

  function login(ev) {
    ev.preventDefault();
    fetch("http://localhost:4000/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Login failed");
        }
      })
      .then((userInfo) => {
        setUserInfo(userInfo);
        window.location.href = "/";
      })
      .catch((error) => alert(error.message));
  }

  if (checkAuth() || (userInfo && Object.keys(userInfo).length !== 0)) {
    return <Navigate to={"/"} />;
  }

  return (
    <form className="login" onSubmit={login}>
      <h1>Login</h1>
      <input className="login"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(ev) => setEmail(ev.target.value)}
      />
      <input className="login"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(ev) => setPassword(ev.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}
