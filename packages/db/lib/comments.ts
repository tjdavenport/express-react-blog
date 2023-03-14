import { z } from 'zod';
import sql from './sql';
import { faker } from '@faker-js/faker';

export const create = (content: string, parent_id: number | null, post_id: number, user_id: number ) => {
  return sql.typeAlias('comment')`
    insert into comments
      (content, parent_id, post_id, user_id)
      values
      (${sql.join([content, parent_id, post_id, user_id], sql.fragment`, `)})
    returning *;
  `;
};

export const fake = (parent_id: number | null, post_id: number, user_id: number ) => {
  return create(faker.lorem.paragraph(), parent_id, post_id, user_id);
};

export const updateById = (id: number, content: string) => sql.typeAlias('comment')`
  update comments
    set content = ${content}
    where id = ${id}
  returning *;
`;

export const deleteById = (id: number) => sql.typeAlias('void')`
  delete from comments where id = ${id};
`;

const ThreadedComment = sql.type(z.object({
  id: z.number(),
  path: z.string(),
  content: z.string(),
  username: z.string(),
  post_id: z.number(),
  user_id: z.number(),
}));

export const threadedByPostId = (id: number) => {
  return sql.type(ThreadedComment)`
    with recursive comments_cte (
      id,
      path,
      content,
      username,
      post_id,
      user_id
    ) as (
      select
        comments.id,
        '',
        content,
        u.username,
        post_id,
        user_id
      from
        "comments"
      join "users" u
        on "comments"."user_id" = u.id
      where
        parent_id is null
      union all
      select
        r.id,
        concat(path, '/', r.parent_id),
        r.content,
        u.username,
        r.post_id,
        r.user_id
      from
        "comments" r
        join comments_cte on comments_cte.id = r.parent_id
        join "users" u on "r"."user_id" = u.id
    )
    select * from comments_cte where post_id = ${id};
  `;
};
