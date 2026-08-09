"""Админка квот и подписок."""

from django.contrib import admin

from apps.billing.models import Subscription, UsageQuota


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ("user", "plan", "expires_at", "updated_at")
    list_filter = ("plan",)
    search_fields = ("user__telegram_id", "user__username", "telegram_payment_id")
    raw_id_fields = ("user",)
    readonly_fields = ("updated_at",)


@admin.register(UsageQuota)
class UsageQuotaAdmin(admin.ModelAdmin):
    list_display = ("user", "date", "generations_count", "media_count")
    list_filter = ("date",)
    search_fields = ("user__telegram_id", "user__username")
    raw_id_fields = ("user",)
    date_hierarchy = "date"
