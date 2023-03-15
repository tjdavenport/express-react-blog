import sql from './sql';
import { z } from 'zod';
import { faker } from '@faker-js/faker';

export const create = (content: string, user_id: number) => sql.typeAlias('post')`
  insert into posts
    (content, user_id) values (${sql.join([content, user_id], sql.fragment`, `)})
  returning *;
`;

export const fake = (user_id: number) => create(faker.lorem.paragraph(), user_id);

export const updateById = (id: number, content: string) => sql.typeAlias('post')`
  update posts
    set content = ${content}
    where id = ${id}
  returning *;
`;

export const deleteById = (id: number) => sql.typeAlias('void')`
  delete from posts where id = ${id};
`;

const PostUser = z.object({
  id: z.number(),
  content: z.string(),
  username: z.string(),
  created: z.string().datetime(),
  user_id: z.number(),
});

export const list = sql.type(PostUser)`
  select
    p.id, p.content, u.username, p.created, p.user_id
  from posts p
  join users u on p.user_id = u.id
  order by created desc;
`;

export const withUserById = (id: number) => sql.type(PostUser)`
  select
    p.id, p.content, u.username, p.created, p.user_id
  from posts p
  join users u on p.user_id = u.id
  where p.id = ${id};
`;
