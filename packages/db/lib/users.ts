import sql from './sql';
import { faker } from '@faker-js/faker';

export const create = (username: string, password: string) => sql.typeAlias('user')`
  insert into users
    (username, password) values (${sql.join([username, password], sql.fragment`, `)})
  returning *;
`;

export const fake = () => create(faker.internet.userName(), faker.internet.password());
