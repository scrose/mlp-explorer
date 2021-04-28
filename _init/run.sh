#!/bin/sh

# Run initialization
# sh /_init/run.sh

# clear database
 (
 echo "DROP SCHEMA PUBLIC CASCADE;";
 echo "CREATE SCHEMA PUBLIC;";
 ) \
 | psql -U boutrous mlp3

# restore original schema
# psql -U boutrous mlp3 < /Users/boutrous/Workspace/NodeJS/db/meat_backup_28apr2021.sql
pg_restore --host "localhost" --port "5432" --username "boutrous" --no-password --dbname "mlp3" --verbose "/Users/boutrous/Workspace/NodeJS/db/meat_backup_28apr2021.sql"

# update existing schema
psql -U boutrous mlp3 < _init/global.init.sql
psql -U boutrous mlp3 < _init/nodes.init.sql
psql -U boutrous mlp3 < _init/files.init.sql;
psql -U boutrous mlp3 < _init/metadata.init.sql;
psql -U boutrous mlp3 < _init/participants.init.sql;
psql -U boutrous mlp3 < _init/users.init.sql;
psql -U boutrous mlp3 < _init/cleanup.init.sql;

echo "MLP database migration completed.";

#eof
