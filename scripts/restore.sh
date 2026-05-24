#!/usr/bin/env bash
set -euo pipefail

echo "=== FitnessTracker Database Restore ==="

BACKUP_FILE="${1:?Usage: restore.sh <backup_file.sql.gz>}"
DB_NAME="${DB_NAME:-fitnesstracker_db}"
DB_USER="${DB_USER:-postgres}"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: Backup file not found: $BACKUP_FILE"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "Restoring from: $BACKUP_FILE"
echo "Database: $DB_NAME"

if docker compose -f "$PROJECT_DIR/docker-compose.yml" ps --format '{{.Name}}' 2>/dev/null | grep -q "fitnesstracker-db"; then
    echo "Docker containers detected. Restoring via docker..."
    gunzip -c "$BACKUP_FILE" | docker compose -f "$PROJECT_DIR/docker-compose.yml" exec -T db \
        psql -U "$DB_USER" -d "$DB_NAME"
else
    echo "Docker containers not running. Attempting local restore..."
    gunzip -c "$BACKUP_FILE" | PGPASSWORD="${DB_PASSWORD:-postgres}" psql -U "$DB_USER" -h 127.0.0.1 "$DB_NAME"
fi

echo "=== Restore Complete ==="