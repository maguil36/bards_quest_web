# Switch Game - Memory Bank

## Game Overview
A top-down 2D character-switching game where players control different characters, interact with NPCs, and ultimately trigger a glitch ending.

## Core Specifications

### 1. Character Movement System
- **Character Movement**: Player controls a character that moves on a map
- **Sprite System**: Each character has a unique sprite
- **Movement Animation**: Sprites have walking animations (4-directional)
- **Camera System**: Map moves relative to character (character stays centered)
- **Edge Behavior**: When approaching map edges, character can move off-center (Pokemon-style)

### 2. Map System
- **Background**: Map has a visual background
- **Boundaries**: Defined map edges that affect camera behavior
- **NPC Placement**: Static NPCs positioned throughout the map

### 3. Character Interaction System
- **Dialogue Trigger**: Characters can interact with NPCs
- **Dialogue Lines**: Each NPC has a set number of dialogue lines
- **Completion Tracking**: Flag system to track completed conversations
- **Large Sprite Display**: During dialogue, larger character sprites with facial animations appear side by side

### 4. Character Switching Mechanics
- **Switch Requirement**: Must talk to all required characters before switching
- **Switch Prompt**: After completing all dialogues, player is asked if they want to switch
- **Character Persistence**: Same rules apply when playing as different characters
- **Final Character**: One character locked until all others have been talked to as all other characters

### 5. Glitch Ending
- **Trigger**: Switching to the final character
- **Animation**: Digital/analogue static glitch effect
- **Error State**: Game throws an error
- **Auto-redirect**: After 3 seconds, automatically goes to next page

### 6. Character Themes & Dialogue
- **8 Characters**: Using first 8 theme styles from styles.css
- **Character Names**: 
  1. Breath Theme - Character 1
  2. Light Theme - Character 2  
  3. Time Theme - Character 3
  4. Space Theme - Character 4
  5. Heart Theme - Character 5
  6. Mind Theme - Character 6
  7. Hope Theme - Character 7
  8. Rage Theme - Character 8
- **Dialogue Colors**: Each character's dialogue uses their theme colors
- **Easy Editing**: Dialogue stored in easily editable format

### 7. Audio System
- **Character Music**: Each character has unique looping background music
- **Music Switching**: Music changes when switching characters

## Character Color Schemes (from styles.css)
1. **Breath**: #007eb4 (blue)
2. **Light**: #ff8000 (orange) 
3. **Time**: #ff4d4d (red)
4. **Space**: #4da3ff (light blue)
5. **Heart**: #ff4da6 (pink)
6. **Mind**: #00c2a0 (teal)
7. **Hope**: #df9f03 (gold)
8. **Rage**: #00ffff (cyan)

## Implementation Plan

### Phase 1: Core Structure
1. Create HTML game file structure
2. Set up canvas and basic rendering system
3. Implement character sprite loading and display
4. Create basic movement controls (WASD/Arrow keys)

### Phase 2: Movement & Camera System
1. Implement character movement with animation
2. Create map background system
3. Implement camera following with centering
4. Add map edge detection and off-center movement

### Phase 3: Character System
1. Create character data structure with themes
2. Implement character switching mechanics
3. Add character-specific styling and colors
4. Create character selection UI

### Phase 4: Dialogue System
1. Create NPC placement system
2. Implement interaction detection (proximity/key press)
3. Build dialogue box UI with character theming
4. Add dialogue progression and completion tracking
5. Implement large sprite display during conversations

### Phase 5: Audio Integration
1. Add background music system
2. Implement character-specific music tracks
3. Add music switching on character change
4. Include audio controls

### Phase 6: Game Logic
1. Implement conversation completion tracking
2. Add switching requirements logic
3. Create switch prompts and confirmations
4. Implement final character unlock system

### Phase 7: Glitch Ending
1. Create glitch animation effects
2. Implement error throwing mechanism
3. Add auto-redirect functionality
4. Test complete game flow

### Phase 8: Polish & Testing
1. Add visual polish and effects
2. Optimize performance
3. Test all character combinations
4. Ensure dialogue editing is user-friendly

## Technical Architecture

### File Structure
```
public/games/switch/
├── index.html          # Main game file
├── game.js            # Core game logic
├── characters.js      # Character data and management
├── dialogue.js        # Dialogue system and data
├── audio.js           # Audio management
├── sprites/           # Character and NPC sprites
│   ├── characters/    # Playable character sprites
│   ├── npcs/         # NPC sprites
│   └── backgrounds/   # Map backgrounds
├── audio/            # Music and sound files
└── styles/           # Game-specific CSS
```

### Data Structures
- **Character Object**: id, name, theme, sprite, music, dialogueColor
- **NPC Object**: id, position, sprite, dialogue, completed
- **Game State**: currentCharacter, completedNPCs, unlockedCharacters
- **Dialogue Object**: npcId, lines, characterResponses

### Key Systems
- **Renderer**: Canvas-based rendering system
- **Input Handler**: Keyboard input management
- **State Manager**: Game state persistence
- **Audio Manager**: Music and sound control
- **Dialogue Manager**: Conversation flow control

## Dialogue Data Format
```javascript
const dialogues = {
  npc1: {
    lines: [
      "Hello there, traveler!",
      "I've been waiting for someone like you.",
      "Take care on your journey."
    ],
    characterResponses: {
      breath: ["Nice to meet you!", "Thank you for waiting.", "I will, thanks!"],
      light: ["Hey there!", "Sorry to keep you waiting.", "Will do!"]
      // ... other characters
    }
  }
  // ... other NPCs
};
```

This structure allows for easy editing of dialogue while maintaining character-specific responses and theming.