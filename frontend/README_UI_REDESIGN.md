Map2Home Frontend UI Redesign

Summary:
- Modernized overall UI to match the provided reference: updated hero layouts, glass panels, gradients, rounded cards, and micro-animations.
- Updated global typography and tokens in `src/style.css` (Google Fonts, colors, transitions).
- Restyled core components: `Navbar.vue`, `Button.vue`, `Input.vue`, `ServiceCard.vue`.
- Restyled main pages: `Landing.vue`, `LandingPage.vue`, `Dashboard.vue`, `AdminDashboard.vue`.
- Added responsive mobile menu and interactions; ensured components keep original behavior and bindings.

Important constraints followed:
- Backend code, controllers, routes, APIs, and database were NOT modified.
- Only frontend files and styles were changed.

How to preview locally:
1. Open terminal in project root
2. Run:

```cmd
cd c:\Users\92306\Desktop\Map2Home\frontend
npm install
npm run dev
```

- Vite will print a local URL (e.g. http://localhost:5173 or 5174). Open it to preview.

Production build:

```cmd
cd c:\Users\92306\Desktop\Map2Home\frontend
npm run build
```

Notes & next steps:
- `npm audit` reports moderate vulnerabilities; they are unrelated to UI changes and can be addressed separately.
- If you want, I can:
  - Continue polishing other pages (AdminMaterials, CostEstimation, Register/Login) for closer parity with the reference.
  - Create a single commit and suggested commit message, or open a PR branch.

Suggested commit message:
"ui: redesign frontend — modern hero, glass cards, responsive nav, typography updates"
