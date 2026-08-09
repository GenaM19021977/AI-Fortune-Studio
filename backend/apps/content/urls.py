"""URL-маршруты публичного каталога (шаг 1.5)."""

from django.urls import path

from apps.content.views import (
    EventListView,
    ModeListView,
    PersonaListView,
    SeasonalEventListView,
)

urlpatterns = [
    path("modes/", ModeListView.as_view(), name="mode-list"),
    path("personas/", PersonaListView.as_view(), name="persona-list"),
    path("events/", EventListView.as_view(), name="event-list"),
    path("seasonal/", SeasonalEventListView.as_view(), name="seasonal-list"),
]
