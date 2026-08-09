"""
Тесты fallback / оркестратора без интернета (шаг 1.6).

Запуск из backend/:
  pytest apps/ai/tests/test_fallback.py -v
"""

from __future__ import annotations

import pytest

from apps.ai.services.fallback import FallbackService
from apps.ai.services.llm import GroqLLMService, LLMError
from apps.ai.services.text import generate_text
from apps.ai.services.zodiac import zodiac_sign_ru


@pytest.fixture
def granny() -> dict:
    return {
        "name": "Бабка с лавочки",
        "title": "пророчица со двора",
        "voice_tone": "ворчливо, по-доброму",
        "signature": "Ой, дитятко…",
        "system_prompt": "",
    }


class TestZodiac:
    def test_known_date(self) -> None:
        assert zodiac_sign_ru("1990-05-15") == "Телец"

    def test_bad_date(self) -> None:
        assert zodiac_sign_ru("не дата") == "Звезда"


class TestFallbackService:
    def test_greeting_contains_name(self, granny: dict) -> None:
        result = FallbackService().generate(
            mode_slug="greeting",
            persona=granny,
            input_data={"name": "Александр", "event": "birthday"},
        )
        assert result.source == "template"
        assert "Александр" in result.body_text
        assert "Александр" in result.title
        assert "AI Fortune Studio" in result.share_text

    def test_horoscope_uses_zodiac(self, granny: dict) -> None:
        result = FallbackService().generate(
            mode_slug="horoscope",
            persona=granny,
            input_data={"name": "Мария", "birth_date": "1990-05-15"},
        )
        assert "Телец" in result.body_text

    def test_roast_is_gentle(self, granny: dict) -> None:
        result = FallbackService().generate(
            mode_slug="roast",
            persona=granny,
            input_data={"name": "Петя"},
        )
        assert "добрый" in result.title.lower() or "Roast" in result.title or "roast" in result.title.lower() or "Петя" in result.body_text


class TestGenerateTextOffline:
    def test_without_api_key_uses_template(self, granny: dict, settings) -> None:
        settings.GROQ_API_KEY = ""
        settings.AI_LLM_ENABLED = True
        result = generate_text(
            mode_slug="greeting",
            persona=granny,
            input_data={"name": "Александр", "event": "birthday"},
            llm=GroqLLMService(api_key=""),
        )
        assert result.source == "template"
        assert "Александр" in result.body_text

    def test_llm_error_falls_back(self, granny: dict, settings) -> None:
        settings.AI_LLM_ENABLED = True

        class BrokenLLM(GroqLLMService):
            def is_configured(self) -> bool:
                return True

            def complete(self, *, system_prompt: str, user_prompt: str) -> str:
                raise LLMError("сеть недоступна")

        result = generate_text(
            mode_slug="poem",
            persona=granny,
            input_data={"name": "Оля"},
            llm=BrokenLLM(api_key="fake"),
        )
        assert result.source == "template"
        assert "Оля" in result.body_text

    def test_successful_llm(self, granny: dict, settings) -> None:
        settings.AI_LLM_ENABLED = True

        class FakeLLM(GroqLLMService):
            def is_configured(self) -> bool:
                return True

            def complete(self, *, system_prompt: str, user_prompt: str) -> str:
                assert "Бабка" in system_prompt or "ворчливо" in system_prompt
                assert "Оля" in user_prompt
                return "Вот текст от модели для Оли."

        result = generate_text(
            mode_slug="greeting",
            persona=granny,
            input_data={"name": "Оля", "event": "birthday"},
            llm=FakeLLM(api_key="fake"),
        )
        assert result.source == "llm"
        assert "Оли" in result.body_text
