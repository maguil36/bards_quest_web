# Sprites System

Sprites are the small 72×72 decorative panels that flank the centerpiece on each comic page. Their content is aspect-themed and page-specific, configured in `SpriteConfig.astro` and rendered by `SpriteRenderers.astro`.

---

## SpriteConfig.astro

`src/components/SpriteConfig.astro` is the single source of truth for all per-page sprite data.

### The `pageConfigs` map

```ts
export const pageConfigs: Record<number, Record<string, any>>
```

Key: integer page number (e.g., `1`, `12`).
Value: an object with a `pov` field plus one entry per aspect.

```ts
// Example — page 1
1: {
  pov: 'victor',
  time: createTimeConfig('loop', '12:30:50', '+ 0', { startDate: '2026:01:01', middleTimes: ['+ 5', '= 5', '+ 0', '+ 5'] }),
  space: createSpaceConfig('Earth'),
  breath: createBreathConfig(1),
  light: createLightConfig('Alexis appears'),
  heart: await createHeartConfig('heart'),
  mind: createMindConfig('observing'),
  life: createLifeConfig(50, 100),
  doom: createDoomConfig([]),
  blood: createBloodConfig(1, { 'Build': 10 }),
  void: createVoidConfig({ page: 1 }, '')
}
```

### Fields in a page config entry

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `pov` | `string` | yes | Lowercase character name. Drives automatic weapon, character icon, grist character, and breath level lookups. |
| `time` | `TimeClockConfig` | no | Clock sprite config (time aspect). Falls back to `defaultPageConfig.time`. |
| `space` | `{ type: 'static', svg: string }` | no | Planet image sprite (space aspect). Falls back to `defaultPageConfig.space`. |
| `breath` | `BreathConfig` | no | Echeladder level sprite (breath aspect). If omitted, system fills it using `getCharacterLevel(pov)`. |
| `light` | `LightTooltipConfig` | no | Character icon with tooltip (light aspect). Falls back to `defaultPageConfig.light`. |
| `heart` | `HeartQuadrantConfig` | no | Quadrant card suit sprite (heart aspect). `await` is required. Falls back to `defaultPageConfig.heart`. |
| `mind` | `MindTooltipConfig` | no | Mental state tooltip (mind aspect). Falls back to `defaultPageConfig.mind`. |
| `hope` | `HopeGodTierConfig` | no | God tier symbol (hope aspect). Falls back to `defaultPageConfig.hope`. |
| `rage` | `RageSpecibusConfig` | no | Weapon specibus sprite (rage aspect). Falls back to `defaultPageConfig.rage`. |
| `life` | `LifeHealthConfig` | no | Health bar sprite (life aspect). Falls back to `defaultPageConfig.life`. |
| `doom` | `DoomInventoryConfig` | no | Inventory/captchalogue sprite (doom aspect). Falls back to `defaultPageConfig.doom`. |
| `blood` | `BloodGristConfig` | no | Grist counter sprite (blood aspect). Falls back to `defaultPageConfig.blood`. |
| `void` | `VoidMetadataConfig` | no | Hidden metadata (void aspect). Not rendered visibly. Falls back to `defaultPageConfig.void`. |

### Fallback chain

`getSpriteConfig(page, aspect)` resolves in this order:

1. `pageConfigs[page][aspect]`
2. `defaultPageConfig[aspect]` (pov `'redacted'`, all aspects at safe defaults)
3. `defaultConfig` — `{ type: 'static', svg: defaultSprite }` (grey gradient circle)

### Breath post-processing

After the `configs` object is built, two passes run:

- **Pass 1**: For each page that has an explicit `breath` config, call `setCharacterLevel(pov, level)` to record the level.
- **Pass 2**: For each page without a `breath` config, inject `createBreathConfig(getCharacterLevel(pov), pov)` so the last known level is displayed.

This means you only need to specify `breath` when the level changes.

### Exported symbols

```ts
export const pageConfigs: Record<number, Record<string, any>>
export const defaultPageConfig: Record<string, any>
export function getSpriteConfig(page: number, aspect: string): SpriteConfig
export interface ClockConfig { type: 'clock'; mode; startTime?; middleTimes?; endTime?; speed?; startDate?; middleDates?; endDate?; trigger? }
export interface StaticConfig { type: 'static'; svg: string }
export type SpriteConfig = ClockConfig | StaticConfig | any
```

---

## SpriteRenderers.astro

`src/components/SpriteRenderers.astro` is a `<script is:inline>` block that populates `window.SpriteRenderers`. It contains one render function per sprite type. The caller passes a DOM container element and a resolved config object; each function sets `container.innerHTML` directly.

