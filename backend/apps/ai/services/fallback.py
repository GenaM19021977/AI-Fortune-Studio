"""
Шаблонный fallback без LLM (шаг 1.6).

Работает офлайн: нет GROQ_API_KEY, таймаут, любая ошибка API.
Тексты короткие, в голосе персонажа — чтобы UI/тесты не зависели от сети.
"""

from __future__ import annotations

from typing import Any

from apps.ai.services.types import GeneratedText
from apps.ai.services.zodiac import zodiac_sign_ru


# Подписи поводов для шаблонов (slug → человекочитаемо)
_EVENT_LABELS: dict[str, str] = {
    "birthday": "день рождения",
    "wedding": "свадьба",
    "anniversary": "годовщина",
    "new-year": "Новый год",
    "just-because": "просто так",
}


class FallbackService:
    """Генерирует GeneratedText.source == 'template' по mode_slug."""

    def generate(
        self,
        *,
        mode_slug: str,
        persona: dict[str, Any],
        input_data: dict[str, Any],
    ) -> GeneratedText:
        name = (input_data.get("name") or "друг").strip() or "друг"
        event_slug = (input_data.get("event") or "just-because").strip()
        event_label = _EVENT_LABELS.get(event_slug, event_slug or "праздник")
        extra = (input_data.get("extra") or "").strip()
        persona_name = persona.get("name") or "Мудрец"
        signature = (persona.get("signature") or "").strip()
        opener = f"{signature} " if signature else ""

        handlers = {
            "greeting": self._greeting,
            "horoscope": self._horoscope,
            "poem": self._poem,
            "roast": self._roast,
        }
        handler = handlers.get(mode_slug, self._generic)
        title, body = handler(
            name=name,
            event_label=event_label,
            extra=extra,
            persona_name=persona_name,
            opener=opener,
            input_data=input_data,
        )
        share = (
            f"✨ {title}\n\n{body}\n\n"
            f"— {persona_name} | AI Fortune Studio"
        )
        return GeneratedText(
            title=title,
            body_text=body,
            share_text=share,
            source="template",
        )

    def _greeting(
        self,
        *,
        name: str,
        event_label: str,
        extra: str,
        persona_name: str,
        opener: str,
        input_data: dict[str, Any],
    ) -> tuple[str, str]:
        title = f"Поздравление для {name}"
        extra_line = f" Особенно ценю в тебе: {extra}." if extra else ""
        body = (
            f"{opener}{name}, с твоим праздником — {event_label}! "
            f"Пусть удача заглянет без стука, а хорошие новости не заставят ждать."
            f"{extra_line} "
            f"Так говорит {persona_name}, и в этом есть своя правда."
        )
        return title, body

    def _horoscope(
        self,
        *,
        name: str,
        event_label: str,
        extra: str,
        persona_name: str,
        opener: str,
        input_data: dict[str, Any],
    ) -> tuple[str, str]:
        birth = (input_data.get("birth_date") or "").strip()
        sign = zodiac_sign_ru(birth) if birth else "Звезда"
        title = f"Гороскоп для {name}"
        body = (
            f"{opener}{name}, знак {sign} сегодня на твоей стороне. "
            f"Утро — для смелых шагов, вечер — для тёплых слов. "
            f"Если сомневаешься — спроси сердце, оно уже знает ответ. "
            f"({persona_name})"
        )
        return title, body

    def _poem(
        self,
        *,
        name: str,
        event_label: str,
        extra: str,
        persona_name: str,
        opener: str,
        input_data: dict[str, Any],
    ) -> tuple[str, str]:
        title = f"Стих для {name}"
        body = (
            f"{opener}\n"
            f"{name}, пусть рифмы будут легче пуха,\n"
            f"а день — как праздник без спешки.\n"
            f"Пусть удача шепчет на ухо,\n"
            f"и сбудутся все твои потешки.\n"
            f"— {persona_name}"
        )
        return title, body

    def _roast(
        self,
        *,
        name: str,
        event_label: str,
        extra: str,
        persona_name: str,
        opener: str,
        input_data: dict[str, Any],
    ) -> tuple[str, str]:
        # Добрый roast: без унижения, только лёгкий подкол
        title = f"Добрый roast для {name}"
        extra_bit = f" (и да, {extra} — это уже стиль)" if extra else ""
        body = (
            f"{opener}{name}, ты настолько уникален{extra_bit}, "
            f"что даже календарь иногда путается в датах в твою пользу. "
            f"Держи комплимент в обёртке подкола — от {persona_name}."
        )
        return title, body

    def _generic(
        self,
        *,
        name: str,
        event_label: str,
        extra: str,
        persona_name: str,
        opener: str,
        input_data: dict[str, Any],
    ) -> tuple[str, str]:
        title = f"Послание для {name}"
        body = (
            f"{opener}{name}, сегодня хороший день, чтобы улыбнуться миру. "
            f"Пусть всё сложится мягко. — {persona_name}"
        )
        return title, body
