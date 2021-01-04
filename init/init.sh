#!/bin/sh

# clear database
 (
 echo "DROP SCHEMA PUBLIC CASCADE;";
 echo "CREATE SCHEMA PUBLIC;";
 ) \
 | psql -U boutrous mlp2

# restore original schema
psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/mlp-explorer/init/meat.sql

# update existing schema
psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/mlp-explorer/init/global.init.sql
psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/mlp-explorer/init/nodes.init.sql
psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/mlp-explorer/init/files.init.sql;
psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/mlp-explorer/init/metadata.init.sql;
psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/mlp-explorer/init/participants.init.sql;
psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/mlp-explorer/init/users.init.sql;
psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/mlp-explorer/init/cleanup.init.sql;

echo "MLP database migration completed.";

#eof
