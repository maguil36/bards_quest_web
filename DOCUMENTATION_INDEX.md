# Documentation Master Index

**🎯 NEW USER?** Start with **[MASTER_DOCUMENTATION.md](MASTER_DOCUMENTATION.md)** for a guided introduction!

**Last Updated:** 2025
**Version:** 2.0

This index provides a quick overview of all theme system documentation and where to find specific information.

---

## Documentation Hierarchy

```
MASTER_DOCUMENTATION.md (START HERE)
         ↓
High-level overviews + Quick guides
         ↓
    ┌────┴────┬────────────┐
    ↓         ↓            ↓
Theme      Game        Game
System     Themes    Mechanics
    ↓         ↓            ↓
THEME_   GAME_THEME_  SWITCH_GAME_
SYSTEM_  INTEGRATION_ SPECIFICATIONS
MASTER   MASTER       .md
.md      .md
```

---

## Master Documentation Files

### 0. **MASTER_DOCUMENTATION.md** ⭐ START HERE
**High-level entry point with guided introduction**

**Topics Covered:**
- Theme system overview
- Game theme integration overview
- Switch game overview
- Quick guides for common tasks
- Troubleshooting quick fixes
- Navigation to detailed docs

**When to Use:**
- You're new to the system
- You want a high-level understanding
- You need quick guides
- You want to know which detailed doc to read

---

### 1. **THEME_SYSTEM_MASTER.md**
**Complete guide to the theme system**

**Topics Covered:**
- Theme configuration and setup
- Page-specific theme assignment
- User preference system
- Theme transitions (instant, fast, smooth, slow, fade, scroll)
- Theme-to-theme transitions
- Scroll-based transitions
- Priority system and overrule behavior
- File locations and architecture
- Implementation examples
- Troubleshooting

**When to Use:**
- Setting up themes for comic pages
- Understanding how themes work
- Configuring transition types
- Debugging theme issues

---

### 2. **GAME_THEME_INTEGRATION_MASTER.md**
**Complete guide to game theme integration**

**Topics Covered:**
- Character-to-theme mapping
- Dynamic theme changes in games
- Smooth transition implementation
- PostMessage communication
- User preference respect
- Game-specific examples
- Performance considerations
- Troubleshooting game themes

**When to Use:**
- Integrating themes with games
- Adding new characters with themes
- Understanding game-to-page communication
- Debugging game theme changes

---

### 3. **SWITCH_GAME_SPECIFICATIONS.md**
**Complete Switch game specifications and mechanics**

**Topics Covered:**
- Game overview and features
- Core systems (movement, map, interaction)
- Character system and switching mechanics
- Progress tracking and Victor unlock
- Implementation details and file structure
- Testing checklist
- Known issues and solutions

**When to Use:**
- Understanding how the Switch game works
- Implementing game features
- Debugging game mechanics
- Adding new characters or NPCs
- Understanding save system

---

## Quick File Reference

### Configuration Files

| File | Purpose | Edit For |
|------|---------|----------|
| `src/components/ThemeConfig.astro` | Theme configuration | Adding/changing page themes |
| `public/styles.css` | Theme colors and transitions | Changing theme colors |
| `public/games/switch/characters.js` | Character theme mapping | Adding character themes |

### Implementation Files

| File | Purpose | Contains |
|------|---------|----------|
| `public/js/reader.js` | Theme application logic | Theme priority system, transitions |
| `public/js/options.js` | User preference management | Theme selection, localStorage |
| `src/layouts/MSPALayout.astro` | Game theme listener | GAME_THEME_CHANGE handler |
| `public/games/switch/game.js` | Game theme sender | applyCharacterTheme function |

### Page Templates

| File | Purpose |
|------|---------|
| `src/pages/read/[id]/[page].astro` | Comic page template |
| `src/pages/games/switch.astro` | Switch game page |
| `src/layouts/BaseLayout.astro` | Base layout with theme support |

---

## Quick Start Guides

### Adding a Theme to a Page

1. Open `src/components/ThemeConfig.astro`
2. Find the `getDefaultTheme()` function
3. Add your page configuration:
   ```javascript
   if (chapterId === X && pageNumber === Y) {
     return { theme: 'themename' };
   }
   ```
4. Save and test

**See:** THEME_SYSTEM_MASTER.md → Configuration → Example 1

---

### Forcing a Theme (Ignoring User Preferences)

1. Open `src/components/ThemeConfig.astro`
2. Add `overrule: true` to your theme config:
   ```javascript
   if (chapterId === X && pageNumber === Y) {
     return { theme: 'themename', overrule: true };
   }
   ```

**See:** THEME_SYSTEM_MASTER.md → Configuration → Example 2

---

### Adding a Theme-to-Theme Transition

