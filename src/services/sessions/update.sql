UPDATE sessions
SET
    expires = TO_TIMESTAMP($2),
    session_data = $3::json
WHERE
      session_id = $1::varchar
RETURNING session_id