# Switch Game - Complete Specifications

**Last Updated:** 2025
**Version:** 2.0

## Table of Contents
1. [Game Overview](#game-overview)
2. [Core Systems](#core-systems)
3. [Character System](#character-system)
4. [Game Mechanics](#game-mechanics)
5. [Implementation Details](#implementation-details)
6. [File Locations](#file-locations)

---

## Game Overview

A top-down 2D character-switching game where players control different characters, interact with NPCs, complete dialogues, and ultimately trigger a glitch ending.

### Key Features
- **Character Switching**: Play as 8 different characters with unique themes
- **Dialogue System**: Interact with NPCs and complete conversations
- **Theme Integration**: Page theme changes based on active character
- **Progress Tracking**: Must complete all dialogues before switching
- **Glitch Ending**: Final character triggers a dramatic ending sequence

---

## Core Systems

### 1. Character Movement System

**Features:**
- Player controls a character that moves on a map
- Each character has a unique sprite
- Walking animations (4-directional: up, down, left, right)
- Camera follows character (character stays centered)
- Pokemon-style edge behavior: character can move off-center near map edges

**Controls:**
- WASD or Arrow keys for movement
- Space/Enter for interaction

### 2. Map System

**Components:**
- Visual background
- Defined map boundaries
- Static NPC placement throughout the map
- Collision detection for boundaries and NPCs

### 3. Character Interaction System

**Features:**
- Proximity-based interaction detection
- Dialogue trigger on key press
- Each NPC has multiple dialogue lines
- Completion tracking with flag system
- Large sprite display during conversations
- Character sprites with facial animations appear side by side

### 4. Character Switching Mechanics

**Rules:**
- Must complete all required dialogues before switching (Remaining to progress: 0)
- Switch prompt appears after completing last required dialogue
- Same rules apply when playing as different characters
- Victor (final character) locked until all others have been talked to as all other characters

**Starting Character:**
- Game starts with **Opal**
- Initial theme is "Space" (Opal's theme)
- Starting position: x: 300, y: 500

### 5. Glitch Ending

**Trigger:** Switching to Victor (final character)

**Sequence:**
1. Digital/analogue static glitch effect
2. Game throws an error
3. After 3 seconds, automatically redirects to next page

### 6. Audio System

**Features:**
- Each character has unique looping background music
- Music changes when switching characters
- Audio controls for volume/mute

---

## Character System

### 8 Playable Characters

Each character maps to a theme from `public/styles.css`:

| # | Character | Theme | Primary Color | Hex Code |
|---|-----------|-------|---------------|----------|
| 1 | Opal (Starting) | Space | Light Blue | #4da3ff |
| 2 | Character 2 | Breath | Blue | #007eb4 |
| 3 | Character 3 | Light | Orange | #ff8000 |
| 4 | Character 4 | Time | Red | #ff4d4d |
| 5 | Character 5 | Heart | Pink | #ff4da6 |
| 6 | Character 6 | Mind | Teal | #00c2a0 |
| 7 | Character 7 | Hope | Gold | #df9f03 |
| 8 | Character 8 | Rage | Cyan | #00ffff |
| 9 | Victor (Final) | ??? | ??? | ??? |

### Character Properties

Each character has:
- **id**: Unique identifier
- **name**: Display name
- **theme**: Associated color theme
- **sprite**: Character sprite image
- **position**: Default starting position (x, y)
- **music**: Background music track
- **dialogues**: Required NPC conversations

### Dialogue Colors

Each character's dialogue uses their theme colors for visual consistency.

---

## Game Mechanics

### Progress System

**Remaining to Progress Counter:**
- Tracks how many required dialogues are left for current character
- Displayed in UI: "Remaining to progress: X"
- Must reach 0 before character switching is allowed

**Completion Tracking:**
- Flag system tracks completed conversations
- Per-character tracking (same NPC can be talked to by different characters)
- Global tracking for Victor unlock (all 42 interactions)

### Character Switching Flow

1. **Start as Opal** (Space theme)
2. **Talk to NPCs** - Remaining counter decreases
3. **Complete all required dialogues** - Remaining reaches 0
4. **Switch prompt appears** - "Would you like to switch characters?"
5. **Select new character** - Theme changes to match
6. **Repeat** for each character
7. **Victor unlocks** - After all 42 interactions complete

### Victor Unlock Criteria

Victor (final character) has special requirements:

1. ✅ All 42 required interactions completed (remaining == 0)
2. ✅ Current character has spoken to Victor
3. ✅ Last interaction was with Victor
4. ✅ Switch prompt offers to switch TO Victor

**Bug Fix:** Talking to Victor before unlock criteria are met does NOT show switch prompt.

### Theme Integration

**When user has "Default" theme selected:**
- Page theme changes to match active character
- Smooth transitions between themes (2-second fade)
- PostMessage communication from game to parent page

**When user has specific theme selected:**
- Page theme remains constant
- Game still tracks active character
- Theme changes are ignored by parent page

**See:** [GAME_THEME_INTEGRATION_MASTER.md](GAME_THEME_INTEGRATION_MASTER.md) for complete theme integration details.

---

## Implementation Details

### File Structure

```
public/games/switch/
├── game.js                 # Main game logic
├── characters.js           # Character definitions and GameState
├── dialogue.js             # Dialogue system
├── renderer.js             # Canvas rendering
├── input.js                # Input handling
├── audio.js                # Audio system
└── assets/
    ├── sprites/            # Character sprites
    ├── backgrounds/        # Map backgrounds
    └── music/              # Background music tracks
```

### Key Functions

**File:** `public/games/switch/characters.js`

```javascript
// GameState constructor - sets starting character
constructor() {
    this.currentCharacter = 'opal';
    this.unlockedCharacters = new Set(['opal']);
    // ...
}

// Switch to a new character
switchCharacter(characterId) {
    if (!this.characters[characterId]) return false;
    this.activeCharacter = characterId;
    this.applyCharacterTheme(characterId);
    return true;
}

// Check remaining dialogues for character
getRemainingForCharacterProgress(characterId) {
    // Returns number of required dialogues left
}

// Check if can switch to character
canSwitchToCharacter(characterId) {
    // Returns true if unlock criteria met
}
```

**File:** `public/games/switch/game.js`

```javascript
// Show switch prompt (with restrictions)
showSwitchPrompt() {
    const currentChar = this.gameState.getCurrentCharacter();
    const remainingForCharacter = this.gameState.getRemainingForCharacterProgress(currentChar.id);
    
    // Only allow switching if remaining = 0
    if (remainingForCharacter > 0) return;
    
    // Special handling for Victor
    if (lastTalked === 'victor') {
        if (!(remaining === 0 && spokeVictor && this.gameState.canSwitchToCharacter('victor'))) {
            return;
        }
    }
    
    // Show prompt...
}

// Apply character theme to parent page
applyCharacterTheme(characterId) {
    const character = this.gameState.characters[characterId];
    if (!character || !character.theme) return;
    
    window.parent.postMessage({
        type: 'GAME_THEME_CHANGE',
        theme: character.theme
    }, '*');
}
```

### Data Storage

**localStorage Keys:**
- `switch-game:save` - Game save data
- `switch-game:active-character` - Current character
- `switch-game:completed-dialogues` - Completed conversation flags
- `switch-game:unlocked-characters` - Unlocked character set

### Save Data Format

```javascript
{
    currentCharacter: 'opal',
    position: { x: 300, y: 500 },
    unlockedCharacters: ['opal', 'character2'],
    completedDialogues: {
        'opal': ['npc1', 'npc2'],
        'character2': ['npc1']
    },
    globalProgress: 15, // out of 42
    timestamp: 1234567890
}
```

---

## File Locations

### Core Game Files

| File | Purpose | Key Functions |
|------|---------|---------------|
| `public/games/switch/game.js` | Main game logic | showSwitchPrompt, applyCharacterTheme |
| `public/games/switch/characters.js` | Character system | switchCharacter, getRemainingForCharacterProgress |
| `public/games/switch/dialogue.js` | Dialogue system | showDialogue, completeDialogue |
| `public/games/switch/renderer.js` | Canvas rendering | render, drawCharacter, drawNPC |
| `public/games/switch/input.js` | Input handling | handleKeyPress, handleInteraction |
| `public/games/switch/audio.js` | Audio system | playMusic, switchMusic |

### Integration Files

| File | Purpose |
|------|---------|
| `src/pages/games/character-switch.astro` | Game page template |
| `src/layouts/MSPALayout.astro` | Theme change listener |
| `src/components/GameEmbed.astro` | Game embedding component |

### Documentation Files

| File | Purpose |
|------|---------|
| `GAME_THEME_INTEGRATION_MASTER.md` | Theme integration guide |
| `SWITCH_GAME_SPECIFICATIONS.md` | This file - complete game specs |
| `DOCUMENTATION_INDEX.md` | Documentation navigation |

---

## Implementation Phases

### Phase 1: Core Structure ✅
- HTML game file structure
- Canvas and basic rendering system
- Character sprite loading and display
- Basic movement controls (WASD/Arrow keys)

### Phase 2: Movement & Camera System ✅
- Character movement with animation
- Map background system
- Camera following with centering
- Map edge detection and off-center movement

### Phase 3: Character System ✅
- Character data structure with themes
- Character switching mechanics
- Character-specific styling and colors
- Character selection UI

### Phase 4: Dialogue System ✅
- NPC placement system
- Interaction detection (proximity/key press)
- Dialogue box UI with character theming
- Dialogue progression and completion tracking
- Large sprite display during conversations

### Phase 5: Audio Integration ✅
- Background music system
- Character-specific music tracks
- Music switching on character change
- Audio controls

### Phase 6: Game Logic ✅
- Conversation completion tracking
- Switching requirements logic
- Progress counter ("Remaining to progress")
- Victor unlock criteria

### Phase 7: Theme Integration ✅
- PostMessage communication
- Parent page theme listener
- Smooth theme transitions
- User preference respect

### Phase 8: Glitch Ending ✅
- Static glitch effect
- Error state
- Auto-redirect after 3 seconds

---

## Testing Checklist

### Basic Functionality
- [ ] Game loads correctly
- [ ] Character sprites display properly
- [ ] Movement controls work (WASD/Arrow keys)
- [ ] Camera follows character
- [ ] Map boundaries work correctly

### Character System
- [ ] Start as Opal with Space theme
- [ ] Can interact with NPCs
- [ ] Dialogue displays correctly
- [ ] "Remaining to progress" counter updates
- [ ] Switch prompt appears when remaining = 0
- [ ] Can switch to new character
- [ ] Theme changes when switching (if "Default" selected)

### Progress Tracking
- [ ] Completed dialogues are tracked
- [ ] Same NPC can be talked to by different characters
- [ ] Global progress counter works (out of 42)
- [ ] Victor unlocks only after all 42 interactions

### Victor Special Rules
- [ ] Talking to Victor before unlock shows NO switch prompt
- [ ] After 42 interactions, talking to Victor shows switch prompt
- [ ] Switch prompt offers to switch TO Victor
- [ ] Switching to Victor triggers glitch ending

### Theme Integration
- [ ] Theme changes when switching characters (if "Default" selected)
- [ ] Theme remains constant if specific theme selected
- [ ] Transitions are smooth (no flashing)
- [ ] Console logs show theme change messages

### Audio
- [ ] Background music plays for each character
- [ ] Music changes when switching characters
- [ ] Audio controls work (volume/mute)

### Save System
- [ ] Game saves progress
- [ ] Can reload and continue from save
- [ ] Save data persists across sessions

### Glitch Ending
- [ ] Switching to Victor triggers glitch effect
- [ ] Error message displays
- [ ] Auto-redirects after 3 seconds

---

## Known Issues & Solutions

### Issue: Switch prompt appears too early
**Solution:** Check `getRemainingForCharacterProgress()` returns correct count

### Issue: Victor switch prompt appears incorrectly
**Solution:** Verify Victor unlock criteria check in `showSwitchPrompt()`

### Issue: Theme doesn't change when switching
**Solution:** 
1. Check user has "Default" theme selected in `/options`
2. Verify `applyCharacterTheme()` is called
3. Check browser console for postMessage errors

### Issue: Music doesn't change
**Solution:** Verify audio files are loaded and `switchMusic()` is called

---

## Related Documentation

- **[GAME_THEME_INTEGRATION_MASTER.md](GAME_THEME_INTEGRATION_MASTER.md)** - Complete theme integration guide
- **[THEME_SYSTEM_MASTER.md](THEME_SYSTEM_MASTER.md)** - Theme system documentation
- **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** - Documentation navigation

---

## Development Notes

### Character Names
The current implementation uses placeholder names (Character 1, Character 2, etc.). These should be replaced with actual character names in the final version.

### Dialogue Content
Dialogue content is stored in an easily editable format in `dialogue.js`. Update this file to change NPC conversations.

### Music Tracks
Each character needs a unique looping background music track. Place audio files in `public/games/switch/assets/music/`.

### Sprite Assets
Character sprites should be 4-directional (up, down, left, right) with walking animations. Place in `public/games/switch/assets/sprites/`.

---

**End of Switch Game Specifications**
