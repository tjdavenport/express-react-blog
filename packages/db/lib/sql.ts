import { z } from 'zod';
import { createSqlTag } from 'slonik';

const sql = createSqlTag({
  typeAliases: {
    void: z.object({}).strict(),
    post: z.object({
      id: z.number(),
      content: z.string(),
      created: z.string().datetime(),
      user_id: z.string(),
    }),
    comment: z.object({
      id: z.number(),
      content: z.string(),
      parent_id: z.nullable(z.number()),
      post_id: z.number(),
      user_id: z.number(),
    }),
    user: z.object({
      id: z.number(),
      username: z.string(),
      password: z.string(),
    })
  },
});

export default sql;
