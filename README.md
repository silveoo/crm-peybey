# Peybey CRM

Desktop CRM для локального управления бронированием столов: календарь ресурсов, столы, брони, настройки рабочего дня.

## Стек
Tauri 2, React, TypeScript, Vite, Rust, SQLite через официальный `@tauri-apps/plugin-sql`, Tailwind CSS, Zustand, date-fns, React Hook Form, Zod, Vitest.

## Требования и установка на macOS
1. Установите Node.js LTS с https://nodejs.org или `brew install node`.
2. Установите Rust: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`.
3. Установите Xcode Command Line Tools: `xcode-select --install`.
4. Установите зависимости проекта: `npm install`.

## Команды
- `npm run dev` — Vite dev server.
- `npm run tauri dev` — запуск desktop-приложения.
- `npm run build` — production frontend build.
- `npm run tauri build` — production desktop build.
- `npm run lint` — ESLint.
- `npm run test` — unit-тесты.
- `npm run typecheck` — проверка TypeScript.

## SQLite
База открывается URI `sqlite:crm.db`, поэтому Tauri SQL plugin размещает файл в директории данных приложения. Для очистки локальной базы удалите `crm.db` из app data директории вашей ОС.

## Структура
`src/app` — композиция приложения; `src/components` — UI и layout; `src/features` — календарь, брони, столы; `src/repositories` — интерфейсы и SQLite-реализации; `src/services` — бизнес-логика; `src/store` — Zustand; `src-tauri/migrations` — SQL миграции.

## Windows exe через GitHub Actions
Workflow `.github/workflows/release.yml` запускается вручную, выполняет lint/typecheck/tests и собирает Windows NSIS exe как workflow artifact. По возможности отдельная job собирает macOS bundle.
