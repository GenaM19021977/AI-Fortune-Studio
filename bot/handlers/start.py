"""Команда /start: приветствие и кнопка открытия Mini App."""

from aiogram import Router
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, Message, WebAppInfo

from config import settings

router = Router(name="start")


def studio_keyboard() -> InlineKeyboardMarkup:
    """Кнопка Web App. На http://localhost Telegram на телефоне не откроет — нужен HTTPS (шаг 0.9)."""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="✨ Открыть студию",
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
