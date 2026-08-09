"""
Модели контента Mini App (шаг 1.2 DEVELOPMENT_GUIDE.md).

Источник полей — IMPLEMENTATION_PLAN.md §6.1 (content) и §6.2 (статусы).
MediaAsset / Favorite — позже (фаза 2), в этом шаге не создаём.
"""

from __future__ import annotations

import uuid

from django.db import models


class ContentMode(models.Model):
    """
    Режим генерации: greeting, horoscope, poem, roast, …

    phase — в какой фазе roadmap режим включаем (1 = MVP).
    sort_order — порядок на главном экране ModeGrid.
    """

    slug = models.SlugField(
        max_length=64,
        unique=True,
        help_text="Стабильный ключ API: greeting, horoscope, …",
    )
    name = models.CharField(max_length=128, help_text="Отображаемое имя (Поздравление).")
    emoji = models.CharField(max_length=16, blank=True, default="")
    description = models.TextField(blank=True, default="")
    phase = models.PositiveSmallIntegerField(
        default=1,
        help_text="Фаза roadmap, с которой режим доступен пользователю.",
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Выкл. — скрыть из каталога без удаления истории.",
    )
    sort_order = models.PositiveIntegerField(
        default=0,
        help_text="Меньше значение — выше в списке.",
    )

    class Meta:
        verbose_name = "Режим контента"
        verbose_name_plural = "Режимы контента"
        ordering = ["sort_order", "name"]

    def __str__(self) -> str:
        return f"{self.emoji} {self.name}".strip()


class Persona(models.Model):
    """
    Персонаж с уникальным голосом (Бабка с лавочки, Нострадамус, …).

    system_prompt / voice_tone / signature — база для Jinja2 на шаге 1.6+.
    category — фильтр API (?category=mystic), см. план §11.1.
    """

    class Category(models.TextChoices):
        MYSTIC = "mystic", "Мистика"
        HUMOR = "humor", "Юмор"
        SAGES = "sages", "Мудрецы"
        HISTORY = "history", "История"

    slug = models.SlugField(max_length=64, unique=True)
    name = models.CharField(max_length=128)
    title = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Короткий титул: «пророчица с лавочки».",
    )
    category = models.CharField(
        max_length=32,
        choices=Category.choices,
        default=Category.HUMOR,
        db_index=True,
    )
    emoji = models.CharField(max_length=16, blank=True, default="")
    gradient = models.CharField(
        max_length=128,
        blank=True,
        default="",
        help_text="CSS-градиент карточки, напр. from-amber-500 to-rose-600.",
    )
    voice_tone = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Тон речи для промпта: «ворчливо, по-доброму».",
    )
    signature = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Фирменная стартовая фраза персонажа.",
    )
    system_prompt = models.TextField(
        blank=True,
        default="",
        help_text="Базовый system prompt (до Jinja2-шаблонов).",
    )
    is_premium = models.BooleanField(
        default=False,
        help_text="True — только для Premium (фаза 3).",
    )
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "Персонаж"
        verbose_name_plural = "Персонажи"
        ordering = ["sort_order", "name"]

    def __str__(self) -> str:
        return f"{self.emoji} {self.name}".strip()


class EventType(models.Model):
    """
    Повод генерации: день рождения, свадьба, Новый год, …

    season_start / season_end — для сезонного баннера на главной
    (год в дате обычно игнорируем при выборке «сейчас в сезоне»).
    """

    slug = models.SlugField(max_length=64, unique=True)
    name = models.CharField(max_length=128)
    emoji = models.CharField(max_length=16, blank=True, default="")
    season_start = models.DateField(
        null=True,
        blank=True,
        help_text="Начало сезона (nullable — повод без сезона, напр. ДР).",
    )
    season_end = models.DateField(
        null=True,
        blank=True,
        help_text="Конец сезона; пусто = не сезонное событие.",
    )
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "Тип повода"
        verbose_name_plural = "Типы поводов"
        ordering = ["sort_order", "name"]

    def __str__(self) -> str:
        return f"{self.emoji} {self.name}".strip()


class Generation(models.Model):
    """
    Запрос на генерацию контента.

    Статусы (§6.2): pending → processing → completed | failed.
    Текст MVP часто завершается синхронно; медиа (фаза 2) — через Celery.
    UUID pk — безопаснее светить в URL, чем последовательный int.
    """

    class Status(models.TextChoices):
        PENDING = "pending", "В очереди"
        PROCESSING = "processing", "Генерируется"
        COMPLETED = "completed", "Готово"
        FAILED = "failed", "Ошибка"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        "users.TelegramUser",
        on_delete=models.CASCADE,
        related_name="generations",
    )
    content_mode = models.ForeignKey(
        ContentMode,
        on_delete=models.PROTECT,
        related_name="generations",
    )
    persona = models.ForeignKey(
        Persona,
        on_delete=models.PROTECT,
        related_name="generations",
    )
    # Структура JSON — §6.3: name, birth_date, event, partner_name, extra
    input_data = models.JSONField(
        default=dict,
        blank=True,
        help_text="Ввод мастера: имя, дата, повод, extra, …",
    )
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    error_message = models.TextField(
        blank=True,
        default="",
        help_text="Техническая ошибка при failed (пользователю не показываем traceback).",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Генерация"
        verbose_name_plural = "Генерации"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.content_mode_id}/{self.status} ({self.id})"


class GenerationResult(models.Model):
    """
    Текстовый результат генерации (1:1 к Generation на старте).

    source=llm — ответ модели; template — graceful fallback без API-ключа.
    """

    class Source(models.TextChoices):
        LLM = "llm", "LLM"
        TEMPLATE = "template", "Шаблон (fallback)"

    generation = models.OneToOneField(
        Generation,
        on_delete=models.CASCADE,
        related_name="result",
    )
    title = models.CharField(max_length=255, blank=True, default="")
    body_text = models.TextField(help_text="Основной текст для экрана результата.")
    share_text = models.TextField(
        blank=True,
        default="",
        help_text="Готовый текст для шеринга в Telegram (с подписью).",
    )
    source = models.CharField(
        max_length=16,
        choices=Source.choices,
        default=Source.TEMPLATE,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Результат генерации"
        verbose_name_plural = "Результаты генераций"

    def __str__(self) -> str:
        return self.title or f"result:{self.generation_id}"
