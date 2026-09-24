# Kurinji — My Personal Website

Portfolio for Kurinji Shivakumar: projects, awards, coursework, and a searchable log of solved
coding problems. The theme is **Midnight Bloom**: near-black with one kurinji-violet accent,
plus a light mode.

- **Home:** a hero whose name reacts to the cursor, a scroll-lit about section, stacked project
  cards with live, interactive covers and case-study modals, an experience timeline that draws as
  you scroll
- **Certificates & Awards:** featured wins (with a knight's-tour animation), certificates, and
  a filterable awards timeline
- **Education:** schools and a filterable course grid
- **Problems:** search, filter by data structure, difficulty and sort; each problem opens with
  its question, key insight, approach and highlighted solutions. It's backed by Supabase, and
  only you can add or edit.

## Current Tech Stack

React 19 · Vite 6 · React Router 7 · Motion · Lenis (smooth scroll) · Supabase ·
react-markdown · highlight.js · Geist, Geist Mono and Instrument Serif

## File Layout

```
src/
  data/          ← all personal content (edit these)
  pages/         Home, Achievements, Education, Problems, NotFound
  components/
    home/        hero, project stack + animated covers, sections
    problems/    list cards, detail drawer, add/edit form, code blocks
    layout/      nav, footer, page transitions, smooth scroll
    motion/      reveal, magnetic, tilt, counters, marquee
    ui/          modal, bloom logo, icons, segmented control
  lib/           search, Supabase client + API, hooks, theme & motion prefs
  styles/        design tokens (tokens.css) + global styles
supabase/        schema.sql (tables + row-level security), seed.sql (samples)
```
