# Correctif pour les bases créées depuis un dump sans colonne username.
# Sur une base fraîche (0001_initial déjà appliqué), toutes les opérations
# sont des no-ops grâce aux IF NOT EXISTS PostgreSQL.

from django.db import migrations


def fill_username(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    for user in User.objects.filter(username__isnull=True):
        base = (user.email or '').strip() or f'user_{user.id}'
        username = base[:150]
        n = 0
        while User.objects.filter(username=username).exists():
            n += 1
            suffix = f'_{n}'
            username = (base[:150 - len(suffix)] + suffix)[:150]
        user.username = username
        user.save(update_fields=['username'])


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            # Les state_operations sont vides : 0001_initial gère déjà
            # le champ username dans l'état Django.
            state_operations=[],
            database_operations=[
                migrations.RunSQL(
                    "ALTER TABLE accounts_user ADD COLUMN IF NOT EXISTS username varchar(150) NULL;",
                    migrations.RunSQL.noop,
                ),
                migrations.RunPython(fill_username, migrations.RunPython.noop),
                migrations.RunSQL(
                    sql="""
                        DO $$
                        BEGIN
                            BEGIN
                                ALTER TABLE accounts_user ALTER COLUMN username SET NOT NULL;
                            EXCEPTION WHEN others THEN NULL;
                            END;
                            IF NOT EXISTS (
                                SELECT 1 FROM pg_constraint
                                WHERE conname = 'accounts_user_username_key'
                            ) THEN
                                ALTER TABLE accounts_user ADD CONSTRAINT accounts_user_username_key UNIQUE (username);
                            END IF;
                        END $$;
                    """,
                    reverse_sql=migrations.RunSQL.noop,
                ),
            ],
        ),
    ]
