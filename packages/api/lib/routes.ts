import { posts, comments } from 'db';
import { DatabasePool } from 'slonik';
import { Request, Response, NextFunction } from 'express';

type RouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

const route = (handler: RouteHandler) => (req: Request, res: Response, next: NextFunction) => {
  return Promise.resolve(handler(req, res, next)).catch(error => {
    // @TODO - can add global error handling here
    next(error);
  });
};

export const getPosts = (pool: DatabasePool) => route(async (req, res, next) => {
  const list = await pool.query(posts.list);
  return res.json(list.rows);
});

export const getPostUser = (pool: DatabasePool) => route(async (req, res, next) => {
  const postUser = await pool.one(posts.withUserById(parseInt(req.params.id)));
  return res.json(postUser);
});

export const getPostThreadedComments = (pool: DatabasePool) => route(async (req, res, next) => {
  const threadedResult = await pool.query(comments.threadedByPostId(parseInt(req.params.id)));
  return res.json(threadedResult.rows);
});

export const createPost = (pool: DatabasePool) => route(async (req, res, next) => {
  const {
    content,
    user_id
  } = req.body;
  const post = await pool.one(posts.create(content, user_id));
  return res.json(post);
});

export const updatePost = (pool: DatabasePool) => route(async (req, res, next) => {
  const {
    content,
  } = req.body;
  const post = await pool.one(posts.updateById(parseInt(req.params.id), content));
  return res.json(post);
});

export const deletePost = (pool: DatabasePool) => route(async (req, res, next) => {
  await pool.query(posts.deleteById(parseInt(req.params.id)));
  return res.json(true);
});

export const createComment = (pool: DatabasePool) => route(async (req, res, next) => {
  const {
    content,
    parent_id,
    post_id,
    user_id,
  } = req.body;

  const comment = await pool.one(comments.create(content, parent_id, post_id, user_id));
  return res.json(comment);
});

export const updateComment = (pool: DatabasePool) => route(async (req, res, next) => {
  const {
    content,
  } = req.body;

  const comment = await pool.one(comments.updateById(parseInt(req.params.id), content));
  return res.json(comment);
});

export const deleteComment = (pool: DatabasePool) => route(async (req, res, next) => {
  await pool.query(comments.deleteById(parseInt(req.params.id)));
  return res.json(true);
});
