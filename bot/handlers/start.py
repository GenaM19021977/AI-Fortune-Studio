"""
Команда /start: приветствие и кнопка открытия Mini App.

Роль бота на этом шаге — только вход в студию. Вся генерация контента
живёт в Django API + React Mini App (см. .cursor/rules/04-aiogram-bot.mdc).
"""

from aiogram import Router
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, Message, WebAppInfo

from config import settings

router = Router(name="start")


def studio_keyboard() -> InlineKeyboardMarkup:
    """
    Inline-клавиатура с одной кнопкой Web App.

    URL берётся из settings.webapp_url (.env → WEBAPP_URL):
      - localhost:5173 — удобно для desktop/dev;
      - https://….trycloudflare.com / https://….ngrok-free.app —
        обязательно для проверки на телефоне (шаг 0.9).

    Важно: бот читает .env только при старте процесса. После
    Start-Tunnel.ps1 нужно перезапустить `python main.py`, иначе
    в кнопке останется старый URL.
    """
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="✨ Открыть студию",
                    # WebAppInfo говорит Telegram открыть Mini App, а не обычную ссылку
                    web_app=WebAppInfo(url=settings.webapp_url),
                )
            ]
        ]
    )


@router.message(CommandStart())
async def cmd_start(message: Message) -> None:
    """Точка входа: приветствие и кнопка открытия Mini App."""
    await message.answer(
        "Добро пожаловать в <b>AI Fortune Studio</b>!\n\n"
        "Откройте Mini App, чтобы создавать предсказания, гороскопы "
        "и другой контент в стиле выбранного персонажа.",
        reply_markup=studio_keyboard(),
    )
