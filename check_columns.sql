-- Check actual column names in the database
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'onboarding_data' 
ORDER BY ordinal_position;
