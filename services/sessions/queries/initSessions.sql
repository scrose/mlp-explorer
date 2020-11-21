
--Sessions Table
DROP TABLE IF EXISTS sessions;

-- create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id serial NOT NULL PRIMARY KEY,
    session_id VARCHAR (255) UNIQUE NOT NULL,
    session_data json NOT NULL,
    expire TIMESTAMP
);

SELECT * FROM sessions;
