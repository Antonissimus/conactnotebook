---
name: git-github
description: >-
  Uses local git (shell) and the user-github MCP for GitHub API tasks. Use when
  the user works with branches, commits, remotes, push/pull, GitHub repos,
  issues, pull requests, or asks to create/configure a remote repository.
---

# Git и GitHub

## Разделение ответственности

| Задача | Как делать |
|--------|------------|
| Статус, ветки, коммит, merge, rebase, push/pull к уже настроенному `origin` | Терминал: `git …` |
| Создание репозитория на GitHub, issues/PR, содержимое файлов на GitHub, поиск по коду на GitHub | MCP **`user-github`** (`call_mcp_tool`) |

Перед вызовом MCP прочитай JSON-дескриптор нужного инструмента (обязательные поля и типы).

## Локальный Git (Windows / PowerShell)

- Рабочая копия проекта: выполняй команды из корня репозитория (`Set-Location` к папке с `.git`).
- Проверка: `git status`, `git remote -v`, `git branch -a`.
- Типичный цикл: `git add -A` или точечно → `git commit -m "…"` → `git push`.
- Если просят «отправить на GitHub» и `origin` не настроен — сначала уточни URL или создай репозиторий через MCP, затем `git remote add origin …` и `git push -u origin <ветка>`.

## Этот репозиторий

- Удалённый репозиторий по умолчанию: `https://github.com/Antonissimus/conactnotebook.git` (ветка по умолчанию в истории: **`master`**).
- Не коммить: см. `.gitignore` (`.venv/`, `*.db`, `.env`, кэши и т.д.).

## MCP `user-github`

1. Для контекста аккаунта и прав при неясности вызови **`get_me`**.
2. **Создать репозиторий на GitHub**: **`create_repository`** (`name` обязателен; для пуша существующего кода без лишнего коммита на сервере — `autoInit: false`).
3. Остальное — по задаче: `search_repositories`, `list_pull_requests`, `create_pull_request`, `get_file_contents`, `issue_write`, и т.д. — только после чтения дескриптора.

## Безопасность

- Не коммить секреты и локальные данные; не вставлять токены в чат или в код.
- Для PAT/логина GitHub в терминале используй `gh auth` или переменные окружения — не дублируй токены в skill-файлах.
