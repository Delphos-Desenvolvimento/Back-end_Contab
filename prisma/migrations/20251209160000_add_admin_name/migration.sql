-- Add optional name field to admins table
ALTER TABLE `admins` ADD COLUMN `name` VARCHAR(255) NULL;
