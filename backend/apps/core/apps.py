import os
import logging
from django.apps import AppConfig
from django.db.models.signals import post_migrate

logger = logging.getLogger('django')


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        post_migrate.connect(bootstrap_admin, sender=self)


def bootstrap_admin(sender, **kwargs):
    from django.contrib.auth import get_user_model
    from common.choices import UserRole

    username = os.environ.get('ADMIN_USERNAME', 'admin')
    email = os.environ.get('ADMIN_EMAIL', 'admin@fitnesstracker.local')
    password = os.environ.get('ADMIN_PASSWORD')

    if not password:
        return

    User = get_user_model()
    if User.objects.filter(username=username).exists():
        return
    if User.objects.filter(email=email).exists():
        return

    try:
        User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role=UserRole.ADMIN,
            is_staff=True,
            is_superuser=True,
        )
        logger.info(f'Admin user "{username}" bootstrapped successfully.')
    except Exception as e:
        logger.warning(f'Admin bootstrap skipped: {e}')