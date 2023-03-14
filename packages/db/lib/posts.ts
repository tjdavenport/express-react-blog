import sql from './sql';
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
