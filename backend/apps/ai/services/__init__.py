"""
Публичный API пакета services.

generate_text — точка входа для шага 1.7 (GenerationService).
"""

from apps.ai.services.text import generate_text
from apps.ai.services.types import GeneratedText

__all__ = ["GeneratedText", "generate_text"]
