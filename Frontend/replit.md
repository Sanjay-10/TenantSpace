# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

- `artifacts/api-server` — Express API server (template, unused by UnitLink)
- `artifacts/mockup-sandbox` — Vite preview server for canvas mockups
- `artifacts/unitlink` — UnitLink mobile app (Expo + React Native)

## UnitLink (Expo mobile app)

- **UI**: React Native `StyleSheet` — NativeWind/Tailwind fully removed. All styles are explicit `StyleSheet.create()` objects or inline style props.
- **Theme**: Light + dark mode driven by `constants/colors.ts` palettes. `ThemeSync` in `_layout.tsx` reads `useColors().scheme` to set the `StatusBar` style. `state.themeMode` (`'light' | 'dark' | 'system'`) is stored in AppContext.
- **Theme toggle**: Settings modal exposes a System/Light/Dark segmented control. Persisted in AppContext under storage key `unitlink-app-state-v5`.
- **Color helper**: `hooks/useColors.ts` — reads `AppContext` (via `useContext`) for `themeMode` and React Native's `useColorScheme()` for system preference. Returns the resolved light/dark palette from `constants/colors.ts` plus `scheme` and `radius`. Safe to call outside `AppProvider` (falls back to "system").
- **Fonts**: Inter loaded via `@expo-google-fonts/inter`; referenced directly as `fontFamily: "Inter_700Bold"` etc. in StyleSheets.
- **Brand gradient**: `expo-linear-gradient` with `gradientStart/Mid/End` from `constants/colors.ts`.
- **NativeWind packages** (`nativewind`, `react-native-css-interop`, `tailwindcss`) remain listed in `package.json` but are not imported anywhere — safe to remove in a future cleanup.
