# Expo TanStack Todo

A simple local-first to-do list app built with [Expo](https://expo.dev) (SDK 56) to demonstrate modern Expo + TanStack best practices. No user account is required — all data lives on the device in AsyncStorage.

## Features

- To-do list with title and optional description
- Add to-dos via a floating `+` button that opens a modal form
- Swipe a row left to reveal a Delete action (Gmail-style)
- Settings page with:
  - **Generate Data** — inserts 1000 fake to-dos (via faker) to test list performance
  - **Delete All** — clears every to-do
- Light and dark mode support

## Stack and conventions

| Concern | Choice |
| --- | --- |
| Framework | Expo SDK 56, expo-router (file-based routing, typed routes) |
| Language | TypeScript (strict) |
| Data fetching/cache | TanStack Query over an AsyncStorage persistence layer |
| Forms | TanStack Form with Zod schemas passed directly to `validators` |
| Validation | Zod 4 (`src/lib/schema.ts` is the single source of truth for types) |
| List rendering | `@shopify/flash-list` v2 (recycling list, handles 1000+ rows) |
| Swipe gestures | `ReanimatedSwipeable` from react-native-gesture-handler |
| Memoization | React Compiler (enabled in `app.json` `experiments.reactCompiler`); no manual `useMemo`/`useCallback`/`React.memo` |
| Safe areas | `useSafeAreaInsets` for FAB/list/form padding (camera cutouts, home indicator) |
| Keyboard | `KeyboardAvoidingView` around the add-todo form |

## Project structure

```
src/
  app/            # expo-router screens (only screens/layouts live here)
    _layout.tsx   # GestureHandlerRootView, QueryClientProvider, theme, Stack
    index.tsx     # To-do list, FAB, settings button
    add.tsx       # Modal form (TanStack Form + Zod)
    settings.tsx  # Generate Data / Delete All
  components/     # Reusable UI (TodoItem with swipe-to-delete)
  constants/      # Theme palette (light/dark)
  hooks/          # TanStack Query hooks (use-todos.ts)
  lib/            # Zod schemas and AsyncStorage CRUD (todo-storage.ts)
```

Data flow: screens call hooks in `src/hooks/use-todos.ts`; mutations call the storage functions in `src/lib/todo-storage.ts`, which return the full updated list so the query cache is updated in place (no refetch needed).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

Then open it in a development build, the iOS Simulator, an Android emulator, or Expo Go.

## Useful commands

```bash
npx tsc --noEmit   # typecheck
npm run lint       # ESLint (includes React Compiler rules)
```
