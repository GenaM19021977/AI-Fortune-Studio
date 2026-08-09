"""
Приложение billing — квоты и подписки (шаг 1.9).
"""

from django.apps import AppConfig


class BillingConfig(AppConfig):
    """Конфиг: UsageQuota, Subscription, QuotaService."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.billing"
    verbose_name = "Биллинг и квоты"
