Mini ERP Landing Page

A simple static landing page that provides a download button for the Windows POS installer built from `packages/POS`.

Quick start:

- Make sure you have an installer built in `packages/POS/dist` (run `npm run build:win` inside `packages/POS`).
- Start a local server that serves the repository root so the download link to `packages/POS/dist` will work and open the landing page at `/packages/landing`:

```
# serve from the repo root and open the landing page
npx http-server -p 5000 .
# or (from anywhere) run:
npm run start --prefix packages/landing
```

The landing page will be available at `http://localhost:5000/packages/landing` and the download button points to `packages/POS/dist/Mini ERP POS Setup 1.0.0.exe`.
