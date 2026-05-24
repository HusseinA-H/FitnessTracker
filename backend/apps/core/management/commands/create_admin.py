import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from common.choices import UserRole

User = get_user_model()


class Command(BaseCommand):
    help = 'Create a superuser with admin role if it does not already exist. Reads credentials from environment variables or .env file.'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, help='Admin username (default: from ADMIN_USERNAME env)')
        parser.add_argument('--email', type=str, help='Admin email (default: from ADMIN_EMAIL env)')
        parser.add_argument('--password', type=str, help='Admin password (default: from ADMIN_PASSWORD env)')

    def handle(self, *args, **options):
        username = options['username'] or os.environ.get('ADMIN_USERNAME', 'admin')
        email = options['email'] or os.environ.get('ADMIN_EMAIL', 'admin@fitnesstracker.local')
        password = options['password'] or os.environ.get('ADMIN_PASSWORD')

        if not password:
            self.stdout.write(self.style.ERROR(
                'ADMIN_PASSWORD environment variable is required. Set it in .env or pass --password.'
            ))
            return

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(
                f'User "{username}" already exists. Skipping admin creation.'
            ))
            return

        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(
                f'A user with email "{email}" already exists. Skipping admin creation.'
            ))
            return

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role=UserRole.ADMIN,
            is_staff=True,
            is_superuser=True,
        )

        self.stdout.write(self.style.SUCCESS(
            f'Successfully created admin user: username="{username}", email="{email}", role=ADMIN, is_staff=True, is_superuser=True'
        ))