import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import Post from "./Post";

function MyBlog() {
  const { userInfo } = useContext(UserContext);
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(3);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        if (userInfo) {
          const response = await fetch(`http://localhost:4000/my-blog`, {
            credentials: 'include',
          });
          if (response.ok) {
            const postsData = await response.json();
            setPosts(postsData);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error fetching user posts:', error);
      }
    };

    fetchUserPosts();
  }, [userInfo]);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="my-blog">
      <h1>My Blogs</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        currentPosts.length > 0 ? (
          <div>
            {currentPosts.map(post => (
              <Post key={post._id} {...post} />
            ))}
          </div>
        ) : (
          <p>You don't have any blog.</p>
        )
      )}
      <div className="pagination">
        {Array.from({ length: Math.ceil(posts.length / postsPerPage) }).map(
          (_, index) => (
            <button key={index + 1} onClick={() => paginate(index + 1)}>
              {index + 1}
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default MyBlog;
