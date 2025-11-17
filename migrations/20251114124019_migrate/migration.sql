/*
  Warnings:

  - You are about to drop the column `createdAt` on the `news` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `news` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `news` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `news` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;
