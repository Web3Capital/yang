# AGENTS.md

## Cursor Cloud specific instructions

This repo is a **zero-dependency, zero-build static website** — an interactive linear-algebra
teaching site written in plain HTML / CSS / vanilla JavaScript (ES Modules). There is no package
manager, no lockfile, no bundler, and no framework.

### Running it

- It **must be served over HTTP** — ES Modules do not work when opening `index.html` via `file://`.
- Dev server (already documented in `README.md`): `python3 -m http.server 8000`, then open
  `http://localhost:8000/`. `python3` is preinstalled on the VM; there is nothing to install.
- Entry point is `index.html`, which loads `js/app.js` (a hash router). Lessons live in
  `js/lessons/*.js` and share the 2D plane engine in `js/plane.js`.

### Lint / test / build

- There is **no lint, no automated test, and no build step**. Verification is manual: serve the
  site and interact with a lesson in the browser (drag the control dots, move sliders, play the
  matrix-transform animation).
- A GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) publishes the repo root as-is to
  GitHub Pages on push to `main` (and the feature branch). It runs no build — it just uploads the
  static files.

### Notes / gotchas

- A `GET /favicon.ico -> 404` in the browser console is expected and harmless (no favicon is
  shipped).
- To add a lesson, follow `README.md`: create `js/lessons/xxx.js` exporting `meta` + `mount(root)`
  and register it in the `lessons` array in `js/app.js`.
