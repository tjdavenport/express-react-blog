import { useState } from 'react';
import useAxios from 'axios-hooks';
import { Link, useNavigate } from 'react-router-dom';

export function Posts() {
  const navigate = useNavigate();
  const [{ data, loading, error }, refetchPosts] = useAxios('/api/posts', {
    useCache: false
  });
  const [ creating, setCreating ] = useState(false);
  const [ { error: creatingError }, createPost ] = useAxios({
    url: '/api/posts',
    method: 'post'
  }, { manual: true });

  const createToggle = (e) => {
    e.preventDefault();
    setCreating(!creating);
  };

  const handleCreated = (e) => {
    e.preventDefault();
    createPost({
      data: {
        content: e.currentTarget.elements.content.value,
        user_id: 1
      }
    }).then((res) => {
      navigate(`/post/${res.data.id}`);
    });
  };

  if (loading) {
    return <p>loading...</p>;
  }

  if (error) {
    return <p>could not load posts...</p>
  }

  return (
    <div>
      {(data.length === 0) && <h1>{'No posts :('}</h1>}
      <a href="#" onClick={createToggle}>{creating ? 'Cancel' : 'Create Post'}</a>
      {creating && (
        <form onSubmit={handleCreated}>
          <textarea
            style={{ width: '450px', height: '75px' }}
            type="text"
            required
            name="content"
          />
          <br/>
          <button type="submit">create</button>
          {creatingError && <span>Error trying to create post</span>}
        </form>
      )}

      {data.map(post => {
        return (
          <div>
            <p>{post.content}</p>
            <Link to={`/post/${post.id}`}>View Post</Link> - <span>By: {post.username}</span>
          </div>
        );
      })}
    </div>
  );
}
