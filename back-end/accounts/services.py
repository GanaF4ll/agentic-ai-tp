from django.core.mail import send_mail
from django.conf import settings

def send_invitation_email(user, temporary_password):
    subject = "Invitation à rejoindre AlumniConnect"
    message = f"""Bonjour {user.first_name},

Vous avez été invité à rejoindre la plateforme AlumniConnect en tant qu'administrateur.

Voici vos identifiants de connexion temporaires :
Email : {user.email}
Mot de passe temporaire : {temporary_password}

Veuillez vous connecter à l'adresse suivante : {settings.FRONTEND_URL}/login

Lors de votre première connexion, il vous sera demandé de définir un mot de passe définitif.

L'équipe AlumniConnect
"""
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )
