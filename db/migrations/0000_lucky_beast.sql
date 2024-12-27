CREATE TABLE `file_uploads` (
	`id` varchar(191) NOT NULL DEFAULT (uuid()),
	`filename` varchar(255) NOT NULL,
	`path` varchar(255) NOT NULL,
	`uploaded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`user_id` int,
	CONSTRAINT `file_uploads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ocr_results` (
	`id` varchar(191) NOT NULL DEFAULT (uuid()),
	`file_upload_id` int,
	`text` text NOT NULL,
	`model` varchar(255) NOT NULL,
	`processed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `ocr_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(191) NOT NULL DEFAULT (uuid()),
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `file_uploads` ADD CONSTRAINT `file_uploads_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ocr_results` ADD CONSTRAINT `ocr_results_file_upload_id_file_uploads_id_fk` FOREIGN KEY (`file_upload_id`) REFERENCES `file_uploads`(`id`) ON DELETE no action ON UPDATE no action;