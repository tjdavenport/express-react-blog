import { sql } from 'slonik';

export const up = sql.unsafe`
  create table users (
    id serial primary key,
    username varchar(24) not null,
    password varchar(255) not null
  );
  create table posts(
    id serial primary key,
    content text not null,
    created timestamp not null default current_timestamp,\
    user_id integer not null references users
  );
  create table comments(
    id serial primary key,
    content text not null,
    parent_id integer references comments on delete cascade,
    post_id integer not null references posts on delete cascade,
    user_id integer not null references users
  );
`;

export const down = sql.unsafe`
  drop table if exists comments;
  drop table if exists posts;
  drop table if exists users;
`;
