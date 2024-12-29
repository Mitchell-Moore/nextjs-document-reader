ALTER TABLE `file_uploads` DROP FOREIGN KEY `file_uploads_user_id_users_id_fk`;--> statement-breakpoint
ALTER TABLE `file_uploads` DROP COLUMN `user_id`;--> statement-breakpoint
DROP TABLE `users`;