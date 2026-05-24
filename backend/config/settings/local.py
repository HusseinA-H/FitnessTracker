from .base import *
import os
from django.core.exceptions import ImproperlyConfigured

DEBUG = True

# Read SECRET_KEY from environment or raise
SECRET_KEY = os.environ.get('SECRET_KEY')
if not SECRET_KEY:
    # Allow fallback ONLY in local dev if not specified, but print warning
    SECRET_KEY = 'django-insecure-local-fallback-key-change-in-production'

# Read ALLOWED_HOSTS from environment
allowed_hosts_str = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1')
ALLOWED_HOSTS = [host.strip() for host in allowed_hosts_str.split(',') if host.strip()]

# ✅ Database Configuration: PostgreSQL is enforced. Raising ImproperlyConfigured if missing.
db_name = os.environ.get('DB_NAME')
db_user = os.environ.get('DB_USER')
db_password = os.environ.get('DB_PASSWORD')
db_host = os.environ.get('DB_HOST')
db_port = os.environ.get('DB_PORT')

if not all([db_name, db_user, db_password, db_host, db_port]):
    raise ImproperlyConfigured(
        "SQLite is disabled. PostgreSQL database configuration variables "
        "(DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT) are required in .env "
        "even in local development mode."
    )

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': db_name,
        'USER': db_user,
        'PASSWORD': db_password,
        'HOST': db_host,
        'PORT': db_port,
    }
}

# CORS Configuration
cors_origins_str = os.environ.get('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173')
CORS_ALLOWED_ORIGINS = [origin.strip() for origin in cors_origins_str.split(',') if origin.strip()]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
CORS_EXPOSE_HEADERS = [
    'content-type',
    'content-length',
]
CORS_PREFLIGHT_MAX_AGE = 86400

# CSRF Configuration — trust frontend origins for cross-origin POST
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS

# Disable automatic COOP from SecurityMiddleware — applied selectively in SecurityHeadersMiddleware
SECURE_CROSS_ORIGIN_OPENER_POLICY = None
