-- CreateTable
CREATE TABLE "ranking_products" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'clickbank',
    "vendor_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "category" TEXT,
    "sales_page_url" TEXT NOT NULL,
    "affiliate_link" TEXT,
    "gravity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "initial_price" DOUBLE PRECISION NOT NULL,
    "average_commission" DOUBLE PRECISION NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ranking_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_snapshots" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "gravity" DOUBLE PRECISION NOT NULL,
    "initial_price" DOUBLE PRECISION NOT NULL,
    "average_commission" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER,
    "hub_score" DOUBLE PRECISION,
    "snapshot_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_metrics" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "search_volume" INTEGER NOT NULL DEFAULT 0,
    "cpc" DOUBLE PRECISION,
    "competition" DOUBLE PRECISION,
    "trend" TEXT,
    "country" TEXT NOT NULL DEFAULT 'US',
    "last_updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seo_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "traffic_metrics" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "monthly_visits" BIGINT NOT NULL,
    "bounce_rate" DOUBLE PRECISION,
    "pages_per_visit" DOUBLE PRECISION,
    "avg_visit_duration" INTEGER,
    "direct_traffic" DOUBLE PRECISION,
    "search_traffic" DOUBLE PRECISION,
    "social_traffic" DOUBLE PRECISION,
    "paid_traffic" DOUBLE PRECISION,
    "traffic_change" DOUBLE PRECISION,
    "collected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "traffic_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ranking_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ranking_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ranking_products_vendor_id_key" ON "ranking_products"("vendor_id");

-- CreateIndex
CREATE INDEX "ranking_products_platform_is_active_idx" ON "ranking_products"("platform", "is_active");

-- CreateIndex
CREATE INDEX "ranking_products_gravity_idx" ON "ranking_products"("gravity");

-- CreateIndex
CREATE INDEX "product_snapshots_snapshot_date_idx" ON "product_snapshots"("snapshot_date");

-- CreateIndex
CREATE UNIQUE INDEX "product_snapshots_product_id_snapshot_date_key" ON "product_snapshots"("product_id", "snapshot_date");

-- CreateIndex
CREATE INDEX "seo_metrics_keyword_idx" ON "seo_metrics"("keyword");

-- CreateIndex
CREATE UNIQUE INDEX "seo_metrics_product_id_keyword_country_key" ON "seo_metrics"("product_id", "keyword", "country");

-- CreateIndex
CREATE INDEX "traffic_metrics_collected_at_idx" ON "traffic_metrics"("collected_at");

-- CreateIndex
CREATE UNIQUE INDEX "ranking_config_key_key" ON "ranking_config"("key");

-- AddForeignKey
ALTER TABLE "product_snapshots" ADD CONSTRAINT "product_snapshots_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "ranking_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_metrics" ADD CONSTRAINT "seo_metrics_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "ranking_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traffic_metrics" ADD CONSTRAINT "traffic_metrics_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "ranking_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
