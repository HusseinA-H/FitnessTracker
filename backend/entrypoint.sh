#!/usr/bin/env bash
set -e

echo "=== FitnessTracker Backend Entrypoint ==="

echo "Running database migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput 2>/dev/null || true

echo "Bootstrapping admin user (if ADMIN_PASSWORD is set)..."
python manage.py create_admin 2>/dev/null || true

echo "=== Starting Gunicorn ==="
exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --config /app/gunicorn.conf.py