#!/bin/bash
set -e

# Nova Sphere - Automated Database Restore Script
# Usage: ./restore.sh <path_to_sql_file>

if [ -z "$1" ]; then
  echo "[ERROR] Must provide a backup file to restore."
  echo "Usage: ./restore.sh <path_to_sql_file>"
  exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
  echo "[ERROR] Backup file not found: $BACKUP_FILE"
  exit 1
fi

if [ -z "$DATABASE_URL" ]; then
  echo "[ERROR] DATABASE_URL is not set."
  exit 1
fi

echo "[WARNING] This will completely overwrite the database at DATABASE_URL."
read -p "Are you sure you want to proceed? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "[INFO] Aborting."
  exit 1
fi

echo "[INFO] Restoring from $BACKUP_FILE..."
psql $DATABASE_URL -f $BACKUP_FILE

echo "[SUCCESS] Restore completed."
