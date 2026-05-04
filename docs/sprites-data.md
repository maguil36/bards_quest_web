# Sprites Data

Each file in `src/sprites/` defines the data model and factory function for one aspect sprite. All files export a default sprite constant and a `create*Config` factory.

---

## `src/sprites/blood.ts` — Grist Counter

Tracks cumulative item inventory across pages using page-based deltas.

### Exports

```ts
export type GristType =
  'Build' | 'Amber' | 'Amethyst' | 'Artifact' | 'Caulk' | 'Chalk' | 'Cobalt' |
  'Diamond' | 'Garnet' | 'Gold' | 'Iodine' | 'Marble' | 'Mercury' | 'Quartz' |
  'Ruby' | 'Rust' | 'Shale' | 'Sulfur' | 'Tar' | 'Uranium' | 'Zillium'
```

```ts
export const gristOrder: GristType[]
```
21-element array defining the canonical display order.

```ts
export const gristIconPaths: Record<GristType, string>
```
Maps each `GristType` to its icon path under `/images/blood/`. Example: `'Build' → '/images/blood/Build.webp'`.

```ts
export interface GristDelta { [gristType: string]: number }

export interface PageGristConfig {
  character: string;
  pageNumber: number;
  deltas: GristDelta;
}

export interface BloodGristConfig {
  type: 'grist';
  character: string;
  pageNumber: number;
  deltas: GristDelta;
}
```

```ts
export function setPageGrist(character: string, pageNumber: number, deltas: GristDelta): void
```
Registers the grist delta for one character on one page into a module-level `Map<string, Map<number, GristDelta>>`.

```ts
export function getCharacterGristAtPage(character: string, pageNumber: number): Record<GristType, number>
```
Accumulates all deltas for `character` up through and including `pageNumber`, returning the running totals.

```ts
export function createBloodConfig(
  pageNumber: number,
  deltas: GristDelta,
  character?: string
): BloodGristConfig
```
- `character` defaults to `''` (renderer will use the page `pov`).
- Positive `deltas` values add grist; negative values subtract.

```ts
export const bloodSprite: BloodGristConfig  // { type: 'grist', character: '', pageNumber: 0, deltas: {} }
```

### Adding a new grist type

1. Add the name to the `GristType` union.
2. Add it to `gristOrder` at the desired position.
3. Add the icon path to `gristIconPaths`.
4. Place the icon file at the declared path under `public/images/blood/`.

---

## `src/sprites/rage.ts` — Strife Specibus

Weapon type display for the rage aspect panel.

### Exports

```ts
export interface RageSpecibusConfig {
  type: 'static';
  svg: string;
  weaponName?: string;
}
```

```ts
export const rageWeaponPaths: Record<string, string>
```
Maps weapon names to SVG paths under `/images/rage/`. Keys: `sword`, `hammer`, `spear`, `bow`, `axe`, `mace`, `staff`, `dagger`.

```ts
export const characterWeapons: Record<string, string>
```
Maps 21 character names (lowercase) to their weapon type. Covered characters: `alexis`, `austine`, `chloe`, `isabela`, `nicholas`, `opal`, `tyson`, `victor`, `alice`, `audrey`, `clayton`, `irene`, `nix`, `nix2`, `octavian`, `trenton`, `vettia`, `okwos`, `gwenhas`, `dhesas`, `redacted`.

```ts
export const rageSprite: RageSpecibusConfig  // { type: 'static', svg: '', weaponName: '' }

export function createRageConfig(weaponName?: string): RageSpecibusConfig
```
If `weaponName` is omitted, the renderer resolves it automatically from `characterWeapons[pov]`.

### Adding a new weapon type

1. Add an entry to `rageWeaponPaths` with the weapon name and icon path.
2. Assign it to the relevant character(s) in `characterWeapons`.
3. Place the SVG file at the declared path under `public/images/rage/`.

---

## `src/sprites/light.ts` — Character Icon Tooltip

Shows the POV character's icon image with a hover tooltip. Only visible when the active theme is `light`.

### Exports

```ts
export interface LightTooltipConfig {
  type: 'static';
  svg: string;
  tooltip?: string;
}
```

```ts
export const lightCharacterPaths: Record<string, string>
```
Maps 21 character names (lowercase) to SVG icon paths under `/images/light/`. Covered: `alexis`, `austine`, `chloe`, `isabela`, `nicholas`, `opal`, `tyson`, `victor`, `alice`, `audrey`, `clayton`, `irene`, `nix`, `nix2`, `octavian`, `trenton`, `vettia`, `okwos`, `gwenhas`, `dhesas`, `redacted`.

```ts
export const lightSprite: LightTooltipConfig  // { type: 'static', svg: '', tooltip: '' }

export function createLightConfig(tooltip?: string): LightTooltipConfig
```
The renderer resolves the character image automatically from `lightCharacterPaths[pov]`. You only specify the tooltip text.

### Adding a new character

