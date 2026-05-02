# CLAUDE.md

This file is the index for Bards Quest. Read it first, then open the doc for your domain.

## Project

**Bards Quest** — a static Astro site hosting an MSPA-style webcomic with embedded HTML5 canvas games.

## Commands

```bash
npm run dev       # dev server
npm run build     # build to dist/
npm run preview   # preview production build
```

> Always edit files in `public/`, never in `dist/`. Astro copies `public/` into `dist/` on build.

## Architecture: How Everything Connects

```
COMIC STRUCTURE (content.js)
  └── PAGES (read/[id]/[page].astro)
        ├── Header / Footer / Nav       → docs/layouts.md
        ├── Theme system                → docs/theme-system.md
        ├── Styles                      → docs/styles.md
        ├── Sprites                     → docs/sprites-system.md + docs/sprites-data.md
        ├── Reader JS                   → docs/reader-js.md
        └── Centerpiece                 → docs/centerpiece.md
              ├── Still image
              ├── Video
              └── Game (iframe)
                    └── Switch game     → docs/game-switch.md
                          ├── Map       → docs/game-switch-map-core.md
                          │             → docs/game-switch-map-renderer.md
                          │             → docs/game-switch-map-characters.md
                          │             → docs/game-switch-map-interactions.md
                          │             → docs/game-switch-map-quests.md
                          │             → docs/game-switch-map-minigames.md
                          ├── Battle    → docs/game-switch-battle-core.md
                          │             → docs/game-switch-battle-combat.md
                          │             → docs/game-switch-battle-fraymotifs.md
                          │             → docs/game-switch-battle-ui.md
                          │             → docs/game-switch-battle-animations.md
                          └── Dialogue  → docs/game-switch-dialogue-core.md
                                        → docs/game-switch-dialogue-content.md
```

## Doc Index

| Domain | Doc |
|--------|-----|
| Comic structure (Books/Chapters/Pages) | `docs/comic-structure.md` |
| Page anatomy (components per page) | `docs/page-anatomy.md` |
| Layouts (BaseLayout, MSPALayout) | `docs/layouts.md` |
| Theme system (priority, CSS vars, postMessage) | `docs/theme-system.md` |
| Styles (styles.css map) | `docs/styles.md` |
| Sprites system (SpriteConfig, SpriteRenderers) | `docs/sprites-system.md` |
| Sprites data (src/sprites/*.ts) | `docs/sprites-data.md` |
| Centerpiece (all content types, GameEmbed) | `docs/centerpiece.md` |
| Reader JS (reader.js, options.js, progress.js) | `docs/reader-js.md` |
| Switch game overview + orchestration | `docs/game-switch.md` |
| Map: core, AI, audio, rooms | `docs/game-switch-map-core.md` |
| Map: canvas renderer, camera, bitmapFont | `docs/game-switch-map-renderer.md` |
| Map: characters, GameState, save/load | `docs/game-switch-map-characters.md` |
| Map: interactions, chests, triggers | `docs/game-switch-map-interactions.md` |
| Map: quest system | `docs/game-switch-map-quests.md` |
| Map: mini-games, ending sequence | `docs/game-switch-map-minigames.md` |
| Battle: orchestrator, state, AI, audio | `docs/game-switch-battle-core.md` |
| Battle: combat engine, stats, turns | `docs/game-switch-battle-combat.md` |
| Battle: fraymotifs (all 35) | `docs/game-switch-battle-fraymotifs.md` |
| Battle: UI, input, text renderer | `docs/game-switch-battle-ui.md` |
| Battle: animations, effects CSS | `docs/game-switch-battle-animations.md` |
| Dialogue: orchestrator, engine, portraits | `docs/game-switch-dialogue-core.md` |
| Dialogue: conversation trees, content | `docs/game-switch-dialogue-content.md` |

## Adding a New Game

1. Create game files in `public/games/[name]/`
2. Add page entry to `src/utils/pageUtils.ts` → `getGameConfig()`
3. Create `src/pages/games/[name].astro` using `GameEmbed.astro`
4. Create `docs/game-[name].md` + subsystem docs
5. Add pointer row to the Doc Index table above