### Render functions

#### `renderClockSprite(container, config, initClock)`

Renders a `<div>` containing:
- A `<div id="clock-date">` positioned above (top: -16px) for the date display.
- A `<canvas id="clock-canvas" width="72" height="72">` for the clock face.

Then calls `initClock(config)` to start the animation.

#### `renderStaticSprite(container, config, theme, pov, lightCharacterPaths)`

- If `theme === 'light'` **and** `lightCharacterPaths[pov.toLowerCase()]` exists **and** `config.tooltip` is set: renders a `<div class="light-tooltip-container">` containing an `<img class="light-character-icon">` and a `<span class="light-tooltip">`.
- Otherwise: sets `container.innerHTML = config.svg` directly.

Used for: space, light, heart, rage, and any other `type: 'static'` config.

#### `renderBreathSprite(container, config, pov, getLevelName)`

Renders a scrollable echeladder widget:
- Outer frame: `<div class="echeladder-outer-frame">` (blue border, "ECHELADDER" label).
- Inner container: `<div class="echeladder-container">` with a custom scrollbar and content wrapper.
- Content: 50 `<div class="echeladder-rung">` elements (level 50 at top, level 1 at bottom), colored with a seeded random palette per character.
- Scroll buttons (▲ / ▼), a draggable thumb, and wheel scroll are all wired up in JavaScript after render.
- The viewport auto-scrolls to center on `currentLevel`.

#### `renderGodTierSprite(container, config)`

Renders: `<img src="/images/aspects/{aspect}.svg" width="72" height="72">` with a `title` attribute of `"{characterName} - {class} of {aspect}"`.

#### `renderHealthBarSprite(container, config)`

Renders a 72×72 SVG with two `<circle>` elements forming a circular progress ring (stroke `#72EB34`). If `config.showNumbers !== false`, a `<text>` element shows `currentHealth/maxHealth`.

#### `renderGristSprite(container, config, pov, gristOrder, gristIconPaths, setPageGrist, getCharacterGristAtPage, initGristCounter)`

1. Calls `setPageGrist(character, pageNumber, deltas)` to register this page's grist delta.
2. Calls `getCharacterGristAtPage(character, pageNumber)` to compute the cumulative inventory.
3. Filters to grist types with `amount > 0`.
4. If none: sets `container.innerHTML = ''` and returns.
5. Otherwise renders: `<div class="grist-counter"><div class="grist-list">` with one `<div class="grist-item">` per active grist type, each containing an `<img class="grist-icon">` and `<span class="grist-amount">`.
6. Calls `initGristCounter(count)` after the next animation frame.

---

## Data flow: page route to rendered panels

```
read/[id]/[page].astro
  └── MSPALayout.astro (or similar)
        └── SpriteConfig.astro   (imported, provides getSpriteConfig)
              └── pageConfigs[page][aspect]   resolved via getSpriteConfig()
        └── SpriteRenderers.astro  (script sets window.SpriteRenderers)
        └── Per-aspect panel <div>
              └── window.SpriteRenderers.render*() called at runtime
                    └── container.innerHTML = rendered widget HTML
```

The page route passes the current page number and chapter to the layout. The layout calls `getSpriteConfig(page, aspect)` for each of the 12 aspects. The resulting config objects are passed as inline `define:vars` to the script. At page load time, `window.SpriteRenderers.render*()` is called for each panel.

---

## How to configure sprites for a new page

1. Open `src/components/SpriteConfig.astro`.
2. Add a new entry to `pageConfigs` inside the `configs` object:

```ts
42: {
  pov: 'opal',                                          // required
  time: createTimeConfig('default'),                    // UTC clock
  space: createSpaceConfig('LOXAY3'),                   // specific planet
  breath: createBreathConfig(12),                       // set level (optional if unchanged)
  light: createLightConfig('Victor appears'),           // tooltip text
  heart: await createHeartConfig('diamond', 'Victor'),  // quadrant + target
  mind: createMindConfig('worried'),                    // mental state (1-3 words)
  life: createLifeConfig(80, 100),                      // current/max HP
  doom: createDoomConfig([{ name: 'Key', code: 'KEY1' }]),
  blood: createBloodConfig(42, { 'Build': 5, 'Gold': 3 }),
  void: createVoidConfig({ page: 42 }, 'Optional console message.')
  // hope and rage are optional; omit to use defaultPageConfig values
},
```

3. Any aspect not specified falls back to `defaultPageConfig[aspect]`.
4. `breath` can be omitted; the post-processing passes will use the last level set for that `pov`.
5. `heart` requires `await` because it loads an SVG asynchronously.
