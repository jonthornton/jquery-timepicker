# AGENTS.md

jquery-timepicker: a jQuery plugin rendering a Google Calendar-style time dropdown. Only runtime dependency is jQuery >= 3.0.

## Layout

- `src/jquery.timepicker.js` — entry point: UMD wrapper, `$.fn.timepicker` method dispatch, event wiring.
- `src/timepicker/index.js` — `Timepicker` class; most logic lives here.
- `src/timepicker/render.js` — dropdown/`<select>` HTML generation.
- `src/timepicker/defaults.js` — `DEFAULT_SETTINGS` and `DEFAULT_LANG`. Option names here double as the `data-*` attribute API.
- `src/timepicker/rounding.js`, `constants.js` — helpers.
- `src/static/jquery.timepicker.css` — the real stylesheet; root CSS files are copies made by the build.
- `src/__tests__/` — jest tests (jsdom). No config file; defaults only.
- Root `jquery.timepicker*.js|css` are **build output, committed to the repo**. Never hand-edit them.
- `index.html` + `documentation-assets/` are the demo site. No CI.

## Workflow

1. Edit `src/`.
2. Add or extend a jest test for the change — always, not just for new features.
3. `npm test`
4. `npm run build` and commit the regenerated root bundles so they stay in sync with `src/`.
5. For anything that changes the dropdown's appearance or interaction, say so and ask the user to check `index.html` in a browser — jsdom tests don't cover that.

`npm run format` runs prettier-eslint over `src/`. ESLint config is empty; match surrounding style instead.

## Conventions

- Adding, renaming, or removing an option means updating three places: `defaults.js`, the options list in `README.md`, and `src/jquery.timepicker.d.ts`.
- The `.d.ts` is published (`types` in `package.json`) and augments the global `JQuery` interface, so it must keep compiling. `npm test` does not check it — run `tsc --noEmit --strict` against `@types/jquery` when you touch it.
- `package.json` is the only place a version is written; `rollup.config.js` imports it for the build banner. A release is the bump plus `npm run build`. Never hardcode a version elsewhere, and only bump when the user asks for a release.
