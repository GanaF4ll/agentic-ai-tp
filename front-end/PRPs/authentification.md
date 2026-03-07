🚀 Feature : Gestion des Accès & Invitations (Super-Admin)

Cette feature permet au Super-Admin de piloter l'onboarding des nouveaux collaborateurs (Admins et Membres) via un système d'invitation sécurisé.

1. Workflow d'Authentification (Super-Admin)

L'accès est restreint aux comptes possédant le flag role: 'super-admin' défini dans database.md.

    Saisie : Identifiants uniques.

    Validation : Interception du jeton JWT.

    Contrôle d'accès : Vérification de la payload du token pour autoriser l'accès au menu "Gestion Utilisateurs".

        Si le rôle n'est pas adéquat : Redirection immédiate vers l'espace membre standard.

2. Feature : Création d'Utilisateurs

Le Super-Admin peut instancier deux types de profils. L'interface doit refléter la logique suivante :
Processus de création
Action Donnée source Impact
Définition du profil Email + Choix du Rôle Prépare l'entrée en base.
Génération auto Mot de passe temporaire Créé par le serveur, jamais saisi manuellement.
Soumission Payload JSON Appel de l'endpoint /api/users/create.

    Note : Le mot de passe n'est pas affiché au Super-Admin pour des raisons de confidentialité. Seul le futur utilisateur en prend connaissance via son mail.

3. Parcours d'Invitation & Mot de Passe Temporaire

Lorsqu'un utilisateur (particulièrement un Admin) est créé, le système déclenche une séquence automatisée.
Logique d'onboarding (Côté Utilisateur Invité)

    Réception Mail : Contient l'URL de connexion et le mot de passe temporaire.

    Première Connexion : * Le système détecte le flag must_change_password: true.

        Angular intercepte la navigation et force l'affichage d'un écran de réinitialisation.

    Activation : Une fois le nouveau mot de passe défini, le flag repasse à false et l'accès aux fonctionnalités Admin est débloqué.

4. Règles de Gestion (Business Rules)

   Unicité : Impossible de créer un utilisateur avec un email déjà présent dans database.md.

   Sécurité des rôles : Un Admin ne peut pas créer d'autres utilisateurs (privilège exclusif au Super-Admin).

   Statut d'invitation : L'interface doit permettre de voir si un utilisateur a déjà validé son compte ou s'il est toujours sous mot de passe temporaire.
