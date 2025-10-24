-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('onboarding_data', 'inboxes', 'domains')
ORDER BY table_name;
