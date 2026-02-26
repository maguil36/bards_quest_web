# Phase 6: Dependency Injection Plan

## Goal
Refactor all subsystems to accept specific dependencies via config objects instead of the entire `game` instance, making each orchestrator independently testable and runnable.

---

## MapInteractions Dependencies

**Currently uses from `this.game`:**
- `gameState` - For getCurrentCharacter(), save()
- `camera` - For coordinate transformations
- `player` - Position, dimensions, frozen state
- `playerFrozen` - Boolean flag
- `mapWidth`, `mapHeight` - Map boundaries
- `tileSize` - Tile dimensions
- `mapRows`, `mapCols` - Grid dimensions
- `mapTiles` - 2D array of tile types
- `boulders` - Array of boulder objects
- `chests` - Array of chest objects
- `obstacles` - Array of obstacle objects
- `fillableChasms` - Array of chasm objects
- `npcs` - Array of NPC objects
- `showFloatingText()` - Callback for UI feedback
- `updateQuestUI()` - Callback for UI updates
- `startDialogue()` - Callback for dialogue
- `showInteractionMenu()` - Callback for menus

**New constructor signature:**
```javascript
constructor({
    gameState,
    camera,
    player,
    getPlayerFrozen,  // Function that returns boolean
    mapData: { width, height, tileSize, rows, cols, tiles },
    mapObjects: { boulders, chests, obstacles, fillableChasms },
    npcs,
    callbacks: { showFloatingText, updateQuestUI, startDialogue, showInteractionMenu }
})
```

---

## MapAI Dependencies

**Currently uses from `this.game`:**
- `gameState` - For getCurrentCharacter()
- `player` - Position for detection/chase
- `agents` - Array of agent objects
- `playerFrozen` - Set this flag
- `startAgentCombat()` - Callback to start combat

**New constructor signature:**
```javascript
constructor({
    gameState,
    player,
    agents,
    setPlayerFrozen,  // Function to set frozen state
    callbacks: { startAgentCombat }
})
```

---

## MapQuests Dependencies

**Currently uses from `this.game`:**
- `gameState` - For quest progress, completedQuests
- `questUI` - DOM element
- `inventoryUI` - DOM element
- `characters` - CHARACTERS object

**New constructor signature:**
```javascript
constructor({
    gameState,
    uiElements: { questUI, inventoryUI },
    characters
})
```

---

## BattleController Dependencies

**Currently uses from `this.game`:**
- `gameState` - For combat stats
- `combatSystem` - PokemonCombatSystem instance
- `battleUI` - BattleUI instance
- `player` - Player position for resets
- `playerStartX`, `playerStartY` - Spawn position
- `agents` - To reset agent positions
- `currentAgentInCombat` - Current enemy
- `inCombat` - Flag to set

**New constructor signature:**
```javascript
constructor({
    gameState,
    combatSystem,
    battleUI,
    player,
    spawnPosition: { x, y },
    callbacks: { onCombatEnd }
})
```

---

## DialogueManager Dependencies

**Currently uses from `this.game`:**
- `gameState` - For dialogue tracking
- `npcs` - Array of NPCs
- (Mostly self-contained)

**New constructor signature:**
```javascript
constructor({
    gameState,
    npcs,
    callbacks: { onSwitchRequest, onMinigameRequest }
})
```

---

## Implementation Strategy

**Order of refactoring:**
1. ✅ Create this dependency document
2. Start with **MapQuests** (simplest - only 3 deps)
3. Then **MapAI** (moderate - 5 deps)
4. Then **MapInteractions** (complex - many deps)
5. Then **BattleController**
6. Then **DialogueManager**
7. Update orchestrators to create their own subsystems
8. Update GameOrchestrator to pass minimal deps
9. Simplify game.js

**Testing after each step:**
- Load game
- Test affected features
- Verify no console errors
- Only proceed when working

---

## Benefits After Completion

```javascript
// ✅ Standalone battle test
const battle = new BattleOrchestrator({
    player: { name: "Opal", hp: 100, attack: 80 },
    enemy: { name: "Agent", hp: 75, attack: 60 },
    canvas, ctx, gameState
});
battle.start();

// ✅ Standalone dialogue test  
const dialogue = new DialogueOrchestrator({
    gameState,
    npcs: [{ id: 'alexis', name: 'Alexis' }]
});
dialogue.startDialogue('alexis');
```
