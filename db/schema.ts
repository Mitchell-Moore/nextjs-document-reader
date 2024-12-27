import { sql } from 'drizzle-orm';
import {
  int,
  mysqlTable,
  timestamp,
  varchar,
  text,
} from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: varchar('id', { length: 191 })
    .primaryKey()
    .notNull()
    .default(sql`(uuid())`),
  email: varchar('email', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
});

export const fileUploads = mysqlTable('file_uploads', {
  id: varchar('id', { length: 191 })
    .primaryKey()
    .notNull()
    .default(sql`(uuid())`),
  filename: varchar('filename', { length: 255 }).notNull(),
  path: varchar('path', { length: 255 }).notNull(),
  uploadedAt: timestamp('uploaded_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  userId: int('user_id').references(() => users.id),
});

export const ocrResults = mysqlTable('ocr_results', {
  id: varchar('id', { length: 191 })
    .primaryKey()
    .notNull()
    .default(sql`(uuid())`),
  fileUploadId: int('file_upload_id').references(() => fileUploads.id),
  text: text('text').notNull(),
  model: varchar('model', { length: 255 }).notNull(),
  processedAt: timestamp('processed_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
