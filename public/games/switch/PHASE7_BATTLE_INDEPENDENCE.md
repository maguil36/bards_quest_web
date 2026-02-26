# Phase 7: Battle System Independence

## Goal
Make BattleOrchestrator fully independent from game.js, capable of running standalone with minimal inputs:
- **Who is in combat** (player character data)
- **Their current health** (combat stats)
- **Who they're fighting** (enemy/agent data)

## Current State Analysis

### Dependencies Found (168 references to `this.game.*` in BattleController)

**Core Dependencies:**
1. `this.game.gameState` - Character data, quest state, inventory
2. `this.game.combatSystem` - Combat logic, damage calculation, move execution
3. `this.game.battleUI` - UI rendering, animations, user input
4. `this.game.player` - Player position, respawn coordinates
5. `this.game.inCombat` - Combat state flag
6. `this.game.currentAgentInCombat` - Current enemy reference

**Callback Dependencies:**
- `this.game.updateQuestUI()` - Update quest progress after victory
- `this.game.showFloatingText()` - Show damage/status text on map

### Current Architecture
```
game.js (1,366 lines)
    ├─> Instantiates: PokemonCombatSystem, BattleUI, BattleController
    ├─> BattleOrchestrator (95 lines)
    │       └─> BattleController (426 lines)
    │               ├─> Uses: this.game.combatSystem (168 refs)
    │               ├─> Uses: this.game.battleUI (168 refs)
    │               └─> Uses: this.game.gameState
    └─> All systems tightly coupled to game instance
```

---

## Phase 7 Roadmap: Make BattleOrchestrator Fully Independent

### **Step 1: Refactor BattleController to Remove ALL `this.game.*` References**

**Current Problem:** Lines 39-392 in battleController.js use `this.game.*` extensively

**Solution:** Use only the dependency-injected properties already available:
- Replace `this.game.combatSystem` → `this.combatSystem`
- Replace `this.game.battleUI` → `this.battleUI`
- Replace `this.game.gameState` → `this.gameState`
- Replace `this.game.inCombat` → `this.getInCombat()` / `this.setInCombat()`
- Replace `this.game.currentAgentInCombat` → `this.getCurrentAgent()` / `this.setCurrentAgent()`

**Files to Modify:**
- `battle/battleController.js` (Lines 38-426)

**Expected Changes:** ~168 line modifications

**Benefit:** BattleController becomes fully independent, only uses injected dependencies

---

### **Step 2: Create BattleState Class (New)**

**Purpose:** Encapsulate all battle-specific state currently scattered in game.js

**Location:** `battle/BattleState.js`

**Responsibilities:**
```javascript
class BattleState {
    constructor(config) {
        // Combat state
        this.inCombat = false;
        this.currentAgent = null;
        
        // Participant data
        this.playerCharacter = null;  // { id, name, health, maxHealth, attack, defense, moves }
        this.enemy = null;            // { id, name, health, maxHealth, attack, defense, moves }
        
        // Battle context
        this.spawnPosition = config.spawnPosition || { x: 0, y: 0 };
        this.canEscape = config.canEscape !== false;
        
        // Result tracking
        this.turnCount = 0;
        this.damageDealt = 0;
        this.damageTaken = 0;
    }
    
    startBattle(playerData, enemyData, agent) {
        this.inCombat = true;
        this.currentAgent = agent;
        this.playerCharacter = { ...playerData };
        this.enemy = { ...enemyData };
        this.turnCount = 0;
    }
    
    endBattle() {
        this.inCombat = false;
        this.currentAgent = null;
        this.playerCharacter = null;
        this.enemy = null;
    }
    
    getBattleSnapshot() {
        return {
            inCombat: this.inCombat,
            playerHealth: this.playerCharacter?.health,
            enemyHealth: this.enemy?.health,
            turnCount: this.turnCount
        };
    }
}
```

**Benefit:** Clear separation of battle state from global game state

---

