/*
  Warnings:

  - Added the required column `kebele` to the `Branch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `region` to the `Branch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `woreda` to the `Branch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zone` to the `Branch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "kebele" TEXT NOT NULL,
ADD COLUMN     "region" TEXT NOT NULL,
ADD COLUMN     "woreda" TEXT NOT NULL,
ADD COLUMN     "zone" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "employeeId" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
