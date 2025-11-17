-- Add foreign key constraints to news_img table
ALTER TABLE `news_img` 
ADD CONSTRAINT `news_img_newsId_fkey` 
FOREIGN KEY (`newsId`) 
REFERENCES `news`(`id`) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

ALTER TABLE `news_img` 
ADD CONSTRAINT `news_img_imgId_fkey` 
FOREIGN KEY (`imgId`) 
REFERENCES `img`(`id`) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Add unique constraint for the many-to-many relationship
ALTER TABLE `news_img` 
ADD UNIQUE INDEX `news_img_newsId_imgId_key`(`newsId`, `imgId`);
