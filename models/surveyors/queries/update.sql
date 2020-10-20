UPDATE surveyors
SET
published = $2::boolean,
last_name = $3::text,
given_names = $4::text,
short_name = $5::text,
affiliation = $6::text
WHERE id = $1::integer
RETURNING *