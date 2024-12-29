import { sql } from 'drizzle-orm';
import {
  int,
  mysqlTable,
  timestamp,
  varchar,
  text,
} from 'drizzle-orm/mysql-core';

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
});

export const ocrResults = mysqlTable('ocr_results', {
  id: varchar('id', { length: 191 })
    .primaryKey()
    .notNull()
    .default(sql`(uuid())`),
  fileUploadId: varchar('file_upload_id', { length: 191 }).references(
    () => fileUploads.id
  ),
  text: text('text').notNull(),
  model: varchar('model', { length: 255 }).notNull(),
  processedAt: timestamp('processed_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
