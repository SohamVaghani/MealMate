from django.apps import AppConfig
from django.db.models import DecimalField
import decimal

class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        # Patch DecimalField to support MongoDB Decimal128 & messy seeds
        old_to_python = DecimalField.to_python
        
        def new_to_python(self, value):
            if value is None:
                return value
            if hasattr(value, 'to_decimal'):
                return value.to_decimal()
            try:
                if isinstance(value, float):
                    value = str(value)
                return old_to_python(self, value)
            except Exception:
                try:
                    return decimal.Decimal(str(value))
                except Exception:
                    return decimal.Decimal('0.00')
                    
        DecimalField.to_python = new_to_python
