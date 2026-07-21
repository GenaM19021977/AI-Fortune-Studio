"""
Конфиг бота из корневого .env (рядом с docker-compose).

BOT_TOKEN и WEBAPP_URL — общие с Django; остальные переменные .env игнорируем.
"""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Корень репозитория: AI-Fortune-Studio/
ROOT_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """Настройки aiogram-бота для локальной разработки (polling)."""

    model_config = SettingsConfigDict(
        env_file=ROOT_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Имена полей → переменные BOT_TOKEN / WEBAPP_URL (case-insensitive)
    bot_token: str = ""
    webapp_url: str = "http://localhost:5173"

    def ensure_token(self) -> None:
        """Падаем сразу с понятной ошибкой, если токен не задан в .env."""
        placeholder = "your_bot_token_from_botfather"
        if not self.bot_token or self.bot_token.strip() == placeholder:
            raise SystemExit(
                "Укажите BOT_TOKEN в корневом .env (токен от @BotFather).\n"
                "Скопируйте .env.example → .env, если файла ещё нет."
            )


settings = Settings()
