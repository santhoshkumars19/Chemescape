-- AlterTable
ALTER TABLE `rooms` ADD COLUMN `gameConfig` JSON NULL,
    ADD COLUMN `gameType` ENUM('CALCULATION_HEIST', 'QUANTUM_ARCHITECT', 'GRID_RECONSTRUCTION', 'HYDROGEN_REACTOR', 'METAL_SORTING', 'GAS_SIMULATOR', 'ENERGY_CORE', 'EQUILIBRIUM_STABILIZER', 'PRECISION_MIXING', 'MOLECULAR_BUILDER', 'CARBON_DETECTIVE', 'REACTION_CIPHER', 'PETROCHEMICAL_PIPELINE', 'STEREOCHEMICAL_VAULT', 'ECOLOGICAL_STRATEGY') NOT NULL DEFAULT 'CALCULATION_HEIST';

-- AlterTable
ALTER TABLE `subjects` MODIFY `icon` VARCHAR(191) NULL DEFAULT '🧪';

-- AlterTable
ALTER TABLE `users` MODIFY `avatar` VARCHAR(191) NULL DEFAULT '🧪';

-- CreateTable
CREATE TABLE `user_game_progress` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `chapterId` VARCHAR(191) NOT NULL,
    `roomId` VARCHAR(191) NOT NULL,
    `highScore` INTEGER NOT NULL DEFAULT 0,
    `starsEarned` INTEGER NOT NULL DEFAULT 0,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `bestTimeSec` INTEGER NULL,
    `isCompleted` BOOLEAN NOT NULL DEFAULT false,
    `gameState` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_game_progress_userId_roomId_key`(`userId`, `roomId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_badges` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `badgeName` VARCHAR(191) NOT NULL,
    `badgeDescription` TEXT NULL,
    `badgeIcon` VARCHAR(191) NULL DEFAULT '🏆',
    `unlockedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_badges_userId_badgeName_key`(`userId`, `badgeName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `game_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `roomId` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'COMPLETED', 'FAILED', 'ABANDONED') NOT NULL DEFAULT 'ACTIVE',
    `score` INTEGER NOT NULL DEFAULT 0,
    `stars` INTEGER NOT NULL DEFAULT 0,
    `livesRemaining` INTEGER NOT NULL DEFAULT 3,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,
    `timeSpentSec` INTEGER NOT NULL DEFAULT 0,
    `sessionState` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `game_rewards` (
    `id` VARCHAR(191) NOT NULL,
    `roomId` VARCHAR(191) NOT NULL,
    `xp` INTEGER NOT NULL DEFAULT 500,
    `coins` INTEGER NOT NULL DEFAULT 100,
    `badgeName` VARCHAR(191) NULL,
    `badgeDescription` TEXT NULL,
    `badgeIcon` VARCHAR(191) NULL DEFAULT '🏆',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `game_rewards_roomId_key`(`roomId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_stats` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `totalXP` INTEGER NOT NULL DEFAULT 0,
    `totalCoins` INTEGER NOT NULL DEFAULT 0,
    `currentLevel` INTEGER NOT NULL DEFAULT 1,
    `currentStreak` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_stats_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_game_progress` ADD CONSTRAINT `user_game_progress_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_game_progress` ADD CONSTRAINT `user_game_progress_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `chapters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_game_progress` ADD CONSTRAINT `user_game_progress_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_badges` ADD CONSTRAINT `user_badges_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `game_sessions` ADD CONSTRAINT `game_sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `game_sessions` ADD CONSTRAINT `game_sessions_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `game_rewards` ADD CONSTRAINT `game_rewards_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_stats` ADD CONSTRAINT `user_stats_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
