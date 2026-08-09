"""
Админка каталога и генераций (шаг 1.2).

Критерий готовности: можно добавить ContentMode и Persona через
http://localhost:8000/admin/
"""

from django.contrib import admin

from .models import ContentMode, EventType, Generation, GenerationResult, Persona


@admin.register(ContentMode)
class ContentModeAdmin(admin.ModelAdmin):
    """Режимы: greeting, horoscope, poem, roast, …"""

    list_display = ("slug", "name", "emoji", "phase", "is_active", "sort_order")
    list_filter = ("phase", "is_active")
    search_fields = ("slug", "name", "description")
    list_editable = ("is_active", "sort_order")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("sort_order", "name")


@admin.register(Persona)
class PersonaAdmin(admin.ModelAdmin):
    """Персонажи с голосом и system_prompt."""

    list_display = (
        "slug",
        "name",
        "category",
        "emoji",
        "is_premium",
        "is_active",
        "sort_order",
    )
    list_filter = ("category", "is_premium", "is_active")
    search_fields = ("slug", "name", "title", "voice_tone", "signature")
    list_editable = ("is_active", "sort_order")
    prepopulated_fields = {"slug": ("name",)}
    # Длинные промпты удобнее внизу карточки
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "slug",
                    "name",
                    "title",
                    "category",
                    "emoji",
                    "gradient",
                    "is_premium",
                    "is_active",
                    "sort_order",
                )
            },
        ),
        (
            "Голос для LLM",
            {
                "fields": ("voice_tone", "signature", "system_prompt"),
                "description": "Используется в Jinja2-промптах (шаг 1.6+).",
            },
        ),
    )


@admin.register(EventType)
class EventTypeAdmin(admin.ModelAdmin):
    """Поводы: ДР, свадьба, сезонное."""

    list_display = (
        "slug",
        "name",
        "emoji",
        "season_start",
        "season_end",
        "is_active",
        "sort_order",
    )
    list_filter = ("is_active",)
    search_fields = ("slug", "name")
    list_editable = ("is_active", "sort_order")
    prepopulated_fields = {"slug": ("name",)}


class GenerationResultInline(admin.StackedInline):
    """Результат на карточке генерации (1:1)."""

    model = GenerationResult
    can_delete = False
    extra = 0
    max_num = 1
    readonly_fields = ("created_at",)


@admin.register(Generation)
class GenerationAdmin(admin.ModelAdmin):
    """История запросов — в основном read-only просмотр."""

    list_display = (
        "id",
        "user",
        "content_mode",
        "persona",
        "status",
        "created_at",
    )
    list_filter = ("status", "content_mode", "persona")
    search_fields = ("id", "user__telegram_id", "user__username", "user__first_name")
    readonly_fields = ("id", "created_at", "updated_at")
    raw_id_fields = ("user",)
    autocomplete_fields = ("content_mode", "persona")
    inlines = (GenerationResultInline,)
    date_hierarchy = "created_at"


@admin.register(GenerationResult)
class GenerationResultAdmin(admin.ModelAdmin):
    """Отдельный список текстоввых результатов."""

    list_display = ("title", "generation", "source", "created_at")
    list_filter = ("source",)
    search_fields = ("title", "body_text", "share_text")
    raw_id_fields = ("generation",)
    readonly_fields = ("created_at",)
