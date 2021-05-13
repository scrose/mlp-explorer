#!/bin/sh

# Run initialization
# sh /_init/run.sh
# psql -U boutrous mlp2 < /Users/boutrous/Workspace/NodeJS/db/meat.sql

DATABASE='mlp2'
BACKUP_PATH='/Users/boutrous/Workspace/NodeJS/db/meat.sql'
USER='boutrous'

# clear database
 (
 echo "DROP SCHEMA PUBLIC CASCADE;";
 echo "CREATE SCHEMA PUBLIC;";
 ) \
 | psql -U $USER $DATABASE

# restore db to backup
psql -U $USER $DATABASE < $BACKUP_PATH
#pg_restore --host "localhost" --port "5432" --username "boutrous" --no-password --dbname "mlp3" --verbose "/Users/boutrous/Workspace/NodeJS/db/meat_backup_28apr2021.sql"

# update existing schema
psql -U $USER $DATABASE < _init/global.init.sql
psql -U $USER $DATABASE < _init/nodes.init.sql
psql -U $USER $DATABASE < _init/files.init.sql;
psql -U $USER $DATABASE < _init/metadata.init.sql;
psql -U $USER $DATABASE < _init/participants.init.sql;
psql -U $USER $DATABASE < _init/users.init.sql;
psql -U $USER $DATABASE < _init/cleanup.init.sql;

echo "MLP database migration completed.";

#eof
