/*
  Warnings:

  - You are about to drop the `newsimg` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `newsimg`;

-- CreateTable
CREATE TABLE `news_img` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `newsId` INTEGER NOT NULL,
    `imgId` INTEGER NOT NULL,

    UNIQUE INDEX `news_img_newsId_imgId_key`(`newsId`, `imgId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `news_img` ADD CONSTRAINT `news_img_newsId_fkey` FOREIGN KEY (`newsId`) REFERENCES `news`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `news_img` ADD CONSTRAINT `news_img_imgId_fkey` FOREIGN KEY (`imgId`) REFERENCES `Img`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
