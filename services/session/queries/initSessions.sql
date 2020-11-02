
--Sessions Table
DROP TABLE IF EXISTS sessions;

-- create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id serial NOT NULL PRIMARY KEY,
    session_id VARCHAR (255) UNIQUE NOT NULL,
    session_data json NOT NULL,
    user_id VARCHAR (255) UNIQUE NOT NULL,
    sign_in_count SMALLINT CHECK (sign_in_count > 0),
    sign_in_at TIMESTAMP,
    sign_in_ip VARCHAR (255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
--    FOREIGN KEY (user_id) REFERENCES users(users.user_id),
--    CHECK (user_id ~* '^[a-fA-F0-9]+$')
);

SELECT * FROM sessions;
