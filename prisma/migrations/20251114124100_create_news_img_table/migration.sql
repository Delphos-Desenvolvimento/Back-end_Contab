-- Create the news_img table
CREATE TABLE `news_img` (
  `id` int NOT NULL AUTO_INCREMENT,
  `newsId` int NOT NULL,
  `imgId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `news_img_newsId_imgId_key` (`newsId`,`imgId`),
  KEY `news_img_imgId_fkey` (`imgId`),
  CONSTRAINT `news_img_newsId_fkey` FOREIGN KEY (`newsId`) REFERENCES `news` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `news_img_imgId_fkey` FOREIGN KEY (`imgId`) REFERENCES `img` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
