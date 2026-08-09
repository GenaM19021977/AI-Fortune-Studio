"""
Management command: заполнение каталога (шаг 1.3).

Запуск из backend/:
  python manage.py seed_data

Идемпотентно: повторный запуск обновляет поля по slug, не плодит дубликаты.
API personas/modes появится на шаге 1.5 — до тех пор проверяйте админку.
"""

from __future__ import annotations

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.content.models import ContentMode, EventType, Persona
from apps.content.seed_catalog import EVENTS, MODES, PERSONAS


class Command(BaseCommand):
    """Сидит ContentMode, Persona (×9) и базовые EventType."""

    help = "Seed: 4 режима, 9 персонажей и базовые поводы (шаг 1.3)."

    @transaction.atomic
    def handle(self, *args: object, **options: object) -> None:
        # Один atomic: либо весь каталог записался, либо откат при ошибке
        modes_n = self._upsert_modes()
        personas_n = self._upsert_personas()
        events_n = self._upsert_events()

        self.stdout.write(
            self.style.SUCCESS(
                f"OK seed_data: modes={modes_n}, personas={personas_n}, events={events_n}"
            )
        )
        # Без Unicode-стрелок: cp1251 в Windows-консоли иначе роняет atomic и откатывает seed
        self.stdout.write("Check admin: http://localhost:8000/admin/")

    def _upsert_modes(self) -> int:
        """Создаёт/обновляет режимы greeting, horoscope, poem, roast."""
        count = 0
        for row in MODES:
            slug = row["slug"]
            defaults = {k: v for k, v in row.items() if k != "slug"}
            defaults["is_active"] = True
            _, created = ContentMode.objects.update_or_create(
                slug=slug,
                defaults=defaults,
            )
            count += 1
            action = "created" if created else "updated"
            self.stdout.write(f"  mode [{action}] {slug}")
        return count

    def _upsert_personas(self) -> int:
        """Создаёт/обновляет 9 бесплатных персонажей из плана."""
        count = 0
        for row in PERSONAS:
            slug = row["slug"]
            defaults = {k: v for k, v in row.items() if k != "slug"}
            defaults["is_active"] = True
            _, created = Persona.objects.update_or_create(
                slug=slug,
                defaults=defaults,
            )
            count += 1
            action = "created" if created else "updated"
            self.stdout.write(f"  persona [{action}] {slug}")
        return count

    def _upsert_events(self) -> int:
        """Базовые поводы для мастера (birthday и др.)."""
        count = 0
        for row in EVENTS:
            slug = row["slug"]
            defaults = {k: v for k, v in row.items() if k != "slug"}
            defaults["is_active"] = True
            _, created = EventType.objects.update_or_create(
                slug=slug,
                defaults=defaults,
            )
            count += 1
            action = "created" if created else "updated"
            self.stdout.write(f"  event [{action}] {slug}")
        return count
