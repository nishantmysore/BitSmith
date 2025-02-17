/*
  Warnings:

  - You are about to drop the column `base_address` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `bits` on the `Field` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Register` table. All the data in the column will be lost.
  - You are about to drop the column `deviceId` on the `Register` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[peripheralId,name]` on the table `Register` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `access` on the `Field` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `access` to the `Register` table without a default value. This is not possible if the table is not empty.
  - Added the required column `peripheralId` to the `Register` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RegisterAccessType" AS ENUM ('RO', 'WO', 'RW', 'RW1C', 'W1S', 'W1C', 'RMW', 'RSVD');

-- CreateEnum
CREATE TYPE "FieldAccessType" AS ENUM ('RO', 'WO', 'RW', 'RW1C', 'W1S', 'W1C', 'RMW', 'RSVD');

-- DropForeignKey
ALTER TABLE "Register" DROP CONSTRAINT "Register_deviceId_fkey";

-- AlterTable
ALTER TABLE "Device" DROP COLUMN "base_address",
ADD COLUMN     "defaultClockFreq" INTEGER,
ADD COLUMN     "littleEndian" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "version" TEXT;

-- AlterTable
ALTER TABLE "Field" DROP COLUMN "bits",
ADD COLUMN     "bitOffset" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "bitWidth" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "readAction" TEXT,
ADD COLUMN     "writeAction" TEXT,
DROP COLUMN "access",
ADD COLUMN     "access" "FieldAccessType" NOT NULL;

-- AlterTable
ALTER TABLE "Register" DROP COLUMN "address",
DROP COLUMN "deviceId",
ADD COLUMN     "access" "RegisterAccessType" NOT NULL,
ADD COLUMN     "addressOffset" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "arraySize" INTEGER,
ADD COLUMN     "arrayStride" BIGINT,
ADD COLUMN     "isArray" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "modifiedWriteValues" TEXT,
ADD COLUMN     "namePattern" TEXT,
ADD COLUMN     "peripheralId" TEXT NOT NULL,
ADD COLUMN     "readAction" TEXT,
ADD COLUMN     "resetMask" BIGINT,
ADD COLUMN     "resetValue" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "writeAction" TEXT;

-- DropEnum
DROP TYPE "AccessType";

-- CreateTable
CREATE TABLE "Peripheral" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "baseAddress" BIGINT NOT NULL,
    "size" BIGINT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Peripheral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FieldEnum" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "description" TEXT,
    "fieldId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FieldEnum_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Peripheral_deviceId_idx" ON "Peripheral"("deviceId");

-- CreateIndex
CREATE INDEX "FieldEnum_fieldId_idx" ON "FieldEnum"("fieldId");

-- CreateIndex
CREATE UNIQUE INDEX "FieldEnum_fieldId_value_key" ON "FieldEnum"("fieldId", "value");

-- CreateIndex
CREATE UNIQUE INDEX "Register_peripheralId_name_key" ON "Register"("peripheralId", "name");

-- AddForeignKey
ALTER TABLE "Peripheral" ADD CONSTRAINT "Peripheral_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Register" ADD CONSTRAINT "Register_peripheralId_fkey" FOREIGN KEY ("peripheralId") REFERENCES "Peripheral"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldEnum" ADD CONSTRAINT "FieldEnum_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE CASCADE ON UPDATE CASCADE;
