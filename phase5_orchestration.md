# Phase 5: Orchestration System

## ⚠️ IMPORTANT: Read This First

**This document is for implementing the orchestration layer in an already-refactored codebase.**

If you're a new agent/developer implementing this, you MUST understand:
1. The current codebase structure (see "Current Architecture" below)
2. What has already been extracted and what remains in `game.js`
3. The existing patterns and conventions
4. What systems are working and should NOT be broken

**DO NOT start implementing without reading the "Context & Background" section below.**

---

## 📚 Context & Background

### What Has Already Been Done (Phases 1-4)

The codebase has undergone significant refactoring:

1. **Phase 1-3:** Battle system, dialogue system, and map rendering extracted
2. **Phase 4:** Map interactions, AI, and quest systems extracted

**Current file structure:**
```
public/games/switch/
├── game.js (1,383 lines) - STILL TOO COUPLED, needs orchestration
├── map/
│   ├── mapInteractions.js (568 lines) - Player interactions with objects
│   ├── mapAI.js (161 lines) - Agent movement, patrol, detection
│   ├── mapQuests.js (142 lines) - Quest UI, progress, unlocks
│   ├── mapData.js - Map definitions, room layouts
│   ├── mapCharacters.js - CHARACTERS constant, GameState class, NPCs
│   ├── mapEnding.js - Game ending logic
│   └── GameRenderer.js - Map rendering (tiles, sprites)
├── battle/
│   ├── battleController.js - High-level combat flow
│   ├── battleCombat.js - PokemonCombatSystem (damage calcs)
│   └── battleUI.js - Combat interface rendering
├── dialogue/
│   └── dialogueManager.js - Dialogue trees, menus, NPC interactions
├── minigames/
│   ├── nicholasMiniGame.js - Shooting minigame
│   └── logicPuzzle.js - Logic puzzle minigame
└── audio/
    └── audioManager.js - Sound system
```

### Current State of game.js (What It Does)

**game.js currently contains:**
- Canvas and context setup
- All subsystem initialization (creates ALL objects)
- Input handling (keyboard, mouse, touch)
- Main game loop (update & render)
- **Direct coordination of ALL subsystems** ← THIS IS THE PROBLEM
- Mode switching (map ↔ battle ↔ dialogue ↔ minigame)
- Character switching logic
- UI updates coordination
- Save/load coordination

**The problem:** game.js directly calls methods on:
- `this.mapInteractions.*`
- `this.mapAI.*`
- `this.mapQuests.*`
- `this.battleController.*`
- `this.dialogueManager.*`
- `this.renderer.*`
- `this.gameState.*`

This creates **tight coupling** and makes the codebase hard to maintain.

### Critical Existing Classes (DO NOT BREAK)

These classes are **working and stable**. Orchestrators should wrap/coordinate them, NOT rewrite them:

1. **GameState** (`map/mapCharacters.js`)
   - Central state management
   - Has: `currentCharacter`, `inventory`, `questProgress`, `completedQuests`, etc.
   - Methods: `canSwitchToCharacter()`, `getCurrentCharacter()`, `save()`, `load()`
   - **DO NOT modify this class** - orchestrators should USE it

2. **DialogueManager** (`dialogue/dialogueManager.js`)
   - Dialogue tree navigation
   - Menu system
   - NPC interaction tracking
   - **Working perfectly** - just needs orchestration wrapper

3. **BattleController** (`battle/battleController.js`)
   - Combat flow management
   - References: `PokemonCombatSystem`, `BattleUI`, `GameState`
   - **Needs light refactoring** to work with orchestrator

4. **MapInteractions** (`map/mapInteractions.js`)
   - Handles: boulders, chests, puzzles, teleport, grist creation
   - **Already extracted** - just needs orchestrator coordination

5. **MapAI** (`map/mapAI.js`)
   - Agent patrol, chase, detection
   - **Already extracted** - just needs orchestrator coordination

6. **MapQuests** (`map/mapQuests.js`)
   - Quest UI generation
   - Quest progress checking
   - Unlock requirement messages
   - **Already extracted** - just needs orchestrator coordination

