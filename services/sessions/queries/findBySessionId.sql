SELECT
       session_data
FROM
     sessions
WHERE
      session_id=$1::varchar
AND
      expires >= TO_TIMESTAMP($2)