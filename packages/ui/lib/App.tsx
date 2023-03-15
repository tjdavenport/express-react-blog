import { Post } from './Post';
import { Posts } from './Posts';
import { Routes, Route, Link } from 'react-router-dom';

export function App() {

  return (
    <Routes>
      <Route index element={<Posts/>}/>
      <Route path="/post/:postId" element={<Post/>}/>
    </Routes>
  );
}