### **Step 3: Refactor BattleOrchestrator to Own Its Dependencies**

**Current Problem:** BattleOrchestrator receives `game` instance and extracts everything

**Solution:** BattleOrchestrator creates and owns its subsystems

**Before (Current):**
```javascript
class BattleOrchestrator extends BaseOrchestrator {
    constructor(game) {
        super();
        this.game = game;
        this.battleController = game.battleController;
        this.battleUI = game.battleUI;
        this.combatSystem = game.combatSystem;
    }
}
```

**After (Phase 7):**
```javascript
class BattleOrchestrator extends BaseOrchestrator {
    constructor(config) {
        super();
        
        // Create independent state
        this.battleState = new BattleState({
            spawnPosition: config.spawnPosition,
            canEscape: config.canEscape
        });
        
        // Create or receive dependencies
        this.gameState = config.gameState;  // Only need character data
        this.combatSystem = config.combatSystem || new PokemonCombatSystem(this.gameState);
        this.battleUI = config.battleUI || new BattleUI(this.gameState);
        
        // Create controller with clean dependencies
        this.battleController = new BattleController({
            gameState: this.gameState,
            battleUI: this.battleUI,
            combatSystem: this.combatSystem,
            battleState: this.battleState,
            callbacks: {
                onVictory: config.onVictory || (() => {}),
                onDefeat: config.onDefeat || (() => {}),
                onEscape: config.onEscape || (() => {})
            }
        });
    }
    
    // Public API - minimal inputs required
    startBattle(combatConfig) {
        // combatConfig = { player, enemy, agent, position }
        const playerData = {
            id: combatConfig.player.id,
            name: combatConfig.player.name,
            health: combatConfig.player.currentHp,
            maxHealth: combatConfig.player.maxHp,
            attack: combatConfig.player.attack,
            defense: combatConfig.player.defense,
            moves: combatConfig.player.moves
        };
        
        const enemyData = {
            id: 'derseAgent',
            name: 'Derse Agent',
            health: 75,
            maxHealth: 75,
            attack: 60,
            defense: 50
        };
        
        this.battleState.startBattle(playerData, enemyData, combatConfig.agent);
        this.emit('battleStart', { player: playerData, enemy: enemyData });
        this.battleController.startAgentCombat(combatConfig.agent);
    }
}
```

**Files to Create/Modify:**
- `battle/BattleState.js` (NEW)
- `battle/BattleOrchestrator.js` (REFACTOR)

**Benefit:** BattleOrchestrator has a clear, minimal API

---

### **Step 4: Create Standalone Battle Entry Point**

**Purpose:** Demonstrate full independence by allowing battles to run standalone

**Location:** `battle/StandaloneBattle.js` (NEW)

```javascript
import { BattleOrchestrator } from './BattleOrchestrator.js';
import { GameState } from '../gameState.js';

export class StandaloneBattle {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Minimal gameState just for character definitions
        this.gameState = new GameState();
        
        // Create independent battle orchestrator
        this.battleOrchestrator = new BattleOrchestrator({
            gameState: this.gameState,
            spawnPosition: { x: 400, y: 300 },
            onVictory: (result) => this.handleVictory(result),
            onDefeat: (result) => this.handleDefeat(result),
            onEscape: () => this.handleEscape()
        });
    }
    
    // Start battle with minimal data
    start(playerCharId = 'john', enemyType = 'derseAgent') {
        const player = this.gameState.characters[playerCharId];
        
        this.battleOrchestrator.startBattle({
            player: {
                id: player.id,
                name: player.name,
                currentHp: this.gameState.characters[playerCharId].currentHp,
                maxHp: 100,
                attack: 70,
                defense: 60,
                moves: player.moves
            },
            enemy: {
                type: enemyType
            },
            agent: null,  // No map agent in standalone
            position: null
        });
    }
    
    handleVictory(result) {
        console.log('Battle won!', result);
    }
    
    handleDefeat(result) {
        console.log('Battle lost!', result);
    }
    
    handleEscape() {
        console.log('Escaped from battle');
    }
}
```

