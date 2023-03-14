import assert from 'assert';
import test from 'node:test';
import * as users from './lib/users';
import * as posts from './lib/posts';
import * as comments from './lib/comments';
import { up, down } from './lib/management';
import { createPool, ForeignKeyIntegrityConstraintViolationError } from 'slonik';

import fsp from 'fs/promises';

const debug = (data: any) => fsp.writeFile('./log.txt', JSON.stringify(data));

test('db module', async t => {
  const pool = await createPool('postgres://postgres:lol12345@localhost:5432');

  await pool.query(down);
  await pool.query(up);

  await t.test('users module', async () => {
    const user = await pool.one(users.fake());
    assert(user.id > 0);
  });

  await t.test('posts module', async () => {
    const author = await pool.one(users.fake());

    await assert.rejects(
      async () => await pool.one(posts.create('foobar', 29)),
      ForeignKeyIntegrityConstraintViolationError,
      'creating a post for a user that doesn\'t exist should fail'
    );

    const post = await pool.one(posts.fake(author.id));
    await pool.one(posts.updateById(post.id, 'an updatedPost'));
    await pool.query(posts.deleteById(post.id));
  });

  await t.test('comments module', async () => {
    const authorA = await pool.one(users.fake());
    const authorB = await pool.one(users.fake());
    const post = await pool.one(posts.fake(authorA.id));
    const rootCommentA = await pool.one(comments.fake(
      null, post.id, authorA.id
    ));
    await pool.one(comments.updateById(rootCommentA.id, 'an updated comment'));
    await pool.query(comments.deleteById(rootCommentA.id));
  });


  await t.test('threaded coments', async () => {
    const author = await pool.one(users.fake());
    const post = await pool.one(posts.fake(author.id));

    const maxDepth = 4;
    let depth = 0;

    const reply = async (parent_id: number, post_id: number) => {
      const author = await pool.one(users.fake());

      const comment = await pool.one(comments.fake(
        parent_id, post.id, author.id,
      ));

      await pool.one(comments.fake(
        parent_id, post.id, author.id,
      ));

      depth++;

      if (maxDepth > depth) {
        await reply(comment.id, post.id);
      }
    };

    await reply(null, post.id);

    const threadedResults = await pool.query(comments.threadedByPostId(post.id));
    assert(threadedResults.rows.length === 8);
    assert(threadedResults.rows[0].path === '');
  });
});

