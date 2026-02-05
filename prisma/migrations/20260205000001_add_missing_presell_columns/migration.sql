-- Add all missing columns to presells table
DO $$
BEGIN
    -- Add headline
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'presells' AND column_name = 'headline'
    ) THEN
        ALTER TABLE "presells" ADD COLUMN "headline" TEXT;
    END IF;

    -- Add subheadline
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'presells' AND column_name = 'subheadline'
    ) THEN
        ALTER TABLE "presells" ADD COLUMN "subheadline" TEXT;
    END IF;

    -- Add content_html
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'presells' AND column_name = 'content_html'
    ) THEN
        ALTER TABLE "presells" ADD COLUMN "content_html" TEXT;
    END IF;

    -- Add meta_title
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'presells' AND column_name = 'meta_title'
    ) THEN
        ALTER TABLE "presells" ADD COLUMN "meta_title" TEXT;
    END IF;

    -- Add meta_description
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'presells' AND column_name = 'meta_description'
    ) THEN
        ALTER TABLE "presells" ADD COLUMN "meta_description" TEXT;
    END IF;

    -- Add favicon_url (caso não tenha sido adicionado)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'presells' AND column_name = 'favicon_url'
    ) THEN
        ALTER TABLE "presells" ADD COLUMN "favicon_url" TEXT;
    END IF;

    -- Add html_url
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'presells' AND column_name = 'html_url'
    ) THEN
        ALTER TABLE "presells" ADD COLUMN "html_url" TEXT;
    END IF;

    -- Add screenshot_desktop
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'presells' AND column_name = 'screenshot_desktop'
    ) THEN
        ALTER TABLE "presells" ADD COLUMN "screenshot_desktop" TEXT;
    END IF;

    -- Add screenshot_mobile
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'presells' AND column_name = 'screenshot_mobile'
    ) THEN
        ALTER TABLE "presells" ADD COLUMN "screenshot_mobile" TEXT;
    END IF;

    -- Add published_at
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'presells' AND column_name = 'published_at'
    ) THEN
        ALTER TABLE "presells" ADD COLUMN "published_at" TIMESTAMP(3);
    END IF;
END $$;
