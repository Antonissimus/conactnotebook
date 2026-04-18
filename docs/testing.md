# Тестирование

## Инструменты

- **Pytest** — запуск тестов.
- **pytest-asyncio** — асинхронные тесты и фикстуры; в `pytest.ini` задано `asyncio_mode = auto` и `asyncio_default_test_loop_scope = session`.
- **HTTPX** — `AsyncClient` с `ASGITransport(app=app)` для вызова приложения **без поднятия TCP-сервера**.

Зависимости перечислены в `requirements.txt`.

## Запуск

Из корня репозитория (с активированным venv):

```powershell
pytest
```

Запуск одного файла или теста:

```powershell
pytest tests\test_contacts.py -v
pytest tests\test_contacts.py::test_delete_contact -v
```

## Изоляция базы данных

В `tests/conftest.py`:

1. **`db_engine` (session scope)** — отдельный async engine на URL `sqlite+aiosqlite:///./test_contacts.db`. Перед тестами создаются таблицы по `Base.metadata`, после сессии — `drop_all` и `dispose`.
2. **`db_session`** — сессия на этом engine; после теста выполняется `rollback()`, чтобы не оставлять «грязное» состояние между тестами в рамках одной сессии фикстуры (логика зависит от порядка; фактически тесты создают данные через HTTP).
3. **`client`** — подмена зависимости `get_db` на эту тестовую сессию, затем HTTPX-клиент с `base_url="http://test"`.

Так API в тестах ходит в **тестовую SQLite**, а не в рабочую `contacts.db`.

## Покрытие `tests/test_contacts.py`

| Тест | Проверяемое поведение |
|------|------------------------|
| `test_create_contact` | `POST /api/contacts` → 201, поля ответа |
| `test_list_contacts` | несколько созданий → `GET /api/contacts` → ≥ 2 записей |
| `test_get_contact` | получение по `id` |
| `test_update_contact` | `PUT` меняет `full_name` |
| `test_delete_contact` | `DELETE` → 204, затем `GET` → 404 |
| `test_validation_error` | невалидный email → 422 и `error.code == "validation_error"` |

## Замечания

- Файл `test_contacts.db` появится в корне проекта на время прогона (создаётся движком SQLite по URL).
- При добавлении новых эндпоинтов имеет смысл расширять тесты теми же паттернами: `client` + проверка статуса и JSON.
