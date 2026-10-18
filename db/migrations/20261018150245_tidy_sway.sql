CREATE TABLE `loans` (
	`id` text PRIMARY KEY NOT NULL,
	`member_id` text NOT NULL,
	`book_id` text NOT NULL,
	`loaned_on` text NOT NULL,
	`due_on` text NOT NULL,
	`returned_on` text,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `loans_member_book_out` ON `loans` (`member_id`,`book_id`) WHERE "loans"."returned_on" is null;--> statement-breakpoint
CREATE INDEX `loans_member_id` ON `loans` (`member_id`);--> statement-breakpoint
CREATE INDEX `loans_book_id` ON `loans` (`book_id`);