"""
Хелперы каталога: фильтры и сезонность (шаг 1.5).
"""

from __future__ import annotations

from datetime import date

from django.db.models import QuerySet

from apps.content.models import EventType


def is_date_in_season(today: date, season_start: date | None, season_end: date | None) -> bool:
    """
    Попадает ли сегодня в сезонный интервал.

    Год в DateField условный (seed пишет 2000-…) — сравниваем только месяц/день.
    Если сезон через Новый год (дек → янв): start > end по (month, day).
    """
    if season_start is None or season_end is None:
        return False

    today_md = (today.month, today.day)
    start_md = (season_start.month, season_start.day)
    end_md = (season_end.month, season_end.day)

    if start_md <= end_md:
        # Обычный интервал внутри года: 01.12 … 31.12
        return start_md <= today_md <= end_md

    # Переход через год: например 15.12 … 15.01
    return today_md >= start_md or today_md <= end_md


def filter_seasonal_events(queryset: QuerySet[EventType], today: date | None = None) -> QuerySet[EventType]:
    """
    Оставляет активные EventType, у которых сегодня внутри season_*.

    Фильтр в Python: сезонов мало, ORM с «игнором года» громоздкий.
    """
    today = today or date.today()
    candidates = queryset.filter(
        is_active=True,
        season_start__isnull=False,
        season_end__isnull=False,
    )
    matching_ids = [
        event.pk
        for event in candidates
        if is_date_in_season(today, event.season_start, event.season_end)
    ]
    return queryset.filter(pk__in=matching_ids).order_by("sort_order", "name")
