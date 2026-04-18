# Docker и docker-compose

## Сервисы

Файл `docker-compose.yml` описывает два сервиса:

| Сервис | Роль |
|--------|------|
| `backend` | Образ из `Dockerfile.backend`: Python 3.12, зависимости из `requirements.txt`, пакет `app/`, Uvicorn на порту **8000** внутри сети Compose |
| `frontend` | Образ из `frontend/Dockerfile`: Nginx Alpine, статика из `static/`, конфиг `frontend/nginx.conf` |

Публичный порт **8080:80** проброшен у **frontend**. Backend наружу не публикуется (`expose: 8000`), доступен только из сети Docker как хост `backend`.

## Backend-образ (`Dockerfile.backend`)

- Копируются только `requirements.txt` и каталог `app/` (каталог `static/` в образ API не попадает — это нормально для режима без статики).
- Переменные по умолчанию в образе: `SERVE_STATIC=0`, `DATABASE_URL=sqlite+aiosqlite:////data/contacts.db`.
- Команда: `uvicorn app.main:app --host 0.0.0.0 --port 8000`.

## Frontend-образ (`frontend/Dockerfile`)

- Базовый образ `nginx:alpine`.
- Конфиг: `/etc/nginx/conf.d/default.conf` из `frontend/nginx.conf`.
- Статика: `/usr/share/nginx/html/` из репозитория `static/`.

### Прокси API (`frontend/nginx.conf`)

```nginx
location /api/ {
    proxy_pass http://backend:8000/api/;
    ...
}
```

Запросы браузера к `http://localhost:8080/api/...` попадают на Uvicorn по внутреннему имени `backend`.

## Том базы данных

В `docker-compose.yml` для backend задано:

```yaml
environment:
  DATABASE_URL: sqlite+aiosqlite:////data/contacts.db
volumes:
  - ./contacts.db:/data/contacts.db
```

Файл **`contacts.db` в корне проекта на хосте** монтируется в контейнер как `/data/contacts.db`. База сохраняется между перезапусками, если файл на хосте не удалять.

При **первом** запуске, если файла ещё нет, Docker создаёт пустой файл тома; приложение при старте создаст таблицы через `init_db()`.

## Сборка и запуск

Из корня репозитория:

```powershell
docker compose up --build
```

Откройте приложение: **http://localhost:8080/**.

Остановка: `Ctrl+C` или `docker compose down`.

## Согласованность с локальным запуском

- Локально без Docker по умолчанию используется `contacts.db` в **текущей рабочей директории** shell (часто это корень проекта).
- В Compose явно используется тот же файл **`./contacts.db`**, смонтированный в контейнер — удобно не плодить разные БД, если вы чередуете Docker и локальный Uvicorn из корня проекта.

Если нужна отдельная БД только для контейнера, измените путь в `volumes` или используйте именованный том вместо bind-mount.
