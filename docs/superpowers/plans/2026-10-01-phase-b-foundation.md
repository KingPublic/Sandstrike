# Phase B Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:subagent-driven-development` (recommended) or
> `superpowers:executing-plans` to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a pinned, accessible, testable Phaser/Vite browser shell that
boots from both root and GitHub Pages-style base paths without adding gameplay.

**Architecture:** A plain DOM `AppShell` owns semantic navigation, errors, and the
canvas host. `createGame` owns the single Phaser instance and three thin scenes.
Build-path normalization is a pure function shared by Vite configuration and
tests; browser smoke tests treat console and asset failures as test failures.

**Tech Stack:** Node.js `^20.19.0 || >=22.12.0`, npm, Phaser 4.2.1,
TypeScript 6.0.3, Vite 8.3.1,
Vitest 5.0.3, Playwright 1.63.0, ESLint 10.11.0, typescript-eslint 8.71.0,
`@types/node` 26.6.3, plain HTML/CSS.

**Spec:** `docs/ARCHITECTURE.md` sections 3–5, 17–19 and
`docs/GAME_DESIGN.md` sections 10–16.

## Global Constraints

- Apply every constraint in `2026-10-01-phase-b-plan-set.md`.
- Install exact direct versions with `--save-exact`; commit `package-lock.json`.
- Keep menus and blocking/error overlays semantic and keyboard navigable.
- Add no gameplay, React, backend, remote service, or external production asset.
- Treat any Phaser boot, scale, input, audio-context, or Vite integration failure
  with `superpowers:systematic-debugging`; do not silently swap versions.

## Review Focus

- Unsupported Node versions stop with a clear engine error before install.
- Repeated mounting or teardown never leaves two Phaser instances/canvases.
- A preload/renderer error reaches a recoverable DOM error state.
- Root and `/Sandstrike/` builds resolve chunks and assets without 404s.
- Keyboard navigation and focus remain usable before a canvas is active.

---

### Task 1: Pin the compatible toolchain and quality commands

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `.gitignore`
- Create: `.nvmrc`
- Create: `.npmrc`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`

**Interfaces:**
- Consumes: Node.js `^20.19.0 || >=22.12.0` and npm.
- Produces: scripts `dev`, `build`, `build:pages`, `build:e2e`,
  `build:e2e:pages`, `preview`, `lint`, `typecheck`, `test`, `test:watch`,
  `test:e2e`, `test:e2e:pages`, `test:smoke:root`, `test:smoke:pages`, and
  `verify`. E2E scripts use test-only build modes;
  production smoke scripts use ordinary root/pages builds.

- [ ] **Step 1: Verify the runtime prerequisite**

  Run: `node --version && npm --version`

  Expected: Node is in the supported 20.x line at `v20.19.0` or newer, or is
  `v22.12.0` or newer; the current environment prints `v20.19.3`. Reject Node 21
  and older unsupported releases.

- [ ] **Step 2: Create the exact package manifest**

  Set `private: true`, `type: "module"`,
  `engines.node: "^20.19.0 || >=22.12.0"`, runtime
  dependency `phaser@4.2.1`, and exact dev dependencies listed in this plan's
  Tech Stack. Set `.nvmrc` to `20.19.3`, set `engine-strict=true` in `.npmrc`, and
  define `verify` as lint → typecheck → unit tests → production build.

- [ ] **Step 3: Install and lock dependencies**

  Run: `npm install`

  Expected: exit 0 and `package-lock.json` records the exact direct versions.

- [ ] **Step 4: Verify resolved direct versions**

  Run: `npm ls --depth=0`

  Expected: exactly Phaser 4.2.1, TypeScript 6.0.3, Vite 8.3.1, Vitest 5.0.3,
  Playwright 1.63.0, ESLint 10.11.0, typescript-eslint 8.71.0, and
  `@types/node` 26.6.3; no invalid peer dependency.

- [ ] **Step 5: Add strict TypeScript, lint, test, and ignore configuration**

  Use `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  `noImplicitOverride`, `useDefineForClassFields`, `moduleResolution: "Bundler"`,
  and `noEmit`. In ESLint's domain-file override, reject imports from Phaser,
  app, rendering, UI, storage, and infrastructure modules plus browser globals
  such as `window`, `document`, and `localStorage`. Ignore `dist`, `coverage`,
  `.worktrees`, `test-results`, `playwright-report`, `.env.local`, and
  `.env.*.local`; do not ignore the committed `.env.pages` or `.env.e2e` files.

