#!/bin/sh

# Run database initialization
# sh /_init/run.sh

DATABASE='mountain_legacy'
#USER='boutrous'
#BACKUP_PATH='/Users/boutrous/Workspace/NodeJS/db/meat.sql'
BACKUP_PATH="/Users/boutrous/Workspace/NodeJS/db/meat_backup_28apr2021.sql"
SAVE_PATH="/Users/boutrous/Workspace/NodeJS/db/mle_dump.sql.tar"

# clear database
 (
 echo "DROP SCHEMA PUBLIC CASCADE;";
 echo "CREATE SCHEMA PUBLIC;";
 ) \
 | psql -U $USER $DATABASE

# restore db to saved backup
psql -U $USER $DATABASE < $SAVE_PATH

# generate backup
# pg_restore --host "localhost" --port "5432" --username $USER --no-password --dbname $DATABASE --verbose $BACKUP_PATH

# update existing schema
psql -U $USER $DATABASE < _init/global.init.sql
psql -U $USER $DATABASE < _init/nodes.init.sql
psql -U $USER $DATABASE < _init/files.init.sql;
psql -U $USER $DATABASE < _init/metadata.init.sql;
psql -U $USER $DATABASE < _init/participants.init.sql;
psql -U $USER $DATABASE < _init/users.init.sql;
psql -U $USER $DATABASE < _init/cleanup.init.sql;

# save db as dump
pg_dump -U $USER --format=tar $DATABASE > $SAVE_PATH;

echo "MLP database migration completed.";

#eof
