"""URL-маршруты каталога (1.5) и генерации (1.8)."""

from django.urls import path

from apps.content.views import (
    EventListView,
    GenerateCreateView,
    GenerateDetailView,
    ModeListView,
    PersonaListView,
    SeasonalEventListView,
)

urlpatterns = [
    path("modes/", ModeListView.as_view(), name="mode-list"),
    path("personas/", PersonaListView.as_view(), name="persona-list"),
    path("events/", EventListView.as_view(), name="event-list"),
    path("seasonal/", SeasonalEventListView.as_view(), name="seasonal-list"),
    path("generate/", GenerateCreateView.as_view(), name="generate-create"),
    path(
        "generate/<uuid:generation_id>/",
        GenerateDetailView.as_view(),
        name="generate-detail",
    ),
]
