"""
Сериализаторы публичного каталога и генерации.

system_prompt намеренно НЕ отдаём на фронт — только бэкенд/LLM.
"""

from __future__ import annotations

from rest_framework import serializers

from apps.content.models import ContentMode, EventType, Generation, Persona


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


class GenerateRequestSerializer(serializers.Serializer):
    """
    Тело POST /api/v1/generate/ (IMPLEMENTATION_PLAN §7.3).

    persona_id — slug персонажа (bench-granny), не числовой pk.
    """

    content_mode = serializers.SlugField(max_length=64)
    persona_id = serializers.SlugField(max_length=64)
    name = serializers.CharField(max_length=128, required=False, allow_blank=True, default="")
    event = serializers.CharField(max_length=64, required=False, allow_blank=True, default="")
    birth_date = serializers.CharField(max_length=32, required=False, allow_blank=True, default="")
    partner_name = serializers.CharField(
        max_length=128,
        required=False,
        allow_blank=True,
        allow_null=True,
        default=None,
    )
    extra = serializers.CharField(max_length=500, required=False, allow_blank=True, default="")


def serialize_generation(generation: Generation, *, quota_remaining: int) -> dict:
    """
    Собирает JSON ответа из модели Generation.

    result=null, если генерация ещё без GenerationResult (failed/processing).
    В контракте поле называется body (не body_text).
    """
    from django.core.exceptions import ObjectDoesNotExist

    result_payload = None
    try:
        result = generation.result
    except ObjectDoesNotExist:
        result = None

    if result is not None:
        result_payload = {
            "title": result.title,
            "body": result.body_text,
            "share_text": result.share_text,
            "persona": generation.persona.name,
            "source": result.source,
        }

    payload: dict = {
        "id": str(generation.id),
        "status": generation.status,
        "result": result_payload,
        "quota_remaining": quota_remaining,
    }
    if generation.status == Generation.Status.FAILED:
        payload["detail"] = "Не удалось сгенерировать текст. Попробуйте ещё раз."
    return payload
