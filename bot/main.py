"""
Точка входа бота: long polling (без webhook до Фазы 5).

Запуск из каталога bot/:
  python main.py
"""

from __future__ import annotations

import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode

from config import settings
from handlers.start import router as start_router

logger = logging.getLogger(__name__)


async def main() -> None:
    """Создаёт Bot/Dispatcher и крутит getUpdates до Ctrl+C."""
    settings.ensure_token()

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )

    bot = Bot(
        token=settings.bot_token,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )
    dp = Dispatcher()
    dp.include_router(start_router)

    # Удаляем webhook, если когда-то ставили — иначе polling не получит апдейты
    await bot.delete_webhook(drop_pending_updates=False)

    me = await bot.get_me()
    logger.info("Бот @%s запущен в режиме polling. WEBAPP_URL=%s", me.username, settings.webapp_url)

    # Шаг 0.9: без HTTPS Mini App с телефона не откроется — только предупреждаем
    https_hint = settings.warn_if_webapp_not_https()
    if https_hint:
        logger.warning(https_hint)

    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
