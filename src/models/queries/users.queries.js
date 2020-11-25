/*!
 * MLP.API.Services.Users
 * File: users.services.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Find user by ID. Joined with user roles table.
 */

export const findById = `SELECT
            users.user_id AS user_id,
            user_roles.role_id AS role_id,
            user_roles.name AS role,
            users.email,
            users.reset_password_token,
            users.reset_password_expires,
            users.created_at,
            users.updated_at
        FROM users
        LEFT OUTER JOIN user_roles
        ON users.role_id = user_roles.role_id
        WHERE users.user_id=$1::varchar`;

/**
 * Find all registered users.
 */

export const findAll = `SELECT
            users.user_id AS user_id,
            user_roles.role_id AS role_id,
            user_roles.name AS role,
            users.email,
            users.created_at,
            users.updated_at
        FROM users
        LEFT OUTER JOIN user_roles
        ON users.role_id = user_roles.role_id`;

/**
 * Update user data.
 */

export const update = `UPDATE users
            SET
            email = $2::text,
            role_id = $3::integer,
            updated_at = NOW()::timestamp
            WHERE
            user_id = $1::varchar
            AND
            role_id != 5
            RETURNING *`;

/**
 * Insert new user.
 */

export const insert = `INSERT INTO users(
                  user_id, 
                  email, 
                  password, 
                  salt_token, 
                  role_id, 
                  created_at, 
                  updated_at
        ) VALUES(
                 $1::varchar, 
                 $2::varchar, 
                 $3::varchar, 
                 $4::varchar, 
                 $5::integer, 
                 NOW()::timestamp, 
                 NOW()::timestamp
                 ) 
        RETURNING user_id`;

/**
 * Delete user.
 */

export const remove = `DELETE FROM users
            WHERE user_id = $1::varchar
              AND role_id != 5
                RETURNING *`;

/**
 * Initialize users table
 */

export const init = `CREATE TABLE IF NOT EXISTS user_roles (
    id serial PRIMARY KEY,
    role_id SMALLINT UNIQUE NOT NULL,
    name VARCHAR (255) UNIQUE NOT NULL);
INSERT INTO user_roles (role_id, name) VALUES (1, 'Registered');
INSERT INTO user_roles (role_id, name) VALUES (2, 'Editor');
INSERT INTO user_roles (role_id, name) VALUES (3, 'Contributor');
INSERT INTO user_roles (role_id, name) VALUES (4, 'Administrator');
INSERT INTO user_roles (role_id, name) VALUES (5, 'Super-Administrator');
CREATE TABLE IF NOT EXISTS users (
    id serial PRIMARY KEY,
    user_id VARCHAR (255) UNIQUE NOT NULL,
    role_id SMALLINT NOT NULL DEFAULT 1,
    email VARCHAR (255) UNIQUE NOT NULL,
    password VARCHAR (512) NOT NULL,
    salt_token VARCHAR (255) NOT NULL,
    reset_password_token VARCHAR (255),
    reset_password_expires TIMESTAMP,
    last_sign_in_at TIMESTAMP,
    last_sign_in_ip VARCHAR (255),
    created_at TIMESTAMP,
    pdated_at TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES user_roles(role_id),
    CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,63}$'),
    CHECK (password ~* '^[a-fA-F0-9]+$'),
    CHECK (salt_token ~* '^[a-fA-F0-9]+$')
    );
    INSERT INTO users(
              user_id,
              email,
              password,
              salt_token,
              role_id,
              created_at,
              updated_at
              )
          VALUES(
                 $1::varchar,
                 $2::varchar,
                 $3::varchar,
                 $4::varchar,
                 5,
                 NOW()::timestamp,
                 NOW()::timestamp\n
                 )
        RETURNING *;`;