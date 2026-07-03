#!/bin/bash
set -e

# Nova Sphere - Automated Backup Verification
# Restores a backup to a temporary local database and runs basic queries.

if [ -z "$1" ]; then
  echo "Usage: ./verify.sh <path_to_sql_file>"
  exit 1
fi

BACKUP_FILE=$1
TEMP_DB_URL="postgresql://postgres:postgres@localhost:5432/nova_verify"

echo "[INFO] Creating temporary DB: nova_verify..."
# Drop and create DB
psql postgresql://postgres:postgres@localhost:5432/postgres -c "DROP DATABASE IF EXISTS nova_verify;"
psql postgresql://postgres:postgres@localhost:5432/postgres -c "CREATE DATABASE nova_verify;"

echo "[INFO] Restoring to temporary database..."
psql $TEMP_DB_URL -f $BACKUP_FILE > /dev/null

echo "[INFO] Running Integrity Checks..."
USER_COUNT=$(psql $TEMP_DB_URL -t -c "SELECT count(*) FROM \"User\";" | tr -d ' ')
ORDER_COUNT=$(psql $TEMP_DB_URL -t -c "SELECT count(*) FROM \"Order\";" | tr -d ' ')

if [ "$USER_COUNT" -gt 0 ]; then
  echo "[PASS] Found $USER_COUNT users."
else
  echo "[FAIL] No users found. Integrity check failed."
  exit 1
fi

echo "[SUCCESS] Backup verification completed successfully. Sandbox DB retained for review."
