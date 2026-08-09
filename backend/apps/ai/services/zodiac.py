"""
Зодиак по дате рождения (для horoscope fallback / позже LLM-контекста).

Без внешних библиотек: достаточно месяца и дня.
"""

from __future__ import annotations

from datetime import date, datetime


def zodiac_sign_ru(birth_date: str | date) -> str:
    """
    Возвращает знак зодиака по-русски.

    birth_date: 'YYYY-MM-DD' или date. При ошибке парсинга — 'Звезда'.
    """
    parsed: date | None
    if isinstance(birth_date, date):
        parsed = birth_date
    else:
        try:
            parsed = datetime.strptime(birth_date.strip()[:10], "%Y-%m-%d").date()
        except (TypeError, ValueError):
            return "Звезда"

    month, day = parsed.month, parsed.day
    # Границы классического тропического зодиака (день включительно на смене знака)
    signs: list[tuple[int, int, str]] = [
        (1, 20, "Козерог"),
        (2, 19, "Водолей"),
        (3, 20, "Рыбы"),
        (4, 20, "Овен"),
        (5, 21, "Телец"),
        (6, 21, "Близнецы"),
        (7, 22, "Рак"),
        (8, 23, "Лев"),
        (9, 23, "Дева"),
        (10, 23, "Весы"),
        (11, 22, "Скорпион"),
        (12, 22, "Стрелец"),
        (12, 31, "Козерог"),
    ]
    for end_month, end_day, name in signs:
        if (month, day) <= (end_month, end_day):
            return name
    return "Козерог"
