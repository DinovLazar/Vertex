# Hooks

This folder is reserved for extracted React hooks. The `@/hooks` import alias is configured in `components.json` and `tsconfig.json` to resolve here.

Conventions:
- One hook per file, named `use<Thing>.ts` (e.g. `useScrollDirection.ts`, `useDivision.ts`)
- Default export the hook itself
- Co-locate tests as `use<Thing>.test.ts` when added

Current hooks: none yet. Extract from component files as they're needed by multiple consumers.
