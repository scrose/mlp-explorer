DELETE FROM sessions
WHERE expire < NOW()::timestamp
RETURNING session_id