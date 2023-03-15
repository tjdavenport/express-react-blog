import moment from 'moment';
import { useState } from 'react';
import useAxios from 'axios-hooks';
import { Comment } from './Comment';
import { Link, useParams, useNavigate } from 'react-router-dom';

export function Post() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [ commenting, setCommenting ] = useState(false);
  const [ editing, setEditing ] = useState(false);

  const [{
    data: postData,
    loading: loadingPost,
    error: postError
  }, refetchPost] = useAxios(`/api/posts/${postId}`, { useCache: false });

  const [{
    data: commentsData,
    loading: loadingComments,
    error: commentsError
  }, refetchComments] = useAxios(`/api/posts/${postId}/threaded-comments`, {
    useCache: false
  });

  const [ { error: editingError }, edit ] = useAxios({
    url: `/api/posts/${postId}`,
    method: 'patch'
  }, { manual: true });

  const [ { error: commentingError }, createComment ] = useAxios({
    url: '/api/comments',
    method: 'post'
  }, { manual: true });

  const [ { error: deletingError }, deletePost ] = useAxios({
    url: `/api/posts/${postId}`,
    method: 'delete'
  }, { manual: true });

  const commentToggle = (e) => {
    e.preventDefault();
    setCommenting(!commenting);
  };
  const editToggle = (e) => {
    e.preventDefault();
    setEditing(!editing);
  };

  const handleDelete = (e) => {
    e.preventDefault();

    if (confirm('Are you sure you want to delete the post?')) {
      deletePost().then(() => navigate('/'));
    }
  };

  const handleEdited = (e) => {
    e.preventDefault();
    edit({
      data: {
        content: e.currentTarget.elements.content.value,
      }
    }).then(() => {
      refetchPost();
      setEditing(false);
    });
  };

  const handleCommented = (e) => {
    e.preventDefault();

    createComment({
      data: {
        content: e.currentTarget.elements.content.value,
        parent_id: null,
        post_id: postData.id,
        user_id: 1
      }
    }).then(() => {
      // TODO - rather than refetch entire tree
      // could update the UI state with new comment
      refetchComments();
      setCommenting(false);
    });
  };

  if (loadingPost || loadingComments) {
    return <p>loading...</p>;
  }

  if (postError || commentsError) {
    return <p>could not load post...</p>
  }

  return (
    <div>
      <Link to="/">Back</Link>
      <p>{postData.content}</p>
      <a href="#" onClick={editToggle}>{editing ? 'Cancel' : 'Edit'}</a>
      <br/>
      <a href="#" onClick={handleDelete}>Delete</a>
      {deletingError && <span>Error deleting post</span>}
      <br/>
      {editing && (
        <form onSubmit={handleEdited}>
          <textarea
            style={{ width: '450px', height: '75px' }}
            defaultValue={postData.content}
            type="text"
            required
            name="content"
          />
          <br/>
          <button type="submit">save</button>
          {editingError && <span>Error trying to edit post</span>}
        </form>
      )}
      <span>By: {postData.username} - {moment(postData.created).from(moment())}</span>
      <h4>Comments - <a href="#" onClick={commentToggle}>{commenting ? 'Cancel' : 'Leave a comment'}</a></h4>
      {commenting && (
        <form onSubmit={handleCommented}>
          <input type="text" required name="content"/>
          <button type="submit">post</button>
          {commentingError && <span>Error trying to create comment</span>}
        </form>
      )}
      {commentsData.filter(comment => comment.path === '').map(comment => {
        return <Comment comment={comment} comments={commentsData} onReplied={() => refetchComments()}/>
      })}
    </div>
  );
}
