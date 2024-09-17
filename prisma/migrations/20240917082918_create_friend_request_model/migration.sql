-- CreateTable
CREATE TABLE `FriendRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sender` VARCHAR(191) NOT NULL,
    `receiver` VARCHAR(191) NOT NULL,
    `sentDate` DATETIME(3) NOT NULL,
    `status` ENUM('ACCEPTED', 'REJECTED', 'PENDING') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
