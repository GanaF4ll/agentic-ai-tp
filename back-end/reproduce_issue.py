import os
import django
from django.db import IntegrityError

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from alumni.models import Promotion
from alumni.serializers import PromotionSerializer
from rest_framework.exceptions import ValidationError

# Ensure a promotion exists
promo_label = "Test Promo Unique"
Promotion.objects.filter(label=promo_label).delete()
Promotion.objects.create(label=promo_label)

print(f"Created promotion with label: {promo_label}")

# Try to create it again via Serializer
data = {'label': promo_label}
serializer = PromotionSerializer(data=data)

try:
    print("Validating duplicate label via serializer...")
    serializer.is_valid(raise_exception=True)
    print("Serializer validated successfully (unexpected!)")
    serializer.save()
    print("Serializer saved successfully (unexpected!)")
except ValidationError as e:
    print(f"Caught ValidationError (400): {e}")
except IntegrityError as e:
    print(f"Caught IntegrityError (500 if unhandled): {e}")
except Exception as e:
    print(f"Caught unexpected exception: {type(e).__name__}: {e}")
