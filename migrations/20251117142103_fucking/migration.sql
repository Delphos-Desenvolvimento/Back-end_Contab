/*
  Warnings:

  - Added the required column `updatedAt` to the `news_img` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `news_img` ADD COLUMN `altText` VARCHAR(191) NULL,
    ADD COLUMN `base64` LONGTEXT NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `url` VARCHAR(191) NULL;