1. Open `src/components/ThemeConfig.astro`
2. Specify both `originalTheme` and `theme`:
   ```javascript
   if (chapterId === X && pageNumber === Y) {
     return { 
       originalTheme: 'time', 
       theme: 'space', 
       transition: 'fast' 
     };
   }
   ```

**See:** THEME_SYSTEM_MASTER.md → Theme Transitions → Theme-to-Theme Transitions

---

### Adding a Character with a Theme

1. Open `public/games/switch/characters.js`
2. Find or add your character object
3. Add the `theme` property:
   ```javascript
   charactername: {
     id: 'charactername',
     name: 'Character Name',
     theme: 'themename',
     // ... other properties
   }
   ```

**See:** GAME_THEME_INTEGRATION_MASTER.md → Integration Examples → Example 1

---

## Available Themes

| Theme | Primary Color | Use Case |
|-------|---------------|----------|
| `space` | None (default) | No colors, black & white |
| `breath` | Cyan/Blue | John Egbert, Tavros |
| `light` | Yellow/Gold | Rose Lalonde, Vriska |
| `time` | Red/Orange | Dave Strider, Aradia |
| `heart` | Orange | Dirk Strider, Nepeta |
| `mind` | Teal | Terezi |
| `hope` | Gold | Jake English, Eridan |
| `rage` | Purple | Gamzee |
| `life` | Pink | Jane Crocker, Feferi |
| `doom` | Yellow/Red | Sollux |
| `blood` | Red | Karkat |
| `void` | Purple | Roxy Lalonde, Equius |

---

## Transition Types

| Type | Duration | Use Case |
|------|----------|----------|
| `instant` | 0s | No animation, immediate change |
| `fast` | 0.5s | Quick page-to-page changes |
| `smooth` | 2s | Default, balanced transition |
| `slow` | 4s | Dramatic story moments |
| `fade` | 2s | Subtle opacity-based transition |
| `scroll` | Dynamic | Theme changes based on scroll position (requires `originalTheme`) |

---

## Common Tasks

### Task: Change a page's theme
**File:** `src/components/ThemeConfig.astro`  
**Doc:** THEME_SYSTEM_MASTER.md → Implementation Examples → Example 1

### Task: Force a theme for a dramatic moment
**File:** `src/components/ThemeConfig.astro`  
**Doc:** THEME_SYSTEM_MASTER.md → Implementation Examples → Example 2

### Task: Create a smooth transition between two themes
**File:** `src/components/ThemeConfig.astro`  
**Doc:** THEME_SYSTEM_MASTER.md → Implementation Examples → Example 3

### Task: Add a new character with a theme
**File:** `public/games/switch/characters.js`  
**Doc:** GAME_THEME_INTEGRATION_MASTER.md → Integration Examples → Example 1

### Task: Change a character's theme
**File:** `public/games/switch/characters.js`  
**Doc:** GAME_THEME_INTEGRATION_MASTER.md → Integration Examples → Example 2

### Task: Debug why a theme isn't applying
**Doc:** THEME_SYSTEM_MASTER.md → Troubleshooting

### Task: Debug why game themes aren't changing
**Doc:** GAME_THEME_INTEGRATION_MASTER.md → Troubleshooting

### Task: Understand the theme priority system
**Doc:** THEME_SYSTEM_MASTER.md → Architecture → Priority System

### Task: Understand how game themes work
**Doc:** GAME_THEME_INTEGRATION_MASTER.md → Architecture → Communication Flow

---

## Priority System Quick Reference

### Normal Pages (overrule: false)
1. User's specific theme choice (highest)
2. Page-specific default theme
3. Space theme (lowest/fallback)

### Forced Pages (overrule: true)
1. Page's forced theme (ALWAYS used)

### Game Pages (when "Default" selected)
1. Active character's theme (changes dynamically)

### Game Pages (when specific theme selected)
1. User's selected theme (maintained throughout)

---

## Troubleshooting Quick Reference

### Theme Not Applying
1. Check `getDefaultTheme()` in `src/components/ThemeConfig.astro`
2. Verify `data-default-theme` attribute on page
3. Check browser console for errors
4. Ensure `public/styles.css` is loaded

### Transition Not Working
1. Verify `data-transition` attribute is set
2. Check CSS transition definitions in `public/styles.css`
3. Ensure not using `transition: 'instant'` unintentionally

### User Preference Not Working
1. Check localStorage is available
2. Verify `mspa:theme` key is set
3. Check if page has `overrule: true`

### Game Theme Not Changing
1. User must have "Default" theme selected in `/options`
2. Character must have `theme` property defined
3. Check browser console for postMessage errors
4. Verify game is in an iframe

---

## Code Locations Quick Reference

### Theme Configuration
- **File:** `src/components/ThemeConfig.astro`
- **Function:** `getDefaultTheme(chapterId, pageNumber)`
- **Lines:** 77-139