**Usage Example:**
```javascript
// Standalone battle demo
const battle = new StandaloneBattle('gameCanvas');
battle.start('john');  // Start battle as John vs Derse Agent
```

**Benefit:** Proves battle system is fully independent and reusable

---

### **Step 5: Update GameOrchestrator to Use New Battle API**

**Current:** GameOrchestrator passes entire `game` instance

**After:** GameOrchestrator creates BattleOrchestrator with minimal config

**File:** `orchestration/GameOrchestrator.js`

```javascript
// In constructor
this.battleOrchestrator = new BattleOrchestrator({
    gameState: this.game.gameState,
    spawnPosition: { x: this.game.playerStartX, y: this.game.playerStartY },
    onVictory: (result) => {
        this.game.updateQuestUI();
        this.emit('battleVictory', result);
    },
    onDefeat: (result) => {
        this.emit('battleDefeat', result);
    },
    onEscape: () => {
        this.emit('battleEscape');
    }
});

// When starting battle
this.battleOrchestrator.startBattle({
    player: currentCharacter,
    enemy: { type: 'derseAgent' },
    agent: agent,
    position: { x: this.game.player.x, y: this.game.player.y }
});
```

**Benefit:** GameOrchestrator uses clean API, game.js completely bypassed for battles

---

## Summary: What Independence Achieves

### Before (Current):
```javascript
// To start a battle:
game.inCombat = true;
game.currentAgentInCombat = agent;
game.battleController.startAgentCombat(agent);
// BattleController reaches back into game for everything
```

### After (Phase 7):
```javascript
// To start a battle:
battleOrchestrator.startBattle({
    player: { id, name, health, maxHealth, attack, defense, moves },
    enemy: { type: 'derseAgent' },
    agent: agentRef,
    position: { x, y }
});
// BattleOrchestrator is self-contained, no game dependency
```

---

## Implementation Order

1. ✅ **Step 1:** Replace all `this.game.*` with injected properties in BattleController (~2 hours)
2. ✅ **Step 2:** Create BattleState class to encapsulate combat state (~1 hour)
3. ✅ **Step 3:** Refactor BattleOrchestrator to own dependencies (~1 hour)
4. ✅ **Step 4:** Create StandaloneBattle.js demo (~30 min)
5. ✅ **Step 5:** Update GameOrchestrator to use new API (~30 min)
6. ✅ **Testing:** Verify all battle scenarios work independently (~1 hour)

**Total Estimated Time:** ~6 hours of focused work

---

## Testing Checklist

- [ ] Start battle from map encounter
- [ ] Execute player moves (normal attacks)
- [ ] Execute strife actions (special moves)
- [ ] Enemy AI responds correctly
- [ ] Victory: quest updates, agent removed
- [ ] Defeat: game resets properly
- [ ] Escape (Tyson's time power)
- [ ] Failed escape (take damage)
- [ ] Standalone battle works without game.js
- [ ] Multiple battles in sequence

---

## Benefits of Full Independence

1. **Testability** - Can unit test battles without running entire game
2. **Reusability** - Battle system can be dropped into other projects
3. **Maintainability** - Clear boundaries, no hidden coupling
4. **Modularity** - Battles don't break when map/dialogue changes
5. **Performance** - Only loads battle assets when needed
6. **Scalability** - Easy to add new battle types (boss fights, tournaments)

---

## Future Extensions (Post-Phase 7)

Once BattleOrchestrator is independent:

- **Battle Replay System** - Record and replay battles
- **PvP Support** - Player vs player battles
- **Boss Battle Variants** - Special mechanics for boss fights
- **Battle Training Mode** - Practice against dummy enemies
- **Battle Statistics Dashboard** - Detailed analytics
- **Custom Battle Configs** - JSON-driven battle scenarios