1. Add an entry to `lightCharacterPaths` with the character name (lowercase) and icon path.
2. Place the SVG file at the declared path under `public/images/light/`.

---

## `src/sprites/breath.ts` — Echeladder

Character level/rank progression system with 50 named tiers per character.

### Exports

```ts
export interface BreathConfig extends SpriteConfig {
  type: 'breath';
  currentLevel: number;
  pov: string;
}
```

```ts
export const characterLevelNames: Record<string, string[]>
```
Maps character names (lowercase) to a 50-element array of level title strings. Defined for: `alexis`, `austine`, `chloe`, `isabela`, `nicholas`, `opal`, `tyson`, `victor`, `nix`, `alice`, `audrey`, `clayton`, `irene`, `trenton`, `vettia`, `octavian`, `okwos`, `gwenhas`, `redacted`, `dhesas`, plus `default` (generic "Level 1" through "Level 50").

```ts
export function setCharacterLevel(character: string, level: number): void
```
Writes to a module-level `characterLevels` record (lowercased key).

```ts
export function getCharacterLevel(character: string): number
```
Returns stored level or `1` if not set.

```ts
export function getLevelName(character: string, level: number): string
```
Returns `characterLevelNames[character][level - 1]`, falling back to the `default` array or `"Level {level}"`.

```ts
export function createBreathConfig(levelOrPov: number | string, pov?: string): BreathConfig
```
Two call signatures:
- `createBreathConfig(5)` — explicit level, `pov` set via second arg or left `''`.
- `createBreathConfig('victor')` — string pov, level looked up from `getCharacterLevel`.

Calling with a numeric level and a pov string also calls `setCharacterLevel(pov, level)`.

```ts
export const breathSprite: (config: BreathConfig) => string  // returns ''
```

### Adding level names for a new character

Add an entry to `characterLevelNames` keyed to the character's lowercase name, with exactly 50 strings. The last entry should follow the pattern `CLASSPECT ASCENDANT`.

---

## `src/sprites/space.ts` — Planet Image

Displays a static planet or location SVG for the space aspect panel.

### Exports

```ts
export type SpaceImageName =
  'Derse' | 'Prospit' | 'Skaia' | 'Earth' |
  'LOXAY1' | 'LOXAY2' | 'LOXAY3' | 'LOXAY4' | 'LOXAY5' |
  'LOXAY6' | 'LOXAY7' | 'LOXAY8' | 'LOXAY9' | 'NaN'
```

```ts
export const spaceSprite: { type: 'static'; svg: string }
// Default black circle SVG
```

```ts
export interface PlanetData { name: string; description: string }

export const characterPlanets: Record<string, PlanetData>
```
Maps 21 character names (lowercase) to their land name and lore description. Includes `default` fallback.

```ts
export function createSpaceConfig(imageName: SpaceImageName): { type: 'static'; svg: string }
```
Returns a static config whose `svg` is an inline `<svg>` containing an `<image href="...">` pointing at `/images/space/{name}.svg`. Falls back to `NaN` (black circle) if the name is unknown.

### Adding a new location

1. Add the name to the `spaceImagePaths` record inside the file with its path.
2. Add the name to the `SpaceImageName` type.
3. Place the SVG at the declared path under `public/images/space/`.

---

## `src/sprites/time.ts` — Animated Clock

Defines the configuration schema for the time aspect clock widget.

### Exports

```ts
export type TimeValue = string   // 'HH:MM:SS' | 'random' | 'NaN' | '= X' | '+ X' | '> X' | '> random' | '> NaN'
export type DateValue = string   // 'YYYY:MM:DD' | 'random' | 'NaN' | '= X' | '+ X' | '> X' | '> random' | '> NaN'

export interface TimeClockConfig {
  type: 'clock';
  mode: 'default' | 'loop' | 'final';
  startTime?: TimeValue;
  startDate?: DateValue;
  middleTimes?: TimeValue[];
  middleDates?: DateValue[];
  endTime?: TimeValue;
  endDate?: DateValue;
  speed?: number;
  trigger?: 'automatic' | 'click' | 'game';
}
```

```ts
export const timeSprite: TimeClockConfig  // { type: 'clock', mode: 'default' }

export function createTimeConfig(
  mode: 'default' | 'loop' | 'final',
  startTime?: TimeValue,
  endTime?: TimeValue,
  options?: {
    startDate?: DateValue;
    middleTimes?: TimeValue[];
    middleDates?: DateValue[];
    endDate?: DateValue;
    speed?: number;
    trigger?: 'automatic' | 'click' | 'game';
  }
): TimeClockConfig
```

- `mode: 'default'` — live UTC clock; `startTime` and `endTime` are ignored.
- `mode: 'loop'` — cycles start → middles → end → start.
- `mode: 'final'` — plays once and stops at end.
- `speed` defaults to `1`; not stored if equal to `1`.
- `trigger` defaults to `'automatic'`; not stored if `'automatic'`.

---

## `src/sprites/mind.ts` — Mental State Tooltip

