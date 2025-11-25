-- Create table event_log to store frontend events
CREATE TABLE `event_log` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `type` VARCHAR(191) NOT NULL,
  `newsId` INT NULL,
  `path` VARCHAR(255) NULL,
  `userId` INT NULL,
  `userAgent` VARCHAR(255) NULL,
  `ip` VARCHAR(64) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;