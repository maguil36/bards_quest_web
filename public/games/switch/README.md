# Switch - Character Adventure Game

A top-down 2D character-switching game where players control different characters, interact with NPCs, and ultimately trigger a glitch ending.

## How to Play

### Controls
- **WASD** or **Arrow Keys** - Move your character
- **SPACE** - Interact with NPCs / Advance dialogue
- **ESC** - Close dialogue / Open character menu

### Gameplay
1. Start as the **Breath** character (blue)
2. Move around the map and find NPCs to talk to
3. Each character has unique dialogue with every NPC
4. Talk to all 7 NPCs as your current character
5. Once you've talked to everyone, you'll be prompted to switch characters
6. Repeat this process with each new character
7. The final character (**Rage**) can only be unlocked after completing all dialogues with all other characters
8. Switching to **Rage** triggers the glitch ending

### Characters (Based on CSS Themes)
1. **Breath** (Blue) - Starting character, master of wind and freedom
2. **Light** (Orange) - Bright and optimistic, bringer of illumination  
3. **Time** (Red) - Mysterious controller of time's flow
4. **Space** (Light Blue) - Cosmic character who understands existence
5. **Heart** (Pink) - Passionate character driven by emotion
6. **Mind** (Teal) - Logical character who values knowledge
7. **Hope** (Gold) - Optimistic character who believes in better futures
8. **Rage** (Cyan) - Final character, triggers glitch ending

### NPCs
- **The Wanderer** - Ancient traveler with wisdom from the winds
- **The Guardian** - Protector of thresholds and boundaries
- **The Sage** - Keeper of knowledge and wisdom
- **The Merchant** - Trader in goods and possibilities
- **The Oracle** - Seer of futures and prophecies
- **The Keeper** - Maintainer of records and memories
- **The Seeker** - Searcher for truth and understanding

## Customization

### Editing Dialogue
All dialogue is stored in `dialogue.js`. Each NPC has character-specific dialogue:

```javascript
const DIALOGUES = {
    npc1: { // The Wanderer
        name: 'The Wanderer',
        dialogues: {
            breath: [
                "First line of dialogue...",
                "Second line...",
                "Third line...",
                "Final line..."
            ],
            light: [
                "Different dialogue for Light character...",
                // ... more lines
            ]
            // ... other characters
        }
    }
    // ... other NPCs
};
```

### Adding Music
Place audio files in the `audio/` directory:
- `breath.mp3` - Music for Breath character
- `light.mp3` - Music for Light character
- etc.

The game will automatically load and play character-specific music when switching.

### Customizing Characters
Edit `characters.js` to modify character properties:

```javascript
const CHARACTERS = {
    breath: {
        id: 'breath',
        name: 'Breath',
        theme: 'breath',
        color: '#007eb4',
        // ... other properties
    }
    // ... other characters
};
```

### Modifying NPCs
Edit the `NPCS` array in `characters.js` to change NPC positions, names, or colors:

```javascript
const NPCS = [
    {
        id: 'npc1',
        name: 'The Wanderer',
        position: { x: 150, y: 150 },
        color: '#888888'
    }
    // ... other NPCs
];
```

## Technical Details

### File Structure
```
public/games/switch/
├── index.html          # Main game file
├── game.js            # Core game logic
├── characters.js      # Character data and management
├── dialogue.js        # Dialogue system and data
├── audio.js           # Audio management
├── sprites/           # Character and NPC sprites (placeholder)
├── audio/            # Music files (add your own)
└── README.md         # This file
```

### Features Implemented
- ✅ Character movement with WASD/Arrow keys
- ✅ Camera following with map edge behavior (Pokemon-style)
- ✅ 8 theme-based characters with unique colors
- ✅ Character-specific dialogue system
- ✅ NPC interaction system
- ✅ Character switching mechanics
- ✅ Progress tracking and save system
- ✅ Character-specific background music
- ✅ Large portrait display during dialogue
- ✅ Glitch ending animation
- ✅ Auto-redirect after glitch ending
- ✅ Theme switching based on current character

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
Replace the placeholder sprite system in `game.js` with real image loading:

```javascript
// Replace createPlaceholderSprite with actual image loading
async loadSprites() {
    for (const charId of Object.keys(CHARACTERS)) {
        const img = new Image();
        img.src = `sprites/characters/${charId}.png`;
        await new Promise(resolve => img.onload = resolve);
        this.sprites.characters[charId] = img;
    }
}
```

### Audio
Add MP3 or OGG files to the `audio/` directory with names matching the character IDs.

### Backgrounds
Replace the procedural background with actual artwork by modifying `createBackgroundSprite()` in `game.js`.

## License
This game is part of the Bards Quest project. Customize and use as needed for your multimedia comic.