### Key Patterns & Conventions

1. **State is in GameState** - NOT in individual systems
   - Quest progress: `gameState.questProgress[characterId]`
   - Inventory: `gameState.inventory[characterId]`
   - Combat stats: `gameState.combatStats`

2. **Methods delegate to subsystems**
   ```javascript
   // Current pattern in game.js (TO BE REPLACED)
   updatePlayerMovement() {
     this.mapInteractions.updatePlayerMovement();
   }

   // Future pattern (with orchestrator)
   update() {
     this.mapOrchestrator.update(deltaTime);
   }
   ```

3. **Mode flags control behavior**
   - `this.inCombat` - Battle mode active
   - `this.showingDialogue` - Dialogue mode active
   - `this.inMiniGame` - Minigame mode active
   - `this.playerFrozen` - Player can't move (agent chasing)

4. **Canvas is shared** - All systems render to same canvas
   ```javascript
   this.ctx // 2D rendering context
   this.canvas // HTML canvas element
   ```

### What's Working (Don't Break It!)

✅ **Character switching system** - Uses quest-based unlocks
✅ **Quest progression** - Each character has quests to unlock others
✅ **Combat system** - Turn-based Pokémon-style combat
✅ **Dialogue system** - Branching dialogues with menus
✅ **Map interactions** - Boulders, chests, puzzles all work
✅ **Save/load** - LocalStorage persistence
✅ **Agent AI** - Patrol and chase behavior
✅ **Minigames** - Nicholas shooting game, logic puzzles

### Critical Dependencies to Understand

```
game.js
  ├─> gameState (used by EVERYTHING)
  ├─> mapInteractions ─> gameState, player, camera
  ├─> mapAI ─> game.agents, game.player, gameState
  ├─> mapQuests ─> gameState, CHARACTERS
  ├─> battleController ─> gameState, combatSystem, battleUI
  ├─> dialogueManager ─> gameState, NPCs, game
  └─> renderer ─> All game objects for rendering
```

**Key insight:** Almost everything depends on `gameState` and `game` instance.

### The "Why" - Why Orchestration?

**Current problems:**
1. game.js knows TOO MUCH about subsystems (1,383 lines!)
2. No clear boundaries - systems call each other directly
3. Hard to test - everything is coupled
4. Hard to debug - call chains go everywhere
5. Hard to extend - adding features touches many files

**Orchestration fixes this by:**
1. Creating clear API boundaries
2. Centralizing coordination logic
3. Using events for cross-system communication
4. Making each system independently testable
5. Reducing game.js to a thin wrapper (~400 lines)

---

## Overview
Create a clean orchestration layer to manage communication between game systems. This will establish clear boundaries and data flow patterns between the map, battle, dialogue, and main game systems.

---

## 🎯 Goals

1. **Reduce coupling** between game systems
2. **Centralize state management** through orchestrators
3. **Establish clear communication patterns** between modules
4. **Improve maintainability** by separating concerns
5. **Enable easier testing** of individual systems

---

## 📐 Architecture

### Four Orchestrators

```
┌─────────────────────────────────────────────┐
│          GameOrchestrator (Master)          │
│  - Coordinates all subsystem orchestrators  │
│  - Manages global game state transitions    │
│  - Handles cross-system communication       │
└───────────┬─────────────┬─────────┬─────────┘
            │             │         │
    ┌───────▼───────┐ ┌───▼────┐ ┌─▼──────────┐
    │      Map      │ │ Battle │ │  Dialogue  │
    │ Orchestrator  │ │ Orch.  │ │    Orch.   │
    └───────────────┘ └────────┘ └────────────┘
```

---

## 1. MapOrchestrator
**Location:** `public/games/switch/map/MapOrchestrator.js`

### Responsibilities
- Coordinate map rendering and updates
- Manage player movement and camera
- Handle map interactions (chests, boulders, puzzles)
- Control AI agent behavior
- Track quest progress
- Manage map state transitions

