import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { formatISO9075 } from "date-fns";
import { UserContext } from "../UserContext";
import { Link } from "react-router-dom";

export default function PostPage() {
  const [postInfo, setPostInfo] = useState(null);
  const { userInfo } = useContext(UserContext);
  const { id } = useParams();

  useEffect(() => {
    fetch(`http://localhost:4000/post/${id}`)
      .then((response) => response.json())
      .then((postInfo) => setPostInfo(postInfo))
      .catch((error) => console.error("Error fetching post:", error));
  }, [id]);

  const handleDelete = () => {
    fetch(`http://localhost:4000/post/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {        
          window.location.href = "/";
        } else {
          throw new Error("Failed to delete post");
        }
      })
      .catch((error) => console.error("Error deleting post:", error));
  };

  if (!postInfo) return null;

  return (
    <div className="post-page">
      <h1>{postInfo.title}</h1>
      <time>{formatISO9075(new Date(postInfo.createdAt))}</time>
      <div className="author">by @{postInfo.author.username}</div>

      <div className="image">
        <img src={`http://localhost:4000/${postInfo.cover}`} alt="" />
      </div>

      <div
        className="content"
        dangerouslySetInnerHTML={{ __html: postInfo.content }}
      />
            {userInfo.id === postInfo.author._id && (
        <div className="edit-row">
          <Link className="edit-btn" to={`/edit/${postInfo._id}`} style={{ color: 'white' }}>
            Edit this post
          </Link>
          <button className="delete-btn" onClick={handleDelete}>
            Delete this post
          </button>
        </div>
      )}
    </div>
  );
}
