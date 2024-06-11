import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";

export default function Header() {
  const { setUserInfo, userInfo } = useContext(UserContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetch('http://localhost:4000/profile', {
      credentials: 'include',
    })
    .then(response => {
      if (response.ok) {
        response.json().then(userInfo => {
          setUserInfo(userInfo);
        });
      }
    })
    .catch(error => {
      console.error('Error fetching profile:', error);
    });
  }, []);

  function logout() {
    fetch('http://localhost:4000/logout', {
      credentials: 'include',
      method: 'POST',
    })
    .then(() => {
      setUserInfo(null);
      window.location.href = "/login";

    })
    .catch(error => {
      console.error('Error logging out:', error);
    });
  }

  const username = userInfo?.username;

  return (
    <header>
      <Link to="/" className="logo">Blog</Link>
      <nav>
        {username ? (
          <div className="user-info">
            <span className="username" onClick={() => setDropdownOpen(!dropdownOpen)}>{username}</span>
            {dropdownOpen && (
              <div className="dropdown">
                <Link to="/create">Create new post</Link>
                <Link to="/MyProfile">MyProfile</Link>
                <div className="dropdown-divider"></div>
                <Link to="/ChangePassword">ChangePassword</Link>
              
                <a onClick={logout}>Logout</a>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
