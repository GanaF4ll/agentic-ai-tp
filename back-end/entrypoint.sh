#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Attente de la base de données..."
# On peut utiliser une boucle simple ou pg_isready si installé, 
# mais Django va échouer proprement si la DB n'est pas là, 
# et Docker Compose 'depends_on' aide déjà.

echo "Exécution des migrations..."
python manage.py migrate --noinput

echo "Alimentation de la base de données (seeding)..."
python manage.py seed_db

echo "Démarrage du serveur..."
exec "$@"
