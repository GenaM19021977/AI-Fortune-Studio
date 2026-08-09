"""
Сериализаторы публичного каталога (шаг 1.5).

system_prompt намеренно НЕ отдаём на фронт — только бэкенд/LLM.
"""

from __future__ import annotations

from rest_framework import serializers

from apps.content.models import ContentMode, EventType, Persona


class ContentModeSerializer(serializers.ModelSerializer):
    """Режим для ModeGrid на главной."""

    class Meta:
        model = ContentMode
        fields = (
            "slug",
            "name",
            "emoji",
            "description",
            "phase",
            "sort_order",
        )


class PersonaSerializer(serializers.ModelSerializer):
    """
    Карточка персонажа для карусели.

    Без system_prompt: промпт остаётся секретом сервера.
    """

    class Meta:
        model = Persona
        fields = (
            "slug",
            "name",
            "title",
            "category",
            "emoji",
            "gradient",
            "voice_tone",
            "signature",
            "is_premium",
            "sort_order",
        )


class EventTypeSerializer(serializers.ModelSerializer):
    """Повод для шага мастера / сезонного баннера."""

    class Meta:
        model = EventType
        fields = (
            "slug",
            "name",
            "emoji",
            "season_start",
            "season_end",
            "sort_order",
        )
