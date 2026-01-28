-- CreateTable
CREATE TABLE "client" (
    "client_id" TEXT NOT NULL,
    "client_username" TEXT,
    "client_password" TEXT,
    "client_phone_num" DECIMAL(65,30),
    "client_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trip_id" TEXT,

    CONSTRAINT "client_pkey" PRIMARY KEY ("client_id")
);

-- CreateTable
CREATE TABLE "driver" (
    "driver_id" TEXT NOT NULL,
    "driver_username" TEXT,
    "driver_password" TEXT,
    "driver_phone_num" DECIMAL(65,30),
    "driver_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "driver_num_permis" TEXT,
    "driver_photo_permis" TEXT,
    "driver_ennabled" BOOLEAN NOT NULL DEFAULT true,
    "driver_plate_num" TEXT,
    "itinerary_id" TEXT,
    "trip_id" TEXT,

    CONSTRAINT "driver_pkey" PRIMARY KEY ("driver_id")
);

-- CreateTable
CREATE TABLE "admin" (
    "admin_id" TEXT NOT NULL,
    "admin_username" TEXT,
    "admin_password" TEXT,
    "admin_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "driver_id" TEXT,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("admin_id")
);

-- CreateTable
CREATE TABLE "itinerary" (
    "itinerary_id" TEXT NOT NULL,
    "itinerary_start_lat" BIGINT NOT NULL,
    "itinerary_start_long" BIGINT NOT NULL,
    "itinerary_end_lat" BIGINT NOT NULL,
    "itinerary_end_long" BIGINT NOT NULL,
    "itinerary_distance" BIGINT NOT NULL,
    "itinerary_estimated_duration" BIGINT NOT NULL,
    "itinerary_encoded_polyline" TEXT,

    CONSTRAINT "itinerary_pkey" PRIMARY KEY ("itinerary_id")
);

-- CreateTable
CREATE TABLE "trips" (
    "trip_id" TEXT NOT NULL,
    "trip_status" TEXT,
    "trip_pickup_addr" TEXT,
    "trip_destination_addr" TEXT,
    "trip_cost" DOUBLE PRECISION,
    "trip_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trip_finished_at" TIMESTAMP(3),

    CONSTRAINT "trips_pkey" PRIMARY KEY ("trip_id")
);

-- AddForeignKey
ALTER TABLE "client" ADD CONSTRAINT "client_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("trip_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver" ADD CONSTRAINT "driver_itinerary_id_fkey" FOREIGN KEY ("itinerary_id") REFERENCES "itinerary"("itinerary_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver" ADD CONSTRAINT "driver_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("trip_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin" ADD CONSTRAINT "admin_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "driver"("driver_id") ON DELETE SET NULL ON UPDATE CASCADE;
