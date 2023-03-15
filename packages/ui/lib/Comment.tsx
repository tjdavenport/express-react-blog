import { useState } from 'react';
import useAxios from 'axios-hooks';

// @TODO - the recursion could be optimized

export const Comment = ({ comment, comments, depth = 0, onReplied = () => {} }) => {
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const replyToggle = (e) => {
    e.preventDefault();
    setReplying(!replying);
  };
  const editToggle = (e) => {
    e.preventDefault();
    setEditing(!editing);
  };

  const [ { error: replyingError }, create ] = useAxios({
    url: '/api/comments',
    method: 'post'
  }, { manual: true });

  const [ { error: editingError }, edit ] = useAxios({
    url: `/api/comments/${comment.id}`,
    method: 'patch'
  }, { manual: true });

  const [ { error: deletingError }, deleteComment ] = useAxios({
    url: `/api/comments/${comment.id}`,
    method: 'delete'
  }, { manual: true });

  const handleEdited = (e) => {
    e.preventDefault();

    edit({
      data: {
        content: e.currentTarget.elements.content.value,
      }
    }).then(() => {
      // TODO - rather than refetch entire tree
      // could update the UI state with new comment
      onReplied();
    });
  };

  const handleDelete = (e) => {
    if (confirm('Are you sure you want to delete the comment?')) {
      deleteComment().then(() => onReplied());
    }
  };

  const handleReplied = (e) => {
    e.preventDefault();

    create({
      data: {
        content: e.currentTarget.elements.content.value,
        parent_id: comment.id,
        post_id: comment.post_id,
        user_id: 1
      }
    }).then(() => {
      // TODO - rather than refetch entire tree
      // could update the UI state with new comment
      onReplied();
    });
  };

  return (
    <div style={{ marginLeft: `${depth * 20}px`, borderLeft: '4px solid black' }}>
      <div>
        <p>{comment.content}</p>
        <span>By: {comment.username}</span> - <a href="#" onClick={replyToggle}>{replying ? 'Cancel' : 'Reply'}</a>
        {replying && (
          <form onSubmit={handleReplied}>
            <input type="text" required name="content"/>
            <button type="submit">send</button>
            {replyingError && <span>Error trying to create reply</span>}
          </form>
        )}
        <br/>
        <a href="#" onClick={editToggle}>{editing ? 'Cancel': 'Edit'}</a>
        {editing && (
          <form onSubmit={handleEdited}>
            <input type="text" required name="content"/>
            <button type="submit">save</button>
            {editingError && <span>Error trying to edit comment</span>}
          </form>
        )}
        <br/>
        <a href="#" onClick={handleDelete}>Delete</a>
      </div>
      {comments.filter(child => {
        return child.path === `${comment.path}/${comment.id}`
      }).map((child) => (
        <Comment
          comment={child}
          comments={comments}
          depth={child.path.split('/').length}
          onReplied={onReplied}
        />
      ))}
    </div>
  );
};
