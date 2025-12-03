PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
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
	`last_login_at` text,
	`created_at` text,
	`updated_at` text
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "name", "email", "password", "age", "phone", "profile_picture", "bio", "last_login_at", "created_at", "updated_at") SELECT "id", "name", "email", "password", "age", "phone", "profile_picture", "bio", "last_login_at", "created_at", "updated_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);