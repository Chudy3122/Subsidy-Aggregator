-- CreateTable
CREATE TABLE "sources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "scraper_type" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "last_scraped" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nabory" (
    "id" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "date_from" TIMESTAMP(3),
    "date_to" TIMESTAMP(3),
    "amount" TEXT,
    "type" TEXT,
    "link" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "content_hash" TEXT NOT NULL,
    "scraped_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nabory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scraping_logs" (
    "id" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error_message" TEXT,
    "items_found" INTEGER NOT NULL DEFAULT 0,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scraping_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "nabory_source_id_idx" ON "nabory"("source_id");

-- CreateIndex
CREATE INDEX "nabory_date_from_idx" ON "nabory"("date_from");

-- CreateIndex
CREATE INDEX "nabory_date_to_idx" ON "nabory"("date_to");

-- CreateIndex
CREATE INDEX "nabory_status_idx" ON "nabory"("status");

-- CreateIndex
CREATE UNIQUE INDEX "nabory_content_hash_key" ON "nabory"("content_hash");

-- CreateIndex
CREATE INDEX "scraping_logs_source_id_idx" ON "scraping_logs"("source_id");

-- CreateIndex
CREATE INDEX "scraping_logs_timestamp_idx" ON "scraping_logs"("timestamp");

-- AddForeignKey
ALTER TABLE "nabory" ADD CONSTRAINT "nabory_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scraping_logs" ADD CONSTRAINT "scraping_logs_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