### Subsystems It Manages
- `MapInteractions` - Player interactions with map objects
- `MapAI` - Agent movement and detection
- `MapQuests` - Quest tracking and completion
- Map rendering (tiles, objects, NPCs)
- Camera system
- Collision detection

### Public API
```javascript
class MapOrchestrator {
  // Lifecycle
  initialize()
  update(deltaTime)
  render(ctx, camera)
  
  // Player
  movePlayer(direction)
  teleportPlayer(x, y)
  getPlayerPosition()
  
  // Interactions
  handlePlayerInteraction()
  handleClickOnMap(x, y)
  
  // State queries
  isPlayerNearNPC(npcId)
  canPlayerMove()
  getVisibleNPCs()
  
  // Events (emits to GameOrchestrator)
  onCombatTriggered(agent)
  onDialogueRequested(npcId)
  onQuestCompleted(questId)
  onPlayerMoved(position)
}
```

### Communication
- **Sends to GameOrchestrator:**
  - Combat initiation requests
  - Dialogue trigger events
  - Quest completion notifications
  - Player position updates

- **Receives from GameOrchestrator:**
  - Combat start/end signals
  - Dialogue start/end signals
  - Character switch commands
  - Game pause/resume

---

## 2. BattleOrchestrator
**Location:** `public/games/switch/battle/BattleOrchestrator.js`

### Responsibilities
- Manage combat flow and turn order
- Coordinate battle UI updates
- Handle move selection and execution
- Track combat stats and results
- Control battle animations
- Manage combat state transitions

### Subsystems It Manages
- `BattleController` - Combat flow logic
- `BattleUI` - Combat interface rendering
- `PokemonCombatSystem` - Combat calculations
- Battle animations
- Turn management

### Public API
```javascript
class BattleOrchestrator {
  // Lifecycle
  startBattle(playerChar, enemy)
  update(deltaTime)
  render(ctx)
  endBattle(result)
  
  // Combat actions
  selectMove(moveIndex)
  executePlayerTurn()
  executeEnemyTurn()
  
  // State queries
  isInCombat()
  getCurrentTurn()
  getPlayerHealth()
  getEnemyHealth()
  getCombatStats()
  
  // UI control
  showMoveSelection()
  showDamageNumbers(amount, target)
  updateHealthBars()
  
  // Events (emits to GameOrchestrator)
  onBattleStart(enemy)
  onBattleEnd(won, stats)
  onPlayerTurnStart()
  onEnemyDefeated(agentId)
}
```

### Communication
- **Sends to GameOrchestrator:**
  - Battle completion results
  - Agent defeat notifications
  - Player stats updates
  - Combat achievements

- **Receives from GameOrchestrator:**
  - Battle initiation commands
  - Player character data
  - Enemy data
  - Ability modifiers

---

## 3. DialogueOrchestrator
**Location:** `public/games/switch/dialogue/DialogueOrchestrator.js`

### Responsibilities
- Manage dialogue flow and progression
- Handle menu interactions
- Track dialogue history
- Control NPC interactions
- Manage dialogue UI state
- Handle dialogue choices and branching

### Subsystems It Manages
- `DialogueManager` - Dialogue logic and flow
- Dialogue UI rendering
- Menu system
- NPC interaction detection
- Dialogue history tracking

### Public API
```javascript
class DialogueOrchestrator {
  // Lifecycle
  startDialogue(npcId)
  update()
  render(ctx)
  endDialogue()
  
  // Flow control
  advanceDialogue()
  selectMenuOption(optionId)
  navigateMenu(direction)
  
  // State queries
  isDialogueActive()
  isShowingMenu()
  getCurrentNPC()
  hasCompletedDialogue(charId, npcId)
  
  // NPC management
  getNearbyNPCs(position)
  canInteractWithNPC(npcId)
  
  // Events (emits to GameOrchestrator)
  onDialogueStart(npcId)
  onDialogueEnd(npcId)
  onMenuOptionSelected(optionId)
  onMinigameRequested(targetChar)
  onCharacterSwitchRequested(targetChar)
}
```

