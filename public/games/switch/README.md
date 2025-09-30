# Switch - Character Adventure Game

A top-down 2D character-switching game where players control different characters, interact with NPCs, and ultimately trigger a glitch ending.

## How to Play

### Controls
- **WASD** or **Arrow Keys** - Move your character
- **SPACE** - Interact with NPCs / Advance dialogue
- **ESC** - Close dialogue / Open character menu

### Gameplay
1. Start as **Alexis**
2. Move around the map and find NPCs to talk to
3. Each character has unique dialogue with every NPC
4. Talk to all 7 NPCs as your current character
5. Once you've talked to everyone, you'll be prompted to switch characters
6. Repeat this process with each new character
7. The final character (**Victor**) can only be unlocked after completing all dialogues with all other characters
8. Switching to **Victor** triggers the glitch ending

### Characters (Colors pulled from public/styles.css)
- Alexis (var(--alexis))
- Austine (var(--austine))
- Chloe (var(--chloe))
- Isabell (var(--isabell))
- Nicholas (var(--nicholas))
- Opal (var(--opal))
- Tyson (var(--tyson))
- Victor (var(--victor))

## Customization

### Editing Dialogue
All dialogue is stored in `dialogue.js`. Each NPC has character-specific dialogue keyed by the new character IDs (`alexis`, `austine`, `chloe`, `isabell`, `nicholas`, `opal`, `tyson`, `victor`).

```javascript
const DIALOGUES = {
    npc1: {
        name: 'The Wanderer',
        dialogues: {
            alexis: [
                "First line of dialogue...",
                "Second line...",
                "Third line...",
                "Final line..."
            ],
            austine: [
                "Different dialogue for Austine...",
                // ... more lines
            ]
            // ... other characters
        }
    }
    // ... other NPCs
};
```

### Adding Music
Place audio files in the `audio/` directory. The game maps new character IDs to existing audio asset names:
- Alexis -> `breath.mp3`
- Austine -> `light.mp3`
- Chloe -> `time.mp3`
- Isabell -> `space.mp3`
- Nicholas -> `heart.mp3`
- Opal -> `mind.mp3`
- Tyson -> `hope.mp3`
- Victor -> `rage.mp3`

The game will automatically load and play character-specific music when switching.

### Customizing Characters
Edit `characters.js` to modify character properties. Colors are read from site CSS variables at runtime:

```javascript
const color = getComputedStyle(document.documentElement).getPropertyValue('--alexis');
```

## Technical Details

### File Structure
```
public/games/switch/
├── index.html          # Main game file
├── game.js            # Core game logic
├── characters.js      # Character data; reads CSS vars --alexis, --austine, ...
├── dialogue.js        # Dialogue system and data (keys match new IDs)
├── audio.js           # Audio management and theme map
├── sprites/           # Character and NPC sprites (placeholder)
├── audio/             # Music files (add your own)
└── README.md         # This file
```

### Features Implemented
- ✅ Character movement with WASD/Arrow keys
- ✅ Camera following with map edge behavior (Pokemon-style)
- ✅ 8 characters with site-synced colors (CSS variables)
- ✅ Character-specific dialogue system
- ✅ NPC interaction system
- ✅ Character switching mechanics
- ✅ Progress tracking and save system
- ✅ Character-specific background music
- ✅ Large portrait display during dialogue
- ✅ Glitch ending animation
- ✅ Auto-redirect after glitch ending
- ✅ Theme tint + dynamic accent color set from current character

### Browser Compatibility
- Modern browsers with HTML5 Canvas support
- Chrome, Firefox, Safari, Edge
- Mobile browsers (touch controls not implemented)

### Development Notes
- Sprites are currently placeholder colored rectangles
- Audio files are not included (add your own music)
- The glitch ending shows an alert instead of redirecting (customize as needed)
- Game state is saved to localStorage

## Adding Real Assets

### Sprites
Replace the placeholder sprite system in `game.js` with real image loading.

### Audio
Add MP3 or OGG files to the `audio/` directory as noted above.

### Backgrounds
Replace the procedural background with actual artwork by modifying `createBackgroundSprite()` in `game.js`.
