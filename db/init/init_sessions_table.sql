/*
--Sessions Table
DROP TABLE IF EXISTS sessions;

-- create sessions table
CREATE TABLE IF NOT EXISTS sessions (
id serial PRIMARY KEY,
    session_id VARCHAR (255) UNIQUE NOT NULL,
    user_id VARCHAR (255) UNIQUE NOT NULL,
    sign_in_count SMALLINT CHECK sign_in_count > 0,
    sign_in_at TIMESTAMP,
    sign_in_ip VARCHAR (255),
    created_at TIMESTAMP,
    max_age TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    CHECK (user_id ~* '^[a-fA-F0-9]+$')
);

SELECT * FROM sessions;