### Communication
- **Sends to GameOrchestrator:**
  - Minigame trigger requests
  - Character switch requests
  - Dialogue completion events
  - NPC interaction tracking

- **Receives from GameOrchestrator:**
  - Player position for proximity checks
  - Character unlock status
  - Quest completion states
  - Game pause signals

---

## 4. GameOrchestrator (Master)
**Location:** `public/games/switch/orchestration/GameOrchestrator.js`

### Responsibilities
- **Central coordination hub** for all subsystems
- Manage global game state transitions
- Route events between orchestrators
- Handle cross-system dependencies
- Coordinate scene transitions
- Manage save/load operations
- Control game lifecycle

### Subsystems It Manages
- `MapOrchestrator`
- `BattleOrchestrator`
- `DialogueOrchestrator`
- `GameState` - Central state management
- `AudioManager` - Sound system
- `EndingManager` - Game ending logic
- Global UI elements

### Public API
```javascript
class GameOrchestrator {
  // Lifecycle
  initialize()
  start()
  pause()
  resume()
  update(deltaTime)
  render(ctx)
  
  // System coordination
  switchToMapMode()
  switchToBattleMode(enemy)
  switchToDialogueMode(npcId)
  switchToMinigameMode(gameType)
  
  // Character management
  switchCharacter(characterId)
  getCurrentCharacter()
  unlockCharacter(characterId)
  
  // Save/Load
  saveGame()
  loadGame()
  resetGame()
  
  // Global queries
  getGameState()
  getPlayerPosition()
  isSystemBusy()
  
  // Event routing (internal)
  onCombatTriggered(agent)
  onCombatEnded(result)
  onDialogueStarted(npcId)
  onDialogueEnded()
  onQuestCompleted(questId)
  onCharacterSwitched(newChar)
}
```

### Communication Patterns
**Event Flow:**
```
Map → GameOrch → Battle
  Player near agent → Start combat → Load battle

Battle → GameOrch → Map
  Combat won → Update stats → Resume exploration

Dialogue → GameOrch → Map/Battle
  Trigger minigame → Pause map → Start minigame

Map → GameOrch → Dialogue
  Player interact → Check NPC → Start dialogue
```

**State Synchronization:**
- GameOrchestrator maintains single source of truth (GameState)
- Subsystem orchestrators query GameOrchestrator for shared state
- Updates flow through GameOrchestrator to maintain consistency

---

## 📋 Implementation Phases

### Phase 5.1: Create Orchestrator Base Classes
**Estimated effort:** 2-3 hours

**Tasks:**
1. Create `BaseOrchestrator` class with common patterns
   - Event emitter functionality
   - Lifecycle methods (init, update, render, destroy)
   - State management helpers
   - Error handling

2. Create directory structure:
   ```
   public/games/switch/
   ├── orchestration/
   │   ├── GameOrchestrator.js
   │   └── BaseOrchestrator.js
   ├── map/
   │   └── MapOrchestrator.js
   ├── battle/
   │   └── BattleOrchestrator.js
   └── dialogue/
       └── DialogueOrchestrator.js
   ```

3. Define interfaces and contracts
4. Set up event system for orchestrator communication

---

### Phase 5.2: Implement MapOrchestrator
**Estimated effort:** 3-4 hours

**Tasks:**
1. Move map coordination logic from `game.js` to `MapOrchestrator`
2. Refactor subsystem calls through orchestrator
3. Implement public API methods
4. Set up event emitters for cross-system communication
5. Test map interactions still work

**Extract from game.js:**
- Player movement logic coordination
- Camera update coordination
- Agent AI update coordination
- Map interaction handling
- Quest checking coordination

**Keep centralized:**
- Rendering coordination
- Input handling delegation
- State queries

---

### Phase 5.3: Implement BattleOrchestrator
**Estimated effort:** 3-4 hours

**Tasks:**
1. Extract battle coordination from `BattleController`
2. Consolidate battle flow management
3. Implement turn management
4. Set up combat events
5. Coordinate UI updates through orchestrator
6. Test combat system

