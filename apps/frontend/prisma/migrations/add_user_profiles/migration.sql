-- AlterTable
ALTER TABLE "User" ADD COLUMN "username" TEXT UNIQUE,
ADD COLUMN "twitterUrl" TEXT,
ADD COLUMN "portfolioUrl" TEXT,
ADD COLUMN "skills" TEXT[] DEFAULT ARRAY[]::TEXT[];
