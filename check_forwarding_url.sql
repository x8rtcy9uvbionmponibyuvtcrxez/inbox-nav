-- Query to check the most recent order's onboarding data
SELECT 
  o.id as order_id,
  o.status,
  od.website as forwarding_url,
  od.business_type,
  od.created_at
FROM orders o
LEFT JOIN onboarding_data od ON o.id = od.order_id
ORDER BY o.created_at DESC
LIMIT 5;
