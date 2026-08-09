"""
Конфиг бота из корневого .env (рядом с docker-compose).

BOT_TOKEN и WEBAPP_URL — общие с бэкендом/фронтом; остальные ключи .env
игнорируем (extra=\"ignore\"), чтобы один файл обслуживал Django + бота.
"""

from pathlib import Path
from urllib.parse import urlparse

from pydantic_settings import BaseSettings, SettingsConfigDict

# Корень репозитория: AI-Fortune-Studio/ (на уровень выше bot/)
ROOT_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """
    Настройки aiogram-бота для локальной разработки (polling).

    WEBAPP_URL:
      - на шагах 0.7–0.8 достаточно http://localhost:5173 (desktop);
      - с шага 0.9 для телефона нужен HTTPS туннеля
        (см. scripts/Start-Tunnel.ps1 → обновляет этот ключ в .env).
    """

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

    def warn_if_webapp_not_https(self) -> str | None:
        """
        Подсказка для шага 0.9: на телефоне Telegram откроет Web App
        только по HTTPS (кроме редких desktop-исключений для localhost).

        Возвращает текст предупреждения или None, если URL уже https.
        Не падаем — localhost нужен для повседневной разработки в браузере.
        """
        parsed = urlparse(self.webapp_url.strip())
        if parsed.scheme == "https":
            return None
        return (
            f"WEBAPP_URL={self.webapp_url!r} без HTTPS. "
            "На телефоне кнопка Mini App не откроется. "
            "Запустите: .\\scripts\\Start-Tunnel.ps1 и перезапустите бота."
        )


settings = Settings()
