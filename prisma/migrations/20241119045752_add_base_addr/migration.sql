/*
  Warnings:

  - Added the required column `base_address` to the `Device` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Register` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `Register` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "AccessType" ADD VALUE 'RMW';

-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "base_address" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Register" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "width" INTEGER NOT NULL;
