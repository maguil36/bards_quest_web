# Game Integration System

This document explains how to add games to comic pages in the Bards Quest site.

## How It Works

The game system allows you to replace the standard page image with an interactive HTML5 game on specific pages. Games are embedded using iframes and can communicate with the parent page for navigation.

## Character Names and Colors

The Switch game and any future games should reference character names and colors from the site CSS variables defined in `public/styles.css`.

The 8 characters and their CSS variables are:
- --alexis: #6600ff; /* tr */
- --austine: #5db473; /* mm */
- --chloe: #9cff86; /* rl */
- --isabell: #d85221; /* sb */
- --nicholas: #fa8e00; /* pl */
- --opal: #d5ffe6; /* ks */
- --tyson: #434c00; /* pd */
- --victor: #ff8eb4; /* bt */

Games can read these values at runtime via `getComputedStyle(document.documentElement).getPropertyValue('--alexis')` and so on. The Switch game already does this and sets the UI accent color to the current character’s color.

## Adding a Game to a Page

### 1. Configure the Page

Edit `src/utils/pageUtils.ts` and add your page to the `gamePages` object in the `getGameConfig` function:

```typescript
const gamePages: Record<string, GameConfig> = {
  // Chapter 1, Page 12 - Switch Character Game
  '1-12': {
    gameType: 'switch',
    seed: 42, // Fixed seed for consistent experience
    width: 800,
    height: 600
  },
  // Add your new game here
  // '2-5': {
  //   gameType: 'puzzle-game',
  //   seed: 123,
  //   width: 600,
  //   height: 400
  // },
};
```

### 2. Create the Game HTML File

Create your game as an HTML file in the `public/games/` directory:

- `public/games/switch/index.html` - The character switching game
- `public/games/your-game.html` - Your new game entry point

### 3. Update Game File Mapping

In `src/components/GameEmbed.astro`, add your game to the `gameFiles` object:

```typescript
const gameFiles = {
  'switch': '/games/switch/index.html',
  // 'puzzle-game': '/games/puzzle-game.html', // example
};
```

## Game Communication

Games can communicate with the parent page using `postMessage`:

```javascript
// In your game HTML file
window.parent.postMessage('gameComplete', '*');
```

This will trigger navigation to the next comic page.

## Game Parameters

Games receive these URL parameters:
- `seed` - Random seed for consistent gameplay
- `chapter` - Current chapter ID
- `page` - Current page number

Access them in your game:
```javascript
const urlParams = new URLSearchParams(window.location.search);
const seed = urlParams.get('seed');
const chapter = urlParams.get('chapter');
const page = urlParams.get('page');
```

## Example: Character Switch Game

The character switch game is available on Chapter 1, Page 12:
- URL: `http://localhost:4321/read/1/12`
- Direct game: `http://localhost:4321/games/switch/index.html`

Characters used by the Switch game (all colors pulled from `public/styles.css`):
- Alexis, Austine, Chloe, Isabell, Nicholas, Opal, Tyson, Victor

The game sets the page theme tint using `data-theme` while also setting the `--accent` color dynamically to the current character color.

## File Structure

```
public/
  games/
    switch/                  # Switch game directory
      index.html
      game.js
      characters.js          # Pulls colors via CSS variables
      dialogue.js
      audio.js
src/
  components/
    GameEmbed.astro         # Game embedding component
  utils/
    pageUtils.ts            # Game configuration
  pages/
    read/
      [id]/
        [page].astro        # Main page renderer
```

## Testing

1. Start the dev server: `npm run dev`
2. Navigate to a page with a game: `http://localhost:4321/read/1/12`
3. The game should load in place of the normal page image
4. Complete the game to test navigation to the next page
