#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== FitnessTracker Deploy ==="

cd "$PROJECT_DIR"

case "${1:-help}" in
    up)
        echo "Starting all services..."
        docker compose up -d --build
        echo "Waiting for services to become healthy..."
        sleep 10
        docker compose ps
        echo ""
        echo "Running database migrations..."
        docker compose exec backend python manage.py migrate --noinput
        echo ""
        echo "Bootstrapping admin user..."
        docker compose exec backend python manage.py create_admin
        echo ""
        echo "Collecting static files..."
        docker compose exec backend python manage.py collectstatic --noinput
        echo ""
        echo "=== Services are LIVE ==="
        echo "Frontend: http://localhost"
        echo "Backend:  http://localhost:8000/api/v1/health/"
        ;;

    down)
        echo "Stopping all services..."
        docker compose down
        echo "=== Services STOPPED ==="
        ;;

    restart)
        echo "Restarting all services..."
        docker compose restart
        echo "=== Services RESTARTED ==="
        ;;

    logs)
        SERVICE="${2:-}"
        if [ -n "$SERVICE" ]; then
            docker compose logs -f "$SERVICE"
        else
            docker compose logs -f
        fi
        ;;

    migrate)
        echo "Running migrations..."
        docker compose exec backend python manage.py migrate --noinput
        echo "=== Migrations COMPLETE ==="
        ;;

    shell)
        SERVICE="${2:-backend}"
        docker compose exec "$SERVICE" bash || docker compose exec "$SERVICE" sh
        ;;

    db-shell)
        DB_NAME="${DB_NAME:-fitnesstracker_db}"
        DB_USER="${DB_USER:-postgres}"
        docker compose exec db psql -U "$DB_USER" "$DB_NAME"
        ;;

    backup)
        bash "$SCRIPT_DIR/backup.sh"
        ;;

    restore)
        BACKUP_FILE="${2:?Usage: deploy.sh restore <backup_file>}"
        bash "$SCRIPT_DIR/restore.sh" "$BACKUP_FILE"
        ;;

    status)
        docker compose ps
        echo ""
        echo "Health checks:"
        echo "  Backend:  $(curl -s http://localhost:8000/api/v1/health/ 2>/dev/null || echo 'UNREACHABLE')"
        echo "  Frontend: $(curl -s http://localhost/health 2>/dev/null || echo 'UNREACHABLE')"
        ;;

    build)
        echo "Building all images..."
        docker compose build
        echo "=== Build COMPLETE ==="
        ;;

    clean)
        echo "Removing containers, volumes, and images..."
        docker compose down -v --rmi local
        echo "=== Clean COMPLETE ==="
        ;;

    help|*)
        echo "FitnessTracker Deployment Commands"
        echo ""
        echo "  deploy.sh up         — Build and start all services"
        echo "  deploy.sh down       — Stop all services"
        echo "  deploy.sh restart    — Restart all services"
        echo "  deploy.sh logs [svc] — Tail logs (optional: backend, frontend, db)"
        echo "  deploy.sh migrate    — Run database migrations"
        echo "  deploy.sh shell [svc]— Open shell in container (default: backend)"
        echo "  deploy.sh db-shell   — Open PostgreSQL shell"
        echo "  deploy.sh backup     — Create database backup"
        echo "  deploy.sh restore <f>— Restore database from backup file"
        echo "  deploy.sh status      — Show service status and health"
        echo "  deploy.sh build       — Build Docker images"
        echo "  deploy.sh clean       — Remove all containers, volumes, and images"
        ;;
esac