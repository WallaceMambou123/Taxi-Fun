/*
  Warnings:

  - You are about to drop the column `account_id` on the `admin` table. All the data in the column will be lost.
  - You are about to drop the column `account_id` on the `client` table. All the data in the column will be lost.
  - You are about to drop the column `account_id` on the `driver` table. All the data in the column will be lost.
  - You are about to drop the column `reviewer_id` on the `review` table. All the data in the column will be lost.
  - You are about to alter the column `rating_score` on the `review` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - The `status` column on the `trips` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `account_id` on the `wallet` table. All the data in the column will be lost.
  - You are about to drop the `account` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `admin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone_number]` on the table `client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone_number]` on the table `driver` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[client_id]` on the table `wallet` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[driver_id]` on the table `wallet` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_hash` to the `admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone_number` to the `client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone_number` to the `driver` table without a default value. This is not possible if the table is not empty.
  - Made the column `rating_score` on table `review` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "admin" DROP CONSTRAINT "admin_account_id_fkey";

-- DropForeignKey
ALTER TABLE "client" DROP CONSTRAINT "client_account_id_fkey";

-- DropForeignKey
ALTER TABLE "driver" DROP CONSTRAINT "driver_account_id_fkey";

-- DropForeignKey
ALTER TABLE "review" DROP CONSTRAINT "review_reviewer_id_fkey";

-- DropForeignKey
ALTER TABLE "wallet" DROP CONSTRAINT "wallet_account_id_fkey";

-- DropIndex
DROP INDEX "admin_account_id_key";

-- DropIndex
DROP INDEX "client_account_id_key";

-- DropIndex
DROP INDEX "driver_account_id_key";

-- DropIndex
DROP INDEX "wallet_account_id_key";

-- AlterTable
ALTER TABLE "admin" DROP COLUMN "account_id",
ADD COLUMN     "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" VARCHAR(255) NOT NULL,
ADD COLUMN     "password_hash" TEXT NOT NULL,
ADD COLUMN     "username" VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE "client" DROP COLUMN "account_id",
ADD COLUMN     "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" VARCHAR(255),
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "phone_number" VARCHAR(20) NOT NULL,
ALTER COLUMN "rating" DROP NOT NULL;

-- AlterTable
ALTER TABLE "driver" DROP COLUMN "account_id",
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "phone_number" VARCHAR(20) NOT NULL,
ALTER COLUMN "rating" DROP NOT NULL;

-- AlterTable
ALTER TABLE "review" DROP COLUMN "reviewer_id",
ADD COLUMN     "client_reviewer_id" UUID,
ADD COLUMN     "driver_reviewer_id" UUID,
ALTER COLUMN "rating_score" SET NOT NULL,
ALTER COLUMN "rating_score" SET DATA TYPE SMALLINT;

-- AlterTable
ALTER TABLE "trips" DROP COLUMN "status",
ADD COLUMN     "status" VARCHAR(20) NOT NULL DEFAULT 'REQUESTED';

-- AlterTable
ALTER TABLE "wallet" DROP COLUMN "account_id",
ADD COLUMN     "client_id" UUID,
ADD COLUMN     "driver_id" UUID;

-- DropTable
DROP TABLE "account";

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "TripStatus";

-- CreateIndex
CREATE UNIQUE INDEX "admin_email_key" ON "admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "client_phone_number_key" ON "client"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "client_email_key" ON "client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "driver_phone_number_key" ON "driver"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_client_id_key" ON "wallet"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_driver_id_key" ON "wallet"("driver_id");

-- AddForeignKey
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_client_reviewer_id_fkey" FOREIGN KEY ("client_reviewer_id") REFERENCES "client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_driver_reviewer_id_fkey" FOREIGN KEY ("driver_reviewer_id") REFERENCES "driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;
