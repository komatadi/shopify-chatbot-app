-- AlterTable
ALTER TABLE "Session" ADD COLUMN "firstName" TEXT,
ADD COLUMN "lastName" TEXT,
ADD COLUMN "email" TEXT,
ADD COLUMN "accountOwner" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "locale" TEXT,
ADD COLUMN "collaborator" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;
