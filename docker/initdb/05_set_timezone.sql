ALTER SYSTEM SET timezone = 'Asia/Tokyo';
SELECT pg_reload_conf();
