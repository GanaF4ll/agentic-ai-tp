#!/bin/sh
set -e

echo "Waiting for database..."
python -c "
import os
import sys
import time

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

for i in range(30):
    try:
        import django
        django.setup()
        from django.db import connection
        connection.ensure_connection()
        print('Database ready.')
        break
    except Exception as e:
        if i == 29:
            print('Database not ready after 30s:', e, file=sys.stderr)
            sys.exit(1)
        time.sleep(1)
"

echo "Running migrations..."
python manage.py migrate --noinput

echo "Creating superuser (skips if already exists)..."
python manage.py create_superuser_auto

echo "Seeding database (skips if already seeded)..."
python manage.py seed_db

exec "$@"