### Exports

```ts
export interface MindTooltipConfig { type: 'tooltip'; mentalState: string }

export const mindSprite  // { type: 'tooltip', mentalState: 'focused' }

export function createMindConfig(mentalState: string): MindTooltipConfig
```

`mentalState` should be 1–3 words (e.g., `'thinking...'`, `'confused'`, `'joyful'`).

---

## `src/sprites/doom.ts` — Inventory / Captchalogue

### Exports

```ts
export interface DoomInventoryItem { name: string; code?: string }

export interface DoomInventoryConfig {
  type: 'inventory';
  items: DoomInventoryItem[];
  maxSlots?: number;
}

export const doomSprite  // { type: 'inventory', items: [], maxSlots: 8 }

export function createDoomConfig(
  items: DoomInventoryItem[],
  maxSlots: number = 8
): DoomInventoryConfig
```

Pass an empty array for an empty inventory. `code` is an optional captchalogue code string.

---

## `src/sprites/life.ts` — Health Bar

### Exports

```ts
export interface LifeHealthConfig {
  type: 'healthbar';
  currentHealth: number;
  maxHealth: number;
  showNumbers?: boolean;
}

export const lifeSprite  // { type: 'healthbar', currentHealth: 100, maxHealth: 100, showNumbers: true }

export function createLifeConfig(
  currentHealth: number,
  maxHealth: number = 100,
  showNumbers: boolean = true
): LifeHealthConfig
```

---

## `src/sprites/hope.ts` — God Tier Symbol

### Exports

```ts
export interface HopeGodTierConfig {
  type: 'godtier';
  characterName: string;
  aspect: string;
  class: string;
}
```

```ts
export const characterAspects: Record<string, string>
```
Maps 21 character names (lowercase) to their aspect string. Note: this mapping reflects the hope.ts file's internal assignment and may differ from `CHARACTER_ASPECTS` in the game constants.

```ts
export const hopeSprite  // { type: 'godtier', characterName: 'Unknown', aspect: 'hope', class: 'page' }

export function createHopeConfig(pov?: string): HopeGodTierConfig
```
Looks up `characterAspects[pov.toLowerCase()]`; defaults to aspect `'hope'` and class `'page'`.

---

## `src/sprites/heart.ts` — Relationship Quadrant

### Exports

```ts
export type QuadrantType = 'heart' | 'diamond' | 'spade' | 'club' | 'none'

export interface HeartQuadrantConfig {
  type: 'static';
  svg: string;
  quadrant: QuadrantType;
  targetName?: string;
}

export const heartQuadrantPaths: Record<QuadrantType, string>
// '/images/heart/{quadrant}.svg' for each of the 5 types
```

```ts
export const heartSprite  // { type: 'static', svg: <heart SVG>, quadrant: 'heart' }

export async function createHeartConfig(
  quadrant: QuadrantType,
  targetName?: string
): Promise<HeartQuadrantConfig>
```
Async because it builds an inline SVG string. Throws if `quadrant` is not a valid key.

---

## `src/sprites/void.ts` — Hidden Metadata

### Exports

```ts
export interface VoidMetadataConfig {
  type: 'hidden';
  metadata: Record<string, any>;
  message?: string;
}

export const voidSprite  // { type: 'hidden', metadata: {}, message: undefined }

export function createVoidConfig(metadata: Record<string, any>, message?: string): VoidMetadataConfig
```

The `message` string is encoded with ROT13 before storage. Not rendered visibly; messages are logged to the browser console.

---

## `src/sprites/default.ts` — Fallback SVG

### Exports

```ts
export const defaultSprite: string
```

An inline SVG string: a 72×72 grey radial-gradient circle with three darker inner circles. Used when no config is found for a page/aspect combination.

---

## Summary table

| File | Default export | Factory | Config type field |
|------|---------------|---------|------------------|
| `blood.ts` | `bloodSprite` | `createBloodConfig` | `'grist'` |
| `rage.ts` | `rageSprite` | `createRageConfig` | `'static'` |
| `light.ts` | `lightSprite` | `createLightConfig` | `'static'` |
| `breath.ts` | `breathSprite` (fn) | `createBreathConfig` | `'breath'` |
| `space.ts` | `spaceSprite` | `createSpaceConfig` | `'static'` |
| `time.ts` | `timeSprite` | `createTimeConfig` | `'clock'` |
| `mind.ts` | `mindSprite` | `createMindConfig` | `'tooltip'` |
| `doom.ts` | `doomSprite` | `createDoomConfig` | `'inventory'` |
| `life.ts` | `lifeSprite` | `createLifeConfig` | `'healthbar'` |
| `hope.ts` | `hopeSprite` | `createHopeConfig` | `'godtier'` |
| `heart.ts` | `heartSprite` | `createHeartConfig` (async) | `'static'` |
| `void.ts` | `voidSprite` | `createVoidConfig` | `'hidden'` |
| `default.ts` | `defaultSprite` (string) | — | — |
