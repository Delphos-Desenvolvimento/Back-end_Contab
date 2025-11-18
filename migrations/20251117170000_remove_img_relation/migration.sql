ALTER TABLE `news_img`
  DROP FOREIGN KEY `news_img_imgId_fkey`;
ALTER TABLE `news_img`
  DROP FOREIGN KEY `news_img_newsId_fkey`;

SET @idxExists := (
  SELECT COUNT(1) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'news_img'
    AND INDEX_NAME = 'news_img_newsId_imgId_key'
);
SET @sql := IF(@idxExists > 0, 'DROP INDEX `news_img_newsId_imgId_key` ON `news_img`;', 'SELECT 1;');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

ALTER TABLE `news_img`
  DROP COLUMN `imgId`;

DROP TABLE IF EXISTS `img`;
DROP TABLE IF EXISTS `Img`;

SET @idxExists3 := (
  SELECT COUNT(1) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'news_img'
    AND INDEX_NAME = 'news_img_newsId_fkey'
);
SET @sql3 := IF(@idxExists3 = 0, 'CREATE INDEX `news_img_newsId_fkey` ON `news_img`(`newsId`);', 'SELECT 1;');
PREPARE stmt3 FROM @sql3; EXECUTE stmt3; DEALLOCATE PREPARE stmt3;

ALTER TABLE `news_img`
  ADD CONSTRAINT `news_img_newsId_fkey`
  FOREIGN KEY (`newsId`) REFERENCES `news`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;