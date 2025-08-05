-- Check if database schema exists
-- Run this in Supabase SQL Editor first

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- If tables exist, check current users
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'utilisateurs') THEN
        RAISE NOTICE 'Users table exists, checking content...';
    ELSE
        RAISE NOTICE 'Users table does NOT exist - you need to run the schema first!';
    END IF;
END
$$;

-- Check users if table exists
SELECT COUNT(*) as user_count FROM utilisateurs;