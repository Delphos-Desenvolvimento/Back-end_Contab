-- Reset view events for news article 1 (for testing)
DELETE FROM event_log WHERE type='news_view' AND newsId=1;

-- Check current count (should be 0)
SELECT COUNT(*) as view_count FROM event_log WHERE type='news_view' AND newsId=1;