- [ ] **Step 6: Prove the empty quality harness is callable**

  Run: `npm run lint && npm run typecheck && npm run test -- --passWithNoTests`

  Expected: exit 0; no unsupported-TypeScript warning from typescript-eslint.

- [ ] **Step 7: Commit**

  ```bash
  git add package.json package-lock.json .gitignore .nvmrc .npmrc tsconfig.json tsconfig.app.json tsconfig.node.json eslint.config.mjs vitest.config.ts playwright.config.ts
  git commit -m "chore: pin browser game toolchain"
  ```

### Task 2: Define and test static base-path behavior

**Files:**
- Create: `src/game/config/buildConfig.ts`
- Create: `tests/unit/buildConfig.test.ts`
- Create: `vite.config.ts`
- Create: `.env.pages`
- Create: `.env.e2e`
- Create: `.env.e2e-pages`

**Interfaces:**
- Consumes: `VITE_BASE_PATH` and `VITE_ENABLE_TEST_BRIDGE` from Vite mode
  environment; base-path selection and test-bridge selection are independent.
- Produces: `normalizeBasePath(raw?: string): string`, returning `/` or one
  leading-and-trailing-slash subpath; invalid traversal/query/hash input throws.

- [ ] **Step 1: Write the failing normalization test**

  Cover `undefined`, `""`, `"/"`, `"Sandstrike"`, `"/Sandstrike/"`, repeated
  slashes, and rejection of `..`, `?`, and `#`.

- [ ] **Step 2: Run the focused test and observe RED**

  Run: `npm run test -- tests/unit/buildConfig.test.ts`

  Expected: FAIL because `buildConfig.ts` does not exist.

- [ ] **Step 3: Implement `normalizeBasePath` and Vite configuration**

  `vite.config.ts` loads mode environment and passes the normalized value to
  Vite's `base`. `.env.pages` sets `/Sandstrike/`; `.env.e2e` enables only the
  test bridge at root; `.env.e2e-pages` enables the test bridge and sets
  `/Sandstrike/`. Do not read browser globals in build configuration.

- [ ] **Step 4: Run focused and type checks and observe GREEN**

  Run: `npm run test -- tests/unit/buildConfig.test.ts && npm run typecheck`

  Expected: all cases pass and TypeScript exits 0.

- [ ] **Step 5: Commit**

  ```bash
  git add src/game/config/buildConfig.ts tests/unit/buildConfig.test.ts vite.config.ts .env.pages .env.e2e .env.e2e-pages
  git commit -m "build: support static host base paths"
  ```

### Task 3: Boot an accessible shell and one Phaser instance

**Files:**
- Create: `index.html`
- Create: `src/main.ts`
- Create: `src/styles/main.css`
- Create: `src/app/AppShell.ts`
- Create: `src/game/createGame.ts`
- Create: `src/game/scenes/BootScene.ts`
- Create: `src/game/scenes/PreloadScene.ts`
- Create: `src/game/scenes/GameplayScene.ts`
- Create: `tests/e2e/boot.spec.ts`
- Modify: `playwright.config.ts`

**Interfaces:**
- Consumes: a single `#app` root element.
- Produces: `AppShell.mount(root: HTMLElement): void`,
  `AppShell.showError(message: string, retry: () => void): void`, and
  `createGame(parent: HTMLElement, options?: GameBootstrapOptions): Phaser.Game`.
- `GameBootstrapOptions` contains optional `onReady` and `onFatalError` callbacks.

- [ ] **Step 1: Write the failing browser smoke test**

  Assert a semantic `h1` named “Sandstrike”, a keyboard-focusable “Start vertical
  slice” button, one canvas after activation, a visible loading-to-ready transition,
  keyboard focus restoration, no failed required request, and no console error/
  page error. Add an E2E-only injected boot failure case that reaches a semantic
  recoverable error state and successfully retries without creating a second canvas.

