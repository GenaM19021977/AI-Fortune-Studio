"""
Сборка Jinja2-промптов (IMPLEMENTATION_PLAN §11.2–11.3).

Шаблоны лежат в apps/ai/prompts/ — единый источник для LLM.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader, select_autoescape

# Каталог prompts/ рядом с пакетом apps.ai
PROMPTS_DIR = Path(__file__).resolve().parent.parent / "prompts"

_env: Environment | None = None


def _get_env() -> Environment:
    """Ленивый singleton Environment — не создаём при каждом вызове."""
    global _env
    if _env is None:
        _env = Environment(
            loader=FileSystemLoader(str(PROMPTS_DIR)),
            autoescape=select_autoescape(enabled_extensions=()),
            trim_blocks=True,
            lstrip_blocks=True,
        )
    return _env


def render_prompt(template_name: str, context: dict[str, Any]) -> str:
    """Рендерит файл prompts/<template_name> с контекстом."""
    template = _get_env().get_template(template_name)
    return template.render(**context).strip()


def build_system_prompt(persona: dict[str, Any], *, locale: str = "ru") -> str:
    """System prompt персонажа (base_persona.j2 + поля persona)."""
    return render_prompt(
        "base_persona.j2",
        {
            "persona": persona,
            "locale": locale,
        },
    )


def build_user_prompt(mode_slug: str, context: dict[str, Any]) -> str:
    """
    User prompt по режиму: greeting.j2, horoscope.j2, …

    Неизвестный режим → generic.j2.
    """
    template_name = f"{mode_slug}.j2"
    path = PROMPTS_DIR / template_name
    if not path.exists():
        template_name = "generic.j2"
    return render_prompt(template_name, context)
