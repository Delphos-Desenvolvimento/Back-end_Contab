-- Create comments table to store article comments and replies
CREATE TABLE IF NOT EXISTS `comments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `newsId` INT NOT NULL,
  `parent_id` INT NULL,
  `author` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_comments_newsId` (`newsId`),
  INDEX `idx_comments_parent_id` (`parent_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Optional: add foreign keys if the target tables exist and allow it
-- ALTER TABLE `comments` ADD CONSTRAINT `fk_comments_news` FOREIGN KEY (`newsId`) REFERENCES `news`(`id`) ON DELETE CASCADE;
-- ALTER TABLE `comments` ADD CONSTRAINT `fk_comments_parent` FOREIGN KEY (`parent_id`) REFERENCES `comments`(`id`) ON DELETE CASCADE;
