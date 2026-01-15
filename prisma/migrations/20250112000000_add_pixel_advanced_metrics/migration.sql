-- AlterTable
ALTER TABLE "pixels" ADD COLUMN     "unique_visits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "clean_visits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "paid_traffic_visits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "checkouts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sales" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "bounce_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "blocked_ips" INTEGER NOT NULL DEFAULT 0;

-- AlterTable  
ALTER TABLE "pixel_events" ADD COLUMN     "url" TEXT,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_bot" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_unique" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "blocked_ips" (
    "id" SERIAL NOT NULL,
    "pixel_id" INTEGER NOT NULL,
    "ip_address" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "user_agent" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blocked_ips_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blocked_ips_pixel_id_ip_address_key" ON "blocked_ips"("pixel_id", "ip_address");

-- AddForeignKey
ALTER TABLE "blocked_ips" ADD CONSTRAINT "blocked_ips_pixel_id_fkey" FOREIGN KEY ("pixel_id") REFERENCES "pixels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;