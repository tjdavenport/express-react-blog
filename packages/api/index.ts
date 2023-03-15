import { createPool } from 'db';
import * as routes from './lib/routes';
import express, { Express } from 'express';

const app: Express = express();
app.use(express.json());

createPool('postgres://postgres:lol12345@localhost:5432')
  .then(pool => {
    // @TODO - support auth

    app.get('/posts', routes.getPosts(pool));
    app.get('/posts/:id', routes.getPostUser(pool));
    app.get('/posts/:id/threaded-comments', routes.getPostThreadedComments(pool));
    app.patch('/posts/:id', routes.updatePost(pool));
    app.delete('/posts/:id', routes.deletePost(pool));
    app.post('/posts', routes.createPost(pool));

    app.patch('/comments/:id', routes.updateComment(pool));
    app.delete('/comments/:id', routes.deleteComment(pool));
    app.post('/comments', routes.createComment(pool));

    app.listen(1337, () => {
      console.info('Everything is ready! Open http://localhost:1234');
    });
  }).catch(error => {
    console.error(error);
  });

