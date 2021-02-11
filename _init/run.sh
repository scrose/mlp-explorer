#!/bin/sh

# Run initialization
# sh /_init/run.sh

# clear database
 (
 echo "DROP SCHEMA PUBLIC CASCADE;";
 echo "CREATE SCHEMA PUBLIC;";
 ) \
 | psql -U boutrous mlp2

# restore original schema
psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/db/meat.sql

# update existing schema
psql -U boutrous mlp2 < _init/global.init.sql
psql -U boutrous mlp2 < _init/nodes.init.sql
psql -U boutrous mlp2 < _init/files.init.sql;
psql -U boutrous mlp2 < _init/metadata.init.sql;
psql -U boutrous mlp2 < _init/participants.init.sql;
psql -U boutrous mlp2 < _init/users.init.sql;
psql -U boutrous mlp2 < _init/cleanup.init.sql;

echo "MLP database migration completed.";

#eof