**Extract from:**
- `BattleController` - High-level flow
- `game.js` - Battle mode switching

**Keep in BattleController:**
- Low-level combat calculations
- Move execution details
- Damage calculations

---

### Phase 5.4: Implement DialogueOrchestrator
**Estimated effort:** 2-3 hours

**Tasks:**
1. Extract dialogue coordination logic
2. Centralize menu handling
3. Manage NPC interaction flow
4. Set up dialogue events
5. Test dialogue system

**Extract from:**
- `game.js` - Dialogue mode switching
- `DialogueManager` - High-level flow

**Keep in DialogueManager:**
- Dialogue tree navigation
- Text processing
- Choice validation

---

### Phase 5.5: Implement GameOrchestrator (Master)
**Estimated effort:** 4-5 hours

**Tasks:**
1. Create central coordination hub
2. Set up event routing between orchestrators
3. Implement mode switching logic
4. Coordinate save/load operations
5. Manage global state transitions
6. Refactor `game.js` to delegate to GameOrchestrator
7. Test full game flow

**Refactor game.js:**
- Remove direct subsystem coordination
- Delegate to GameOrchestrator
- Keep only: canvas setup, input capture, render loop
- Game.js becomes thin wrapper around GameOrchestrator

---

### Phase 5.6: Testing & Integration
**Estimated effort:** 2-3 hours

**Tasks:**
1. Test all orchestrator interactions
2. Verify event flows work correctly
3. Test state synchronization
4. Ensure save/load works
5. Test character switching
6. Test mode transitions (map → battle → map)
7. Check quest progression
8. Verify no regressions

---

## 🎯 Success Criteria

### Code Quality
- [ ] Clear separation of concerns
- [ ] No circular dependencies
- [ ] Single Responsibility Principle followed
- [ ] Event-driven architecture working
- [ ] No direct cross-system calls (all through orchestrators)

### Functionality
- [ ] All existing features work
- [ ] Save/load preserved
- [ ] Character switching works
- [ ] Combat flows properly
- [ ] Dialogues function correctly
- [ ] Quests track properly
- [ ] No performance regressions

### Architecture
- [ ] game.js reduced to <500 lines (thin wrapper)
- [ ] Each orchestrator handles one domain
- [ ] Clear API boundaries
- [ ] Event system functioning
- [ ] State management centralized

---

## 📊 Expected Outcomes

### File Size Reductions
**Before:**
- game.js: ~1,383 lines

**After:**
- game.js: ~400-500 lines (canvas, input, render loop)
- GameOrchestrator.js: ~300-400 lines
- MapOrchestrator.js: ~250-300 lines
- BattleOrchestrator.js: ~200-250 lines
- DialogueOrchestrator.js: ~150-200 lines

**Total: Similar line count but MUCH better organized**

### Benefits
1. **Testability:** Each orchestrator can be tested independently
2. **Maintainability:** Clear responsibilities and boundaries
3. **Scalability:** Easy to add new systems or features
4. **Debugging:** Easier to trace issues through clear event flow
5. **Collaboration:** Multiple developers can work on different orchestrators

---

## 🔄 Event Flow Examples

### Starting Combat
```
1. MapOrchestrator detects agent collision
2. MapOrchestrator emits: onCombatTriggered(agent)
3. GameOrchestrator receives event
4. GameOrchestrator pauses MapOrchestrator
5. GameOrchestrator starts BattleOrchestrator
6. BattleOrchestrator initializes combat
7. BattleOrchestrator emits: onBattleStart(enemy)
```

### Completing Dialogue
```
1. DialogueOrchestrator detects end of dialogue
2. DialogueOrchestrator emits: onDialogueEnd(npcId)
3. GameOrchestrator receives event
4. GameOrchestrator updates NPC interaction tracking
5. GameOrchestrator checks quest progress
6. GameOrchestrator resumes MapOrchestrator
7. MapOrchestrator updates quest UI
```