- [ ] **Step 2: Run Playwright and observe RED**

  Run: `npx playwright install chromium` once, then `npm run test:e2e -- boot.spec.ts`

  Expected: FAIL because `index.html` and the shell do not exist.

- [ ] **Step 3: Implement the minimal DOM shell and scene chain**

  `BootScene` configures scale/lifecycle only, `PreloadScene` validates an empty
  required manifest and reports readiness, and `GameplayScene` renders only an
  original procedural ground/sky placeholder plus “Movement slice pending”.
  Repeated start clicks reuse the existing game; teardown destroys it and removes
  its canvas.

- [ ] **Step 4: Add responsive shell styles**

  Preserve focus outlines, safe-area padding, readable contrast, a 48 CSS pixel
  primary target, usable portrait menus, and `touch-action` restrictions only on
  the canvas/control surface.

- [ ] **Step 5: Run the focused browser test and observe GREEN**

  Run: `npm run test:e2e -- boot.spec.ts`

  Expected: PASS in Chromium with one canvas and no captured error.

- [ ] **Step 6: Run foundation quality checks**

  Run: `npm run lint && npm run typecheck && npm run test && npm run build`

  Expected: all commands exit 0 and `dist/index.html` exists.

- [ ] **Step 7: Commit**

  ```bash
  git add index.html src tests/e2e/boot.spec.ts playwright.config.ts
  git commit -m "feat: boot accessible Phaser shell"
  ```

### Task 4: Prove root and repository-subpath deployment

**Files:**
- Create: `playwright.pages.config.ts`
- Create: `playwright.production.config.ts`
- Create: `playwright.production-pages.config.ts`
- Create: `tests/e2e/static-hosting.spec.ts`
- Modify: `package.json`
- Modify: `README_START_HERE.md`

**Interfaces:**
- Consumes: `npm run build` and `npm run build:pages` for normal production, plus
  `npm run build:e2e` and `npm run build:e2e:pages` for isolated test builds at
  `/` and `/Sandstrike/`.
- Produces: reproducible local smoke commands for the exact built output and
  deployment instructions for Vercel and GitHub Pages.

- [ ] **Step 1: Write the failing non-root static smoke test**

  Against ordinary root and pages builds, assert shell heading and canvas boot,
  collect request failures, fail on console/page errors, and assert
  `window.__SANDSTRIKE_TEST__` is absent. Against E2E root and pages builds, assert
  the same base-path behavior; the bridge remains unused until the movement plan.

- [ ] **Step 2: Run it before pages scripts exist and observe RED**

  Run: `npm run test:e2e:pages`

  Expected: FAIL because the pages build/preview configuration is incomplete.

- [ ] **Step 3: Implement cross-platform build and preview scripts**

  `build:pages` uses mode `pages`; `build:e2e` uses mode `e2e`; and
  `build:e2e:pages` uses mode `e2e-pages`. Separate Playwright configs build and
  preview E2E root/pages on ports 4173/4174 and ordinary production root/pages on
  ports 4175/4176. Do not require shell environment-variable assignment syntax.

- [ ] **Step 4: Document static deployments**

  Record Node floor, install/verify commands, Vercel output `dist/`, GitHub Pages
  pages-mode build, and the fact that no server rewrite or backend is required.

- [ ] **Step 5: Run both hosting smokes and observe GREEN**

  Run: `npm run test:e2e && npm run test:e2e:pages && npm run test:smoke:root && npm run test:smoke:pages`

  Expected: all four suites pass with zero failed required request or fatal
  console error; ordinary production builds expose no test bridge.

- [ ] **Step 6: Run the plan exit checks**

  Run: `npm run verify && git diff --check`

  Expected: all checks pass; working tree contains only this task's intended files.

- [ ] **Step 7: Commit**

  ```bash
  git add package.json package-lock.json playwright.pages.config.ts playwright.production.config.ts playwright.production-pages.config.ts tests/e2e/static-hosting.spec.ts README_START_HERE.md
  git commit -m "test: verify static host builds"
  ```
