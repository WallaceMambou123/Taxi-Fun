/*
  Warnings:

  - The primary key for the `admin` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `admin_created_at` on the `admin` table. All the data in the column will be lost.
  - You are about to drop the column `admin_id` on the `admin` table. All the data in the column will be lost.
  - You are about to drop the column `admin_password` on the `admin` table. All the data in the column will be lost.
  - You are about to drop the column `admin_username` on the `admin` table. All the data in the column will be lost.
  - You are about to drop the column `driver_id` on the `admin` table. All the data in the column will be lost.
  - The primary key for the `client` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `client_created_at` on the `client` table. All the data in the column will be lost.
  - You are about to drop the column `client_id` on the `client` table. All the data in the column will be lost.
  - You are about to drop the column `client_password` on the `client` table. All the data in the column will be lost.
  - You are about to drop the column `client_phone_num` on the `client` table. All the data in the column will be lost.
  - You are about to drop the column `client_username` on the `client` table. All the data in the column will be lost.
  - You are about to drop the column `trip_id` on the `client` table. All the data in the column will be lost.
  - The primary key for the `driver` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `driver_created_at` on the `driver` table. All the data in the column will be lost.
  - You are about to drop the column `driver_ennabled` on the `driver` table. All the data in the column will be lost.
  - You are about to drop the column `driver_id` on the `driver` table. All the data in the column will be lost.
  - You are about to drop the column `driver_num_permis` on the `driver` table. All the data in the column will be lost.
  - You are about to drop the column `driver_password` on the `driver` table. All the data in the column will be lost.
  - You are about to drop the column `driver_phone_num` on the `driver` table. All the data in the column will be lost.
  - You are about to drop the column `driver_photo_permis` on the `driver` table. All the data in the column will be lost.
  - You are about to drop the column `driver_plate_num` on the `driver` table. All the data in the column will be lost.
  - You are about to drop the column `driver_username` on the `driver` table. All the data in the column will be lost.
  - You are about to drop the column `itinerary_id` on the `driver` table. All the data in the column will be lost.
  - You are about to drop the column `trip_id` on the `driver` table. All the data in the column will be lost.
  - The primary key for the `itinerary` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `itinerary_distance` on the `itinerary` table. All the data in the column will be lost.
  - You are about to drop the column `itinerary_encoded_polyline` on the `itinerary` table. All the data in the column will be lost.
  - You are about to drop the column `itinerary_end_lat` on the `itinerary` table. All the data in the column will be lost.
  - You are about to drop the column `itinerary_end_long` on the `itinerary` table. All the data in the column will be lost.
  - You are about to drop the column `itinerary_estimated_duration` on the `itinerary` table. All the data in the column will be lost.
  - You are about to drop the column `itinerary_id` on the `itinerary` table. All the data in the column will be lost.
  - You are about to drop the column `itinerary_start_lat` on the `itinerary` table. All the data in the column will be lost.
  - You are about to drop the column `itinerary_start_long` on the `itinerary` table. All the data in the column will be lost.
  - The primary key for the `trips` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `trip_cost` on the `trips` table. All the data in the column will be lost.
  - You are about to drop the column `trip_created_at` on the `trips` table. All the data in the column will be lost.
  - You are about to drop the column `trip_destination_addr` on the `trips` table. All the data in the column will be lost.
  - You are about to drop the column `trip_finished_at` on the `trips` table. All the data in the column will be lost.
  - You are about to drop the column `trip_id` on the `trips` table. All the data in the column will be lost.
  - You are about to drop the column `trip_pickup_addr` on the `trips` table. All the data in the column will be lost.
  - You are about to drop the column `trip_status` on the `trips` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[account_id]` on the table `admin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[account_id]` on the table `client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[taxi_plate]` on the table `driver` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[license_number]` on the table `driver` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[account_id]` on the table `driver` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `account_id` to the `admin` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `admin` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `account_id` to the `client` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `client` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `account_id` to the `driver` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `driver` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `end_lat` to the `itinerary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_lng` to the `itinerary` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `itinerary` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `start_lat` to the `itinerary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_lng` to the `itinerary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `client_id` to the `trips` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `trips` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENT', 'DRIVER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('REQUESTED', 'ACCEPTED', 'ON_GOING', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "admin" DROP CONSTRAINT "admin_driver_id_fkey";

-- DropForeignKey
ALTER TABLE "client" DROP CONSTRAINT "client_trip_id_fkey";

-- DropForeignKey
ALTER TABLE "driver" DROP CONSTRAINT "driver_itinerary_id_fkey";

-- DropForeignKey
ALTER TABLE "driver" DROP CONSTRAINT "driver_trip_id_fkey";

-- AlterTable
ALTER TABLE "admin" DROP CONSTRAINT "admin_pkey",
DROP COLUMN "admin_created_at",
DROP COLUMN "admin_id",
DROP COLUMN "admin_password",
DROP COLUMN "admin_username",
DROP COLUMN "driver_id",
ADD COLUMN     "account_id" UUID NOT NULL,
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "admin_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "client" DROP CONSTRAINT "client_pkey",
DROP COLUMN "client_created_at",
DROP COLUMN "client_id",
DROP COLUMN "client_password",
DROP COLUMN "client_phone_num",
DROP COLUMN "client_username",
DROP COLUMN "trip_id",
ADD COLUMN     "account_id" UUID NOT NULL,
ADD COLUMN     "first_name" VARCHAR(100),
ADD COLUMN     "id" UUID NOT NULL,
ADD COLUMN     "last_name" VARCHAR(100),
ADD COLUMN     "photo_url" TEXT,
ADD COLUMN     "rating" DECIMAL(2,1) NOT NULL DEFAULT 5.0,
ADD CONSTRAINT "client_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "driver" DROP CONSTRAINT "driver_pkey",
DROP COLUMN "driver_created_at",
DROP COLUMN "driver_ennabled",
DROP COLUMN "driver_id",
DROP COLUMN "driver_num_permis",
DROP COLUMN "driver_password",
DROP COLUMN "driver_phone_num",
DROP COLUMN "driver_photo_permis",
DROP COLUMN "driver_plate_num",
DROP COLUMN "driver_username",
DROP COLUMN "itinerary_id",
DROP COLUMN "trip_id",
ADD COLUMN     "account_id" UUID NOT NULL,
ADD COLUMN     "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" UUID NOT NULL,
ADD COLUMN     "is_available" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "license_number" VARCHAR(50),
ADD COLUMN     "photo_url" TEXT,
ADD COLUMN     "rating" DECIMAL(2,1) NOT NULL DEFAULT 5.0,
ADD COLUMN     "taxi_plate" VARCHAR(20),
ADD CONSTRAINT "driver_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "itinerary" DROP CONSTRAINT "itinerary_pkey",
DROP COLUMN "itinerary_distance",
DROP COLUMN "itinerary_encoded_polyline",
DROP COLUMN "itinerary_end_lat",
DROP COLUMN "itinerary_end_long",
DROP COLUMN "itinerary_estimated_duration",
DROP COLUMN "itinerary_id",
DROP COLUMN "itinerary_start_lat",
DROP COLUMN "itinerary_start_long",
ADD COLUMN     "distance_km" DOUBLE PRECISION,
ADD COLUMN     "encoded_polyline" TEXT,
ADD COLUMN     "end_lat" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "end_lng" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "estimated_duration_min" INTEGER,
ADD COLUMN     "id" UUID NOT NULL,
ADD COLUMN     "name" VARCHAR(255),
ADD COLUMN     "start_lat" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "start_lng" DOUBLE PRECISION NOT NULL,
ADD CONSTRAINT "itinerary_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "trips" DROP CONSTRAINT "trips_pkey",
DROP COLUMN "trip_cost",
DROP COLUMN "trip_created_at",
DROP COLUMN "trip_destination_addr",
DROP COLUMN "trip_finished_at",
DROP COLUMN "trip_id",
DROP COLUMN "trip_pickup_addr",
DROP COLUMN "trip_status",
ADD COLUMN     "client_id" UUID NOT NULL,
ADD COLUMN     "destination_address" TEXT,
ADD COLUMN     "driver_id" UUID,
ADD COLUMN     "ended_at" TIMESTAMPTZ,
ADD COLUMN     "id" UUID NOT NULL,
ADD COLUMN     "pickup_address" TEXT,
ADD COLUMN     "price" DECIMAL(10,2),
ADD COLUMN     "started_at" TIMESTAMPTZ,
ADD COLUMN     "status" "TripStatus" NOT NULL DEFAULT 'REQUESTED',
ADD CONSTRAINT "trips_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "account" (
    "id" UUID NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255),
    "phone_number" VARCHAR(20),
    "password_hash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CLIENT',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet" (
    "id" UUID NOT NULL,
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'XAF',
    "account_id" UUID NOT NULL,

    CONSTRAINT "wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review" (
    "id" UUID NOT NULL,
    "rating_score" INTEGER,
    "comment" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trip_id" UUID NOT NULL,
    "reviewer_id" UUID NOT NULL,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_username_key" ON "account"("username");

-- CreateIndex
CREATE UNIQUE INDEX "account_email_key" ON "account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "account_phone_number_key" ON "account"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_account_id_key" ON "wallet"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_trip_id_key" ON "review"("trip_id");

-- CreateIndex
CREATE UNIQUE INDEX "admin_account_id_key" ON "admin"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "client_account_id_key" ON "client"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "driver_taxi_plate_key" ON "driver"("taxi_plate");

-- CreateIndex
CREATE UNIQUE INDEX "driver_license_number_key" ON "driver"("license_number");

-- CreateIndex
CREATE UNIQUE INDEX "driver_account_id_key" ON "driver"("account_id");

-- AddForeignKey
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client" ADD CONSTRAINT "client_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver" ADD CONSTRAINT "driver_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin" ADD CONSTRAINT "admin_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
