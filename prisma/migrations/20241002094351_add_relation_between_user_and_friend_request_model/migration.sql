/*
  Warnings:

  - You are about to drop the column `receiver` on the `friendrequest` table. All the data in the column will be lost.
  - You are about to drop the column `sender` on the `friendrequest` table. All the data in the column will be lost.
  - Added the required column `receiverId` to the `FriendRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderId` to the `FriendRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `friendrequest` DROP COLUMN `receiver`,
    DROP COLUMN `sender`,
    ADD COLUMN `receiverId` INTEGER NOT NULL,
    ADD COLUMN `senderId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `FriendRequest` ADD CONSTRAINT `FriendRequest_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FriendRequest` ADD CONSTRAINT `FriendRequest_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
