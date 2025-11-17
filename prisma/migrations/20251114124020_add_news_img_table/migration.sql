-- CreateTable
CREATE TABLE `news_img` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `newsId` INT NOT NULL,
    `imgId` INT NOT NULL,
    PRIMARY KEY (`id`),
    INDEX `news_img_newsId_fkey`(`newsId`),
    INDEX `news_img_imgId_fkey`(`imgId`),
    CONSTRAINT `news_img_newsId_fkey` FOREIGN KEY (`newsId`) REFERENCES `news`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `news_img_imgId_fkey` FOREIGN KEY (`imgId`) REFERENCES `img`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
