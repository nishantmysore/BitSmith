/*
  Warnings:

  - Changed the type of `access` on the `Field` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AccessType" AS ENUM ('RO', 'WO', 'RW', 'RW1C', 'W1S', 'W1C', 'RSVD');

-- AlterTable
ALTER TABLE "Field" DROP COLUMN "access",
ADD COLUMN     "access" "AccessType" NOT NULL;
