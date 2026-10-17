CREATE TABLE `books` (
	`id` text PRIMARY KEY NOT NULL,
	`isbn` text NOT NULL,
	`title` text NOT NULL,
	`author` text NOT NULL,
	`stock` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `books_isbn` ON `books` (`isbn`);