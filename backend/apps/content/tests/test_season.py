"""
Простые проверки сезонного фильтра (без БД).
"""

from __future__ import annotations

from datetime import date

from django.test import SimpleTestCase

from apps.content.services import is_date_in_season


class SeasonFilterTests(SimpleTestCase):
    def test_inside_same_year_range(self) -> None:
        self.assertTrue(
            is_date_in_season(date(2026, 12, 20), date(2000, 12, 1), date(2000, 12, 31))
        )

    def test_outside_same_year_range(self) -> None:
        self.assertFalse(
            is_date_in_season(date(2026, 6, 1), date(2000, 12, 1), date(2000, 12, 31))
        )

    def test_wrap_around_new_year(self) -> None:
        # 15.12 … 15.01
        start, end = date(2000, 12, 15), date(2000, 1, 15)
        self.assertTrue(is_date_in_season(date(2026, 12, 20), start, end))
        self.assertTrue(is_date_in_season(date(2026, 1, 10), start, end))
        self.assertFalse(is_date_in_season(date(2026, 6, 1), start, end))
