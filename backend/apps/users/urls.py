"""URL-маршруты приложения users (профиль, история, daily-fortune)."""

from django.urls import path

from apps.users.views import DailyFortuneView, MeHistoryView, MeSettingsView, MeView

urlpatterns = [
    path("me/", MeView.as_view(), name="me"),
    path("me/settings/", MeSettingsView.as_view(), name="me-settings"),
    path("me/history/", MeHistoryView.as_view(), name="me-history"),
    path("daily-fortune/", DailyFortuneView.as_view(), name="daily-fortune"),
]