### Character Switch
```
1. Player opens character menu (via MapOrchestrator)
2. Player selects new character
3. GameOrchestrator validates switch is allowed
4. GameOrchestrator saves current position
5. GameOrchestrator switches character in GameState
6. GameOrchestrator notifies MapOrchestrator
7. MapOrchestrator updates player sprite/position
8. MapOrchestrator emits: onCharacterSwitched(newChar)
```

---

## 🚀 Getting Started

### Step 1: Review Current Architecture
- Understand current coupling points
- Identify state that needs centralization
- Map out event flows

### Step 2: Create Base Infrastructure
- Implement BaseOrchestrator
- Set up event system
- Create directory structure

### Step 3: Implement Incrementally
- Start with MapOrchestrator (most isolated)
- Then BattleOrchestrator
- Then DialogueOrchestrator
- Finally GameOrchestrator

### Step 4: Test Each Phase
- Test after each orchestrator
- Ensure no regressions
- Verify events flow correctly

---

## 📚 Additional Considerations

### Performance
- Orchestrators add minimal overhead
- Event system should be lightweight
- Avoid deep call stacks

### Error Handling
- Each orchestrator should handle its own errors
- GameOrchestrator should catch and log cross-system errors
- Provide meaningful error messages

### Future Extensibility
- Easy to add new orchestrators (e.g., MinigameOrchestrator)
- Clean way to add new systems
- Clear patterns to follow

---

## ⚠️ CRITICAL WARNINGS & GOTCHAS

### Before You Start

1. **TEST EVERYTHING AFTER EACH STEP**
   - Don't move to the next orchestrator until the previous one is 100% working
   - Run the game and test ALL features after each change
   - Check browser console for errors constantly

2. **NEVER Break Working Features**
   - Character switching MUST work
   - Combat MUST work
   - Dialogues MUST work
   - Save/load MUST work
   - Quest progression MUST work
   - If you break any of these, STOP and fix it before proceeding

3. **DO NOT Rewrite Existing Systems**
   - MapInteractions, MapAI, MapQuests are DONE - just coordinate them
   - DialogueManager is DONE - just wrap it
   - BattleController works - just coordinate it
   - You're creating WRAPPERS/COORDINATORS, not replacing systems

### Common Pitfalls

#### 1. Circular Dependencies
**Problem:** Orchestrators reference each other creating import cycles

**Solution:**
- Only GameOrchestrator should know about all orchestrators
- Subsystem orchestrators should NEVER import each other
- Use events to communicate, not direct calls

```javascript
// ❌ BAD - MapOrchestrator imports BattleOrchestrator
import { BattleOrchestrator } from '../battle/BattleOrchestrator.js';

// ✅ GOOD - MapOrchestrator emits event
this.emit('combatTriggered', agent);
// GameOrchestrator handles it and tells BattleOrchestrator
```

#### 2. Losing the "this" Context
**Problem:** Passing methods as callbacks loses context

**Solution:** Always bind methods or use arrow functions

```javascript
// ❌ BAD
this.miniGame = new NicholasMiniGame(canvas, ctx, gameState, this.onMiniGameComplete);

// ✅ GOOD
this.miniGame = new NicholasMiniGame(canvas, ctx, gameState, (success) => this.onMiniGameComplete(success));
```

#### 3. State Duplication
**Problem:** Storing same state in multiple places

**Solution:** GameState is single source of truth

```javascript
// ❌ BAD - Don't store position in orchestrator AND gameState
this.playerPosition = { x: 100, y: 100 };

// ✅ GOOD - Always read from GameState
get playerPosition() {
  return this.game.gameState.characterPositions[this.game.gameState.currentCharacter];
}
```

#### 4. Breaking Input Handling
**Problem:** Moving input handling breaks keyboard/mouse

**Solution:** Keep input capture in game.js, delegate handling

```javascript
// In game.js - KEEP THIS
setupEventListeners() {
  document.addEventListener('keydown', (e) => {
    this.keys[e.code] = true;
    this.gameOrchestrator.handleKeyDown(e.code);
  });
}

// In GameOrchestrator - ADD THIS
handleKeyDown(keyCode) {
  if (this.currentMode === 'map') {
    this.mapOrchestrator.handleKeyDown(keyCode);
  } else if (this.currentMode === 'battle') {
    this.battleOrchestrator.handleKeyDown(keyCode);
  }
  // ... etc
}
```

