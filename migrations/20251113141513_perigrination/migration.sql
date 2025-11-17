/*
  Warnings:

  - You are about to drop the column `published` on the `news` table. All the data in the column will be lost.
  - Added the required column `category` to the `News` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `news` DROP COLUMN `published`,
    ADD COLUMN `category` VARCHAR(191) NOT NULL,
    ADD COLUMN `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `imageUrl` VARCHAR(191) NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'rascunho',
    ADD COLUMN `views` INTEGER NOT NULL DEFAULT 0,
    MODIFY `content` LONGTEXT NOT NULL;
