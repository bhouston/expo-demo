# Expo TanStack Todo

A simple local-first to-do list app built with [Expo](https://expo.dev) (SDK 54) to demonstrate modern Expo + TanStack best practices. No user account is required — all data lives on the device in AsyncStorage.

> **Note:** This app uses native modules (whisper.rn) and therefore **no longer runs in Expo Go**. Use an iOS development build: `npx expo run:ios`.

## Features

- To-do list with title and optional description
- Add to-dos via a floating `+` button that opens a modal form
- Swipe a row left to reveal a Delete action (Gmail-style)
- **Dictate page** — live on-device speech-to-text (iOS): audio is captured from the microphone, segmented with Silero VAD, and transcribed incrementally by a local Whisper `base.en` model (downloaded once, ~150 MB, cached in app Documents). Nothing leaves the device.
- Settings page with:
  - **Generate Data** — inserts 1000 fake to-dos (via faker) to test list performance
  - **Delete All** — clears every to-do
  - **Delete Speech Model** — frees the downloaded Whisper model
- Light and dark mode support

## Stack and conventions

| Concern | Choice |
| --- | --- |
| Framework | Expo SDK 54, expo-router (file-based routing, typed routes), iOS dev build (prebuild) |
| Speech-to-text | [whisper.rn](https://github.com/mybigday/whisper.rn) (`RealtimeTranscriber` + `RingBufferVad`), `@fugood/react-native-audio-pcm-stream` mic PCM stream, models cached via expo-file-system |
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
    index.tsx     # To-do list, FAB, dictate + settings buttons
    add.tsx       # Modal form (TanStack Form + Zod)
    dictate.tsx   # Live on-device Whisper dictation
    settings.tsx  # Generate Data / Delete All / Delete Speech Model
  components/     # Reusable UI (TodoItem with swipe-to-delete)
  constants/      # Theme palette (light/dark)
  hooks/          # TanStack Query hooks (use-todos.ts), dictation (use-dictation.ts)
  lib/            # Zod schemas, AsyncStorage CRUD, Whisper model downloads
```

Data flow: screens call hooks in `src/hooks/use-todos.ts`; mutations call the storage functions in `src/lib/todo-storage.ts`, which return the full updated list so the query cache is updated in place (no refetch needed).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Build and run on iOS (first run generates the `ios/` directory via prebuild and requires Xcode + CocoaPods)

   ```bash
   npx expo run:ios
   ```

   For subsequent JS/TS-only changes, `npx expo start` with the installed development build is enough. Expo Go is not supported because whisper.rn is a native module.

### How dictation works

The Dictate page (mic icon on the home screen header) performs incremental, on-device transcription:

1. On first use it downloads `ggml-base.en.bin` (Whisper) and a small Silero VAD model from HuggingFace into the app's Documents directory.
2. `@fugood/react-native-audio-pcm-stream` streams 16 kHz mono PCM from the microphone.
3. whisper.rn's `RealtimeTranscriber` runs Silero VAD over the stream, slices audio at natural speech pauses (Whisper handles at most ~30 s per pass), and re-transcribes the active slice as you speak — the in-progress slice is shown italicized, and stabilized segments are appended to the transcript.
4. Previous slices are fed back as a prompt so the transcription stays coherent across slices.

## Useful commands

```bash
npx tsc --noEmit   # typecheck
npm run lint       # ESLint (includes React Compiler rules)
```
