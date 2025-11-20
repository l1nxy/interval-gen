# Frontend (Vite + React + shadcn-inspired UI)

## Quick start
- Install deps: `cd web && npm install` (or `pnpm install`/`yarn`).
- Run dev server: `npm run dev` then open the printed `localhost` URL.
- Build for prod: `npm run build` and preview via `npm run preview`.

## What you get
- A list view grouped by week plus a calendar view for the current month.
- Sample workouts in `src/lib/sample-data.ts` shaped like the generator output.
- Lightweight shadcn-style primitives in `src/components/ui` with dark styling.
- Theme toggle (light/day vs. low-saturation night) is in the top-right toolbar.

## Customizing data
- Replace `sampleWorkouts` with real plan data (array of workouts) that includes `week`, `day_of_week`, `name`, `description`, and `start_date_local` (ISO string).
- IDs auto-derive if missing, but keeping stable `id` strings is recommended for React keys.

## Styling notes
- Utilities are in `src/index.css` to emulate the shadcn/Tailwind classes used by the components.
- Update palette tokens on `:root` to adjust the gradient, cards, and accent color.
