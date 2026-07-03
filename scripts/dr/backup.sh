#!/bin/bash
set -e

# Nova Sphere - Automated Database Backup Script
# Usage: ./backup.sh

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"
BACKUP_FILE="$BACKUP_DIR/nova_sphere_$TIMESTAMP.sql"

mkdir -p $BACKUP_DIR

echo "[INFO] Starting database backup to $BACKUP_FILE..."

# Assuming standard DATABASE_URL format: postgres://user:password@host:port/dbname
if [ -z "$DATABASE_URL" ]; then
  echo "[ERROR] DATABASE_URL is not set. Cannot perform backup."
  exit 1
fi

pg_dump $DATABASE_URL -F p -f $BACKUP_FILE

echo "[SUCCESS] Backup completed: $BACKUP_FILE"

# Upload to S3/Cloud Storage (Stubbed for now)
# aws s3 cp $BACKUP_FILE s3://novasphere-dr-backups/
