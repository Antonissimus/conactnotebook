# Установка и запуск

## Требования

- **Python** 3.12 или новее.
- **Docker Desktop** (или Docker Engine + Compose) — только если нужен сценарий из [docker.md](docker.md).

## Виртуальное окружение и зависимости

```powershell
cd f:\cursor\conactnotebook
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

На Linux/macOS активация обычно: `source .venv/bin/activate`.

## Запуск backend + UI локально

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- **Интерфейс и API:** `http://127.0.0.1:8000/`
- **OpenAPI (Swagger):** `http://127.0.0.1:8000/docs`
- **ReDoc:** `http://127.0.0.1:8000/redoc`

По умолчанию SQLite-файл создаётся в **текущей рабочей директории** процесса как `contacts.db` (см. раздел про БД ниже).

## Переменные окружения

| Переменная | Назначение | Пример / значение по умолчанию |
|------------|------------|--------------------------------|
| `DATABASE_URL` | Полный URL для SQLAlchemy async | Если задан — используется как есть (приоритетнее пути). Пример Docker: `sqlite+aiosqlite:////data/contacts.db` |
| `DATABASE_PATH` | Путь к файлу SQLite | Учитывается, только если **`DATABASE_URL` не задан**. Относительный путь — относительно CWD; абсолютный — с префиксом `sqlite+aiosqlite:///` |
| `SERVE_STATIC` | Отдавать ли каталог `static/` из FastAPI | `"1"` (по умолчанию) — да; `"0"` — только API (как в Docker backend) |

Логика разрешения URL БД реализована в `app/db.py`: сначала `DATABASE_URL`, иначе `DATABASE_PATH`, иначе `sqlite+aiosqlite:///contacts.db`.

## Линтинг и форматирование

В `pyproject.toml` настроен **Ruff**:

```powershell
ruff check .
ruff format .
```

Отдельный Prettier для фронта может использоваться вручную (в корне есть `.prettierrc`); в `requirements.txt` Prettier не входит.

## Полезные команды Uvicorn

- Только API без статики (например, отладка как в Docker):

  ```powershell
  $env:SERVE_STATIC="0"
  uvicorn app.main:app --reload
  ```

- Явный путь к БД:

  ```powershell
  $env:DATABASE_PATH="F:\data\my_contacts.db"
  uvicorn app.main:app --reload
  ```

Тесты используют **отдельный** файл БД (`test_contacts.db`), см. [testing.md](testing.md).
