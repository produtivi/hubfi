-- Add favicon_url column to presells table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'presells' AND column_name = 'favicon_url'
    ) THEN
        ALTER TABLE "presells" ADD COLUMN "favicon_url" TEXT;
    END IF;
END $$;
