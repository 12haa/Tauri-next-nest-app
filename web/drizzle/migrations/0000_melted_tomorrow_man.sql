CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`age` integer,
	`phone` text,
	`profile_picture` text,
	`bio` text,
	`address` text,
	`role` text DEFAULT 'user',
	`date_of_birth` text,
	`date_of_death` text,
	`last_login_at` text,
	`created_at` text,
	`updated_at` text,
	`updated_from` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);