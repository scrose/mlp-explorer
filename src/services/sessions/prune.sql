DELETE
FROM
     sessions
WHERE
      expires < NOW()::timestamp
RETURNING
    session_id