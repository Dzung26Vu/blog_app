import { useEffect, useState } from "react";
import Post from "../Post";

export default function IndexPage() {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(4);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('https://blog-app-lxee.vercel.app/post');
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
        setLoading(false); 
      } else {
        console.error('Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div className="post-container">
        {loading ? ( 
          <p>Loading...</p>
        ) : (
          currentPosts.length > 0 ? (
            currentPosts.map((post) => <Post key={post._id} {...post} />)
          ) : (
            <p>No posts available.</p>
          )
        )}
      </div>
      <div className="pagination">
        {Array.from({ length: Math.ceil(posts.length / postsPerPage) }).map(
          (_, index) => (
            <button key={index + 1} onClick={() => paginate(index + 1)}>
              {index + 1}
            </button>
          )
        )}
      </div>
    </>
  );
}
