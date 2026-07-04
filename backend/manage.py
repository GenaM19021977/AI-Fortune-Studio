#!/usr/bin/env python
"""
Django management utility.

По умолчанию использует dev settings; переопределяется через .env:
DJANGO_SETTINGS_MODULE=config.settings.dev
"""

import os
import sys


def main() -> None:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Django не установлен. Активируйте venv и выполните: "
            "pip install -r requirements/dev.txt"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