### Theme Application (Pages)
- **File:** `public/js/reader.js`
- **Logic:** Theme priority and application
- **Lines:** 1-78

### Theme Application (Games)
- **File:** `src/layouts/MSPALayout.astro`
- **Logic:** GAME_THEME_CHANGE listener
- **Lines:** 48-92

### Character Theme Mapping
- **File:** `public/games/switch/characters.js`
- **Object:** `CHARACTERS`
- **Lines:** 1-300

### Character Theme Sender
- **File:** `public/games/switch/game.js`
- **Function:** `applyCharacterTheme(characterId)`
- **Lines:** 1344-1380

### User Preferences
- **File:** `public/js/options.js`
- **Function:** `applyTheme()`
- **Lines:** 40-67

### Theme Colors
- **File:** `public/styles.css`
- **Selectors:** `html[data-theme="..."]`
- **Lines:** 60-175

---

## Related Files (Legacy/Reference)

These files may contain outdated or duplicate information. Refer to the master docs instead:

- ~~COMPLETE_TRANSITION_IMPLEMENTATION.md~~ → See THEME_SYSTEM_MASTER.md
- ~~GAME_SMOOTH_TRANSITIONS.md~~ → See GAME_THEME_INTEGRATION_MASTER.md
- ~~THEME_QUICK_REFERENCE.md~~ → See this file (DOCUMENTATION_INDEX.md)
- ~~THEME_SYSTEM.md~~ → See THEME_SYSTEM_MASTER.md
- ~~THEME_TO_THEME_TRANSITIONS.md~~ → See THEME_SYSTEM_MASTER.md
- ~~THEME_TRANSITIONS.md~~ → See THEME_SYSTEM_MASTER.md
- ~~THEME_TRANSITIONS_QUICK_REFERENCE.md~~ → See this file (DOCUMENTATION_INDEX.md)
- ~~THEME_TRANSITION_VISUAL_FLOW.md~~ → See THEME_SYSTEM_MASTER.md
- ~~GAME_INTEGRATION.md~~ → See GAME_THEME_INTEGRATION_MASTER.md
- ~~GAME_THEME_INTEGRATION.md~~ → See GAME_THEME_INTEGRATION_MASTER.md
- ~~IMPLEMENTATION_SUMMARY.md~~ → See SWITCH_GAME_SPECIFICATIONS.md
- ~~GAME_STARTING_CHARACTER_CHANGES.md~~ → See SWITCH_GAME_SPECIFICATIONS.md
- ~~MEMORY_BANK.md~~ → See SWITCH_GAME_SPECIFICATIONS.md
- ~~game_memory_bank.md~~ → See SWITCH_GAME_SPECIFICATIONS.md

**Note:** `hidden.md` contains story/puzzle content and should be kept separate.

---

## Documentation Structure

```
Documentation/
├── MASTER_DOCUMENTATION.md ⭐
│   └── High-level entry point with overviews and quick guides
│
├── DOCUMENTATION_INDEX.md (this file)
│   └── Quick reference and navigation
│
├── THEME_SYSTEM_MASTER.md
│   ├── Overview
│   ├── Architecture
│   ├── Configuration
│   ├── Theme Transitions
│   ├── User Preferences
│   ├── File Locations
│   ├── Implementation Examples
│   └── Troubleshooting
│
├── GAME_THEME_INTEGRATION_MASTER.md
│   ├── Overview
│   ├── Architecture
│   ├── Character-Theme Mapping
│   ├── Implementation Flow
│   ├── File Locations
│   ├── Smooth Transitions
│   ├── Integration Examples
│   └── Troubleshooting
│
├── SWITCH_GAME_SPECIFICATIONS.md
│   ├── Game Overview
│   ├── Core Systems
│   ├── Character System
│   ├── Game Mechanics
│   └── Implementation Details
│
├── SCROLL_TRANSITION_FEATURE.md
│   ├── Overview
│   ├── Configuration
│   ├── Implementation Details
│   ├── Performance Considerations
│   ├── Testing
│   └── Use Cases
│
└── GRADIENT_CRAWL_GUIDE.md
    ├── Visual Effect Explanation
    ├── Quick Start Guide
    ├── Use Cases & Examples
    ├── Performance Details
    ├── Testing Checklist
    └── Troubleshooting
```

---

## Getting Help

1. **For theme configuration questions:** See THEME_SYSTEM_MASTER.md
2. **For game integration questions:** See GAME_THEME_INTEGRATION_MASTER.md
3. **For quick answers:** Use this index to find the relevant section
4. **For code examples:** Check the "Implementation Examples" sections in each master doc
5. **For debugging:** Check the "Troubleshooting" sections in each master doc

---

**End of Documentation Index**
