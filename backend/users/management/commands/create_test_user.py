from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

User = get_user_model()


class Command(BaseCommand):
    help = "Create (or reset) a test user for local/dev testing."

    def add_arguments(self, parser):
        parser.add_argument('--email', default='test@proprietor.local')
        parser.add_argument('--username', default='testuser')
        parser.add_argument('--password', default='Test12345!')
        parser.add_argument('--first-name', default='Test')
        parser.add_argument('--last-name', default='User')
        parser.add_argument(
            '--role', default='buyer',
            choices=['buyer', 'seller', 'admin'],
        )
        parser.add_argument(
            '--superuser', action='store_true',
            help='Also grant is_staff and is_superuser.',
        )
        parser.add_argument(
            '--unverified', action='store_true',
            help='Leave is_verified=False (default is verified).',
        )

    def handle(self, *args, **opts):
        email = opts['email']
        defaults = {
            'username': opts['username'],
            'first_name': opts['first_name'],
            'last_name': opts['last_name'],
            'role': opts['role'],
            'is_verified': not opts['unverified'],
            'is_staff': opts['superuser'],
            'is_superuser': opts['superuser'],
        }

        user, created = User.objects.get_or_create(email=email, defaults=defaults)

        if not created:
            for field, value in defaults.items():
                setattr(user, field, value)

        user.set_password(opts['password'])
        user.save()

        if user.email != email:
            raise CommandError('Unexpected state creating user.')

        action = 'Created' if created else 'Updated'
        self.stdout.write(self.style.SUCCESS(
            f"{action} user: {user.email} / password: {opts['password']} "
            f"(role={user.role}, staff={user.is_staff}, superuser={user.is_superuser})"
        ))
