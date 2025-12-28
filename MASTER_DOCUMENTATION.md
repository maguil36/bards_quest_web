# Theme & Game System Documentation

**Welcome!** This is your starting point for understanding the theme system and Switch game.

---

## 🎯 What Do You Want to Do?

### I want to understand the theme system
**Start here:** [Theme System Overview](#theme-system-overview) below, then dive into [THEME_SYSTEM_MASTER.md](THEME_SYSTEM_MASTER.md)

### I want to add themes to comic pages
**Quick guide:** [Adding Page Themes](#quick-guide-adding-page-themes) below, then see [THEME_SYSTEM_MASTER.md](THEME_SYSTEM_MASTER.md) for details

### I want to understand how game themes work
**Start here:** [Game Theme Integration Overview](#game-theme-integration-overview) below, then dive into [GAME_THEME_INTEGRATION_MASTER.md](GAME_THEME_INTEGRATION_MASTER.md)

### I want to add or modify game characters
**Quick guide:** [Adding Character Themes](#quick-guide-adding-character-themes) below, then see [GAME_THEME_INTEGRATION_MASTER.md](GAME_THEME_INTEGRATION_MASTER.md)

### I want to understand the Switch game mechanics
**Start here:** [Switch Game Overview](#switch-game-overview) below, then dive into [SWITCH_GAME_SPECIFICATIONS.md](SWITCH_GAME_SPECIFICATIONS.md)

### I need a quick reference
**Go to:** [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) - Quick reference for everything

### Something isn't working
**Go to:** [Troubleshooting](#troubleshooting) below, then check the relevant master doc

---

## 📚 Documentation Structure

```
START HERE → MASTER_DOCUMENTATION.md (this file)
                    ↓
        ┌───────────┼───────────┐
        ↓           ↓           ↓
   Theme System  Game Themes  Game Mechanics
        ↓           ↓           ↓
THEME_SYSTEM_  GAME_THEME_   SWITCH_GAME_
  MASTER.md    INTEGRATION_  SPECIFICATIONS
                MASTER.md        .md
```

**Quick Reference:** [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)

---

## Theme System Overview

### What It Does

The theme system allows you to:
- Assign color themes to individual comic pages
- Let users choose their preferred theme
- Force themes for dramatic story moments
- Create smooth transitions between themes
- Integrate themes with games

### Available Themes

12 color themes + default:

| Theme | Color | Use For |
|-------|-------|---------|
| `space` | None (B&W) | Default, no colors |
| `breath` | Cyan | John, Tavros |
| `light` | Orange | Rose, Vriska |
| `time` | Red | Dave, Aradia |
| `heart` | Pink | Dirk, Nepeta |
| `mind` | Teal | Terezi |
| `hope` | Gold | Jake, Eridan |
| `rage` | Purple | Gamzee |
| `life` | Pink | Jane, Feferi |
| `doom` | Yellow/Red | Sollux |
| `blood` | Red | Karkat |
| `void` | Purple | Roxy, Equius |

### How It Works

1. **Page Configuration** - Define themes in `src/components/ThemeConfig.astro`
2. **User Choice** - Users select theme preference in `/options`
3. **Priority System** - Page forced themes > User choice > Page default > Space
4. **Smooth Transitions** - CSS transitions between theme changes

**Learn more:** [THEME_SYSTEM_MASTER.md](THEME_SYSTEM_MASTER.md)

---

## Quick Guide: Adding Page Themes

### Step 1: Open the Config File
```
src/components/ThemeConfig.astro
```

### Step 2: Find the Function
Look for `getDefaultTheme(chapterId, pageNumber)`

### Step 3: Add Your Theme
```javascript
// Basic theme (user can override)
if (chapterId === 1 && pageNumber === 5) {
  return { theme: 'breath' };
}

// Forced theme (ignores user preference)
if (chapterId === 2 && pageNumber === 10) {
  return { theme: 'rage', overrule: true };
}

// Smooth transition between themes
if (chapterId === 1 && pageNumber === 8) {
  return {
    originalTheme: 'time',
    theme: 'space',
    transition: 'fast'
  };
}

// Scroll-based transition (changes as you scroll)
if (chapterId === 5 && pageNumber === 1) {
  return {
    originalTheme: 'breath',  // Theme at top of page
    theme: 'time',            // Theme at bottom of page
    transition: 'scroll'      // Gradient crawls up as you scroll
  };
}
```

**How scroll works:** A gradient overlay crawls up from the bottom as you scroll. At 0% scroll, you see the original theme. As you scroll down, the target theme's color gradually covers more of the screen from bottom to top. At 90% scroll, the theme fully switches.
```

### Step 4: Save and Test
- Save the file
- Navigate to the page
- Theme should apply automatically

**Need more details?** See [THEME_SYSTEM_MASTER.md](THEME_SYSTEM_MASTER.md) → Configuration section

---

## Game Theme Integration Overview

### What It Does

Games (like the Switch game) can dynamically change the parent page's theme based on the active character:

- **Character switches** → Theme changes
- **Smooth transitions** → No jarring flashes
- **Respects user preferences** → Only works if user has "Default" selected
- **PostMessage communication** → Secure iframe-to-parent messaging

### How It Works

```
Player switches character in game
         ↓
Game sends theme change message
         ↓
Parent page receives message
         ↓
Theme smoothly transitions
         ↓
Page colors match character
```

### Character-Theme Mapping

Each character has an associated theme:

| Character | Theme | Color |
|-----------|-------|-------|
| Opal (starting) | space | Light Blue |
| Character 2 | breath | Blue |
| Character 3 | light | Orange |
| Character 4 | time | Red |
| Character 5 | heart | Pink |
| Character 6 | mind | Teal |
| Character 7 | hope | Gold |
| Character 8 | rage | Cyan |
| Victor (final) | ??? | ??? |

**Learn more:** [GAME_THEME_INTEGRATION_MASTER.md](GAME_THEME_INTEGRATION_MASTER.md)

---

## Quick Guide: Adding Character Themes

### Step 1: Open the Characters File
```
public/games/switch/characters.js
```

### Step 2: Find Your Character
Look for the `CHARACTERS` object

### Step 3: Add the Theme Property
```javascript
charactername: {
  id: 'charactername',
  name: 'Character Name',
  theme: 'breath',  // ← Add this line
  sprite: 'character.png',
  // ... other properties
}
```

### Step 4: Save and Test
- Save the file
- Play the game
- Switch to the character
- Theme should change automatically (if user has "Default" selected)

**Need more details?** See [GAME_THEME_INTEGRATION_MASTER.md](GAME_THEME_INTEGRATION_MASTER.md) → Integration Examples

---

## Switch Game Overview

### What It Is

A top-down 2D character-switching game where players:
- Control different characters
- Interact with NPCs
- Complete dialogues
- Switch between characters
- Unlock the final character (Victor)
- Trigger a glitch ending

### Key Mechanics

**Starting Character:** Opal (Space theme)

**Switching Rules:**
- Must complete ALL required dialogues for current character
- "Remaining to progress: 0" required
- Switch prompt appears after last dialogue
- Victor unlocks only after all 42 interactions

**Progress Tracking:**
- Each character has required NPC conversations
- Counter shows remaining dialogues
- Global progress tracked for Victor unlock

**Theme Integration:**
- Theme changes when switching characters
- Only works if user has "Default" theme selected
- Smooth 2-second transitions

### Game Flow

```
Start as Opal (Space theme)
         ↓
Talk to NPCs (counter decreases)
         ↓
Complete all dialogues (Remaining: 0)
         ↓
Switch prompt appears
         ↓
Select new character
         ↓
Theme changes to match character
         ↓
Repeat for each character
         ↓
Victor unlocks (after 42 interactions)
         ↓
Glitch ending sequence
```

**Learn more:** [SWITCH_GAME_SPECIFICATIONS.md](SWITCH_GAME_SPECIFICATIONS.md)

---

## Troubleshooting

### Theme Not Applying to Page

**Check:**
1. Is theme defined in `src/components/ThemeConfig.astro`?
2. Does user have "Default" selected in `/options`?
3. Is page using `overrule: true` somewhere else?
4. Check browser console for errors

**Fix:** See [THEME_SYSTEM_MASTER.md](THEME_SYSTEM_MASTER.md) → Troubleshooting

---

### Game Theme Not Changing

**Check:**
1. Does user have "Default" theme selected in `/options`?
2. Does character have `theme` property in `characters.js`?
3. Is game in an iframe?
4. Check browser console for postMessage errors

**Fix:** See [GAME_THEME_INTEGRATION_MASTER.md](GAME_THEME_INTEGRATION_MASTER.md) → Troubleshooting

---

### Can't Switch Characters in Game

**Check:**
1. Have you completed all required dialogues?
2. Does "Remaining to progress" show 0?
3. Are you trying to switch to Victor too early?
4. Check browser console for errors

**Fix:** See [SWITCH_GAME_SPECIFICATIONS.md](SWITCH_GAME_SPECIFICATIONS.md) → Known Issues

---

## Key Files Quick Reference

### Theme Configuration
- **`src/components/ThemeConfig.astro`** - Define page themes here
- **`public/styles.css`** - Theme colors and styles

### Game Files
- **`public/games/switch/characters.js`** - Character themes and data
- **`public/games/switch/game.js`** - Game logic and theme sender

### Integration Files
- **`src/layouts/MSPALayout.astro`** - Game theme listener
- **`public/js/reader.js`** - Page theme application

### User Preferences
- **`public/js/options.js`** - Theme selection
- **`src/pages/options.astro`** - Options page

---

## Complete Documentation

### Master Documents

1. **[THEME_SYSTEM_MASTER.md](THEME_SYSTEM_MASTER.md)** (~450 lines)
   - Complete theme system guide
   - Configuration, transitions, examples
   - User preferences, troubleshooting

2. **[GAME_THEME_INTEGRATION_MASTER.md](GAME_THEME_INTEGRATION_MASTER.md)** (~650 lines)
   - Complete game integration guide
   - Character mapping, communication flow
   - Smooth transitions, examples

3. **[SWITCH_GAME_SPECIFICATIONS.md](SWITCH_GAME_SPECIFICATIONS.md)** (~550 lines)
   - Complete game mechanics guide
   - Systems, characters, implementation
   - Testing, troubleshooting

4. **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** (~450 lines)
   - Quick reference for everything
   - Common tasks, file locations
   - Code snippets, troubleshooting

5. **[SCROLL_TRANSITION_FEATURE.md](SCROLL_TRANSITION_FEATURE.md)** (~400 lines)
   - Scroll-based theme transition guide
   - Implementation details and examples
   - Testing and troubleshooting

6. **[GRADIENT_CRAWL_GUIDE.md](GRADIENT_CRAWL_GUIDE.md)** (~350 lines)
   - Gradient crawl user guide
   - How scroll transitions work visually
   - Customization and examples

### Supporting Documents

- **[DOCUMENTATION_SUMMARY.md](DOCUMENTATION_SUMMARY.md)** - What was consolidated and why
- **[FILES_TO_DELETE.md](FILES_TO_DELETE.md)** - Legacy files cleanup guide

---

## Getting Started Checklist

### For Theme System
- [ ] Read [Theme System Overview](#theme-system-overview) above
- [ ] Try [Quick Guide: Adding Page Themes](#quick-guide-adding-page-themes)
- [ ] Dive into [THEME_SYSTEM_MASTER.md](THEME_SYSTEM_MASTER.md) for details
- [ ] Check [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) for quick reference

### For Game Integration
- [ ] Read [Game Theme Integration Overview](#game-theme-integration-overview) above
- [ ] Try [Quick Guide: Adding Character Themes](#quick-guide-adding-character-themes)
- [ ] Dive into [GAME_THEME_INTEGRATION_MASTER.md](GAME_THEME_INTEGRATION_MASTER.md) for details
- [ ] Test theme changes in the game

### For Game Mechanics
- [ ] Read [Switch Game Overview](#switch-game-overview) above
- [ ] Dive into [SWITCH_GAME_SPECIFICATIONS.md](SWITCH_GAME_SPECIFICATIONS.md) for details
- [ ] Review implementation phases
- [ ] Check testing checklist

---

## Need Help?

1. **Quick answer?** → [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)
2. **Theme system?** → [THEME_SYSTEM_MASTER.md](THEME_SYSTEM_MASTER.md)
3. **Game themes?** → [GAME_THEME_INTEGRATION_MASTER.md](GAME_THEME_INTEGRATION_MASTER.md)
4. **Game mechanics?** → [SWITCH_GAME_SPECIFICATIONS.md](SWITCH_GAME_SPECIFICATIONS.md)
5. **Still stuck?** → Check the Troubleshooting sections in each master doc

---

**Last Updated:** 2025  
**Version:** 2.0  
**Status:** ✅ Complete and Verified
