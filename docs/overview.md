# Обзор проекта

## Назначение

**Contact Notebook** — лёгкое веб-приложение для создания, просмотра, редактирования и удаления контактов. Данные хранятся в SQLite; интерфейс — одностраничное приложение на чистом JavaScript (ES-модули) без фреймворков.

## Возможности

- **CRUD по контактам** через REST API и через UI.
- **Валидация** на сервере (Pydantic): имя, телефон (минимум 10 цифр, если поле не пустое), email, длина заметок.
- **Список с поиском** на клиенте по имени, телефону, email и заметкам.
- **Отображение** даты создания и маски телефона в формате, удобном для РФ (`+7 (…) …`).
- **Режимы запуска**:
  - один процесс Uvicorn отдаёт и API, и статику (`SERVE_STATIC=1` по умолчанию);
  - в Docker — отдельные контейнеры backend (только API) и frontend (Nginx со статикой и прокси на `/api`).

## Технологический стек

| Область | Технологии |
|---------|------------|
| Backend | Python 3.12, FastAPI, Uvicorn |
| ORM / БД | SQLAlchemy 2.0 (async), aiosqlite, SQLite |
| Валидация / схемы | Pydantic v2 (`pydantic[email]`) |
| Frontend | HTML5, CSS, Vanilla JS (модули), Lucide Icons (CDN) |
| Контейнеры | Docker, Docker Compose, Nginx (Alpine) в образе frontend |
| Тесты | Pytest, pytest-asyncio, HTTPX (ASGI) |
| Качество кода | Ruff (линт и формат), настройки в `pyproject.toml` |

## Структура репозитория (кратко)

```
app/                 # Python-пакет приложения
  main.py            # FastAPI, CORS, обработчики ошибок, статика, lifespan
  db.py              # Async engine, модель таблицы, init_db, get_db
  api/               # Роутеры
  models/            # Pydantic-схемы API
  services/          # Бизнес-логика и доступ к данным
static/              # UI: index.html, css/, js/
frontend/            # Dockerfile и nginx.conf для стека в Compose
tests/               # Интеграционные тесты API
```

Подробнее о взаимодействии компонентов — в [architecture.md](architecture.md).
