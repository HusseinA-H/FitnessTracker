#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== FitnessTracker Environment Setup ==="

ENV_FILE="$PROJECT_DIR/backend/.env.production"

if [ -f "$ENV_FILE" ]; then
    echo "WARNING: $ENV_FILE already exists."
    read -p "Overwrite? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 0
    fi
fi

cp "$PROJECT_DIR/backend/.env.production" "$ENV_FILE"

generate_secret() {
    python3 -c "import secrets; print(secrets.token_urlsafe(50))" 2>/dev/null || \
    openssl rand -hex 32 2>/dev/null || \
    cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n1
}

SECRET_KEY=$(generate_secret)
JWT_SECRET=$(generate_secret)
DB_PASSWORD=$(generate_secret | head -c 32)
ADMIN_PASSWORD=$(generate_secret | head -c 20)

if [[ "$OSTYPE" == "darwin"* ]]; then
    SED_CMD="sed -i ''"
else
    SED_CMD="sed -i"
fi

$SED_CMD "s|^SECRET_KEY=.*|SECRET_KEY=$SECRET_KEY|" "$ENV_FILE"
$SED_CMD "s|^JWT_SECRET_KEY=.*|JWT_SECRET_KEY=$JWT_SECRET|" "$ENV_FILE"
$SED_CMD "s|^DB_PASSWORD=.*|DB_PASSWORD=$DB_PASSWORD|" "$ENV_FILE"
$SED_CMD "s|^ADMIN_PASSWORD=.*|ADMIN_PASSWORD=$ADMIN_PASSWORD|" "$ENV_FILE"

echo ""
echo "Generated secrets written to $ENV_FILE"
echo ""
echo "IMPORTANT: Store these credentials securely!"
echo "  Admin password: $ADMIN_PASSWORD"
echo "  DB password:     $DB_PASSWORD"
echo ""
echo "Next steps:"
echo "  1. Edit $ENV_FILE — set ALLOWED_HOSTS, CORS_ALLOWED_ORIGINS"
echo "  2. Run: bash scripts/deploy.sh up"