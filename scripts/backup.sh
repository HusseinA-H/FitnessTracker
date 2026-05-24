#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${BACKUP_DIR:-$SCRIPT_DIR/backup/data}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
DB_NAME="${DB_NAME:-fitnesstracker_db}"
DB_USER="${DB_USER:-postgres}"

mkdir -p "$BACKUP_DIR"

echo "=== FitnessTracker Backup ==="
echo "Timestamp: $TIMESTAMP"

if docker compose -f "$PROJECT_DIR/docker-compose.yml" ps --format '{{.Name}}' 2>/dev/null | grep -q "fitnesstracker-db"; then
    echo "Backing up PostgreSQL database..."
    docker compose -f "$PROJECT_DIR/docker-compose.yml" exec -T db \
        pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_DIR/db_${TIMESTAMP}.sql"
    gzip "$BACKUP_DIR/db_${TIMESTAMP}.sql"
    echo "Database backup: $BACKUP_DIR/db_${TIMESTAMP}.sql.gz"

    BACKEND_CONTAINER=$(docker compose -f "$PROJECT_DIR/docker-compose.yml" ps -q backend 2>/dev/null || true)
    if [ -n "$BACKEND_CONTAINER" ]; then
        echo "Backing up media files..."
        docker compose -f "$PROJECT_DIR/docker-compose.yml" exec -T backend \
            tar czf - -C /app media > "$BACKUP_DIR/media_${TIMESTAMP}.tar.gz" 2>/dev/null || true
        echo "Media backup: $BACKUP_DIR/media_${TIMESTAMP}.tar.gz"
    fi
else
    echo "Docker containers not running. Attempting local pg_dump..."
    PGPASSWORD="${DB_PASSWORD:-postgres}" pg_dump -U "$DB_USER" -h 127.0.0.1 "$DB_NAME" > "$BACKUP_DIR/db_${TIMESTAMP}.sql" 2>/dev/null && \
        gzip "$BACKUP_DIR/db_${TIMESTAMP}.sql" || \
        echo "WARNING: Local pg_dump failed. Is PostgreSQL running?"
fi

RETENTION_DAYS="${RETENTION_DAYS:-30}"
echo "Cleaning backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "*.gz" -type f -mtime +$RETENTION_DAYS -delete 2>/dev/null || true

echo "=== Backup Complete ==="