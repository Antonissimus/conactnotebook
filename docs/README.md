# Документация Contact Notebook

Репозиторийная документация по проекту «Contact Notebook» — веб-приложению для учёта контактов (FastAPI + статический фронтенд).

> **Не путать с Swagger UI:** при запущенном сервере интерактивная OpenAPI-документация FastAPI доступна по адресу `http://localhost:8000/docs`. Здесь же — Markdown-материалы в папке `docs/` репозитория.

## Оглавление

| Документ | Содержание |
|----------|------------|
| [Обзор](overview.md) | Назначение, возможности, технологический стек |
| [Архитектура](architecture.md) | Слои приложения, БД, жизненный цикл запроса |
| [Установка и запуск](setup.md) | Локальная разработка, переменные окружения, инструменты |
| [REST API](api.md) | Эндпоинты, схемы данных, коды ответов и ошибки |
| [Фронтенд](frontend.md) | Статические файлы, ES-модули, поведение UI |
| [Docker](docker.md) | Сборка, `docker-compose`, прокси Nginx, том БД |
| [Тестирование](testing.md) | Pytest, фикстуры, изолированная БД |

## Быстрый старт

```bash
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Откройте в браузере: `http://localhost:8000` (UI и API на одном хосте).

Подробности — в [setup.md](setup.md) и [docker.md](docker.md).
