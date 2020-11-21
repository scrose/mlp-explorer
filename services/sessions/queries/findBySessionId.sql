SELECT session_data
FROM sessions
WHERE
sessions.session_id=$1::varchar
AND
expire >= TO_TIMESTAMP($2)