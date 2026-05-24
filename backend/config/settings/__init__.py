import os
from pathlib import Path
from dotenv import load_dotenv

# Base Directory of the Django project
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Determine which env file to load based on DJANGO_ENV
env_mode = os.environ.get('DJANGO_ENV', 'local').lower()

if env_mode == 'production':
    # In production/Docker, load .env.production
    env_file = BASE_DIR / '.env.production'
elif env_mode == 'staging':
    env_file = BASE_DIR / '.env.staging'
else:
    # Local development
    env_file = BASE_DIR / '.env'

load_dotenv(env_file, override=False)

# Import the appropriate settings module
if env_mode == 'production':
    from .production import *
elif env_mode == 'staging':
    from .staging import *
else:
    from .local import *
