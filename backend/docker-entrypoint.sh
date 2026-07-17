#!/bin/sh
set -e

echo "Waiting for Postgres at ${DB_HOST}:${DB_PORT}..."
while ! nc -z "${DB_HOST}" "${DB_PORT:-5432}"; do
  sleep 0.5
done
echo "Postgres is up."

echo "Applying migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

# Auto-create a superuser on first boot if requested via env vars
if [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ] && [ -n "$DJANGO_SUPERUSER_EMAIL" ]; then
  echo "Ensuring superuser '$DJANGO_SUPERUSER_USERNAME' exists..."
  python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='$DJANGO_SUPERUSER_USERNAME').exists():
    User.objects.create_superuser('$DJANGO_SUPERUSER_USERNAME', '$DJANGO_SUPERUSER_EMAIL', '$DJANGO_SUPERUSER_PASSWORD')
    print('Superuser created.')
else:
    print('Superuser already exists.')
"
fi

exec "$@"