#### 5. Forgetting to Update All References
**Problem:** Moving method but missing some callers

**Solution:** Use grep to find ALL references before moving

```bash
# Before moving a method, find all callers
grep -r "methodName" public/games/switch/

# Make sure you update EVERY caller
```

#### 6. Canvas Rendering Issues
**Problem:** Black screen or flickering after refactor

**Solution:** Preserve exact render order

```javascript
// Render order MUST stay the same:
// 1. Clear canvas
// 2. Render map/background
// 3. Render NPCs/agents
// 4. Render player
// 5. Render UI overlays
// 6. Render floating texts

// Don't change this order or things will render wrong!
```

### Testing Checklist (Run After Each Change)

After implementing each orchestrator, test these:

**Map Mode:**
- [ ] Player can move with WASD/arrows
- [ ] Camera follows player
- [ ] Can interact with NPCs (Space key)
- [ ] Can open chests
- [ ] Agents patrol correctly
- [ ] Agents chase when player detected
- [ ] Quest UI shows progress

**Battle Mode:**
- [ ] Combat starts when agent catches player
- [ ] Can select moves
- [ ] Damage calculations work
- [ ] Health bars update
- [ ] Can win/lose battles
- [ ] Returns to map after battle

**Dialogue Mode:**
- [ ] Talking to NPCs shows dialogue
- [ ] Can advance dialogue (Space)
- [ ] Menus work (arrow keys + Space)
- [ ] Dialogue closes properly
- [ ] Returns to map after dialogue

**Character Switching:**
- [ ] Can open character menu (C key)
- [ ] Shows locked/unlocked characters
- [ ] Can switch to unlocked characters
- [ ] Position saves per character
- [ ] Character abilities work

**Save/Load:**
- [ ] Game saves progress
- [ ] Reload page restores state
- [ ] Character positions preserved
- [ ] Quest progress preserved
- [ ] Inventory preserved

### Debugging Tips

**If something breaks:**

1. **Check console for errors** - Always first step
2. **Check `this` context** - Most common issue
3. **Verify GameState** - Is state being updated?
4. **Check event flow** - Are events being emitted/received?
5. **Compare with backup** - What changed?

**Use console.log strategically:**
```javascript
// Add temporarily for debugging, remove when working
console.log('[MapOrch] Player moved to:', position);
console.log('[GameOrch] Switching mode from', oldMode, 'to', newMode);
```

**Browser DevTools:**
- Use breakpoints to step through code
- Watch variables to see state changes
- Use Network tab to check if files load
- Check localStorage for save data

### File Organization Rules

**DO:**
- Keep orchestrators in their respective directories
- Use consistent naming (XOrchestrator.js)
- Export as named exports when possible
- Document public APIs with JSDoc comments

**DON'T:**
- Mix orchestrator code with system code
- Create files outside the structure
- Use default exports inconsistently
- Skip documentation

### When to Ask for Help

**Stop and ask if:**
- You've broken a working feature and can't fix it
- You're not sure which orchestrator should handle something
- Tests are failing and you don't know why
- You've created circular dependencies
- Performance is significantly degraded

---

## ✅ Completion Checklist

- [ ] BaseOrchestrator created
- [ ] Event system implemented
- [ ] MapOrchestrator created and tested
- [ ] BattleOrchestrator created and tested
- [ ] DialogueOrchestrator created and tested
- [ ] GameOrchestrator created and tested
- [ ] game.js refactored to thin wrapper
- [ ] All features working
- [ ] Save/load functioning
- [ ] No performance regressions
- [ ] Documentation updated
- [ ] Code reviewed

---

**Total Estimated Effort:** 16-22 hours
**Complexity:** High
**Risk:** Medium (requires careful refactoring)
**Benefit:** Very High (much cleaner, maintainable architecture)
