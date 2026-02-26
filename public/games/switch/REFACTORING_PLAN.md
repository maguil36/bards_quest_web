# File Reorganization Plan

## ✅ PHASE 1 & 2 COMPLETED

### Phase 1: Battle & Map Organization ✅
- ✅ Created `battle/` folder with all combat files
- ✅ Created `map/` folder with all world/rendering files
- ✅ Created `dialogue/` folder with 5 split files
- ✅ Renamed files for clarity (combat → battleCombat, etc.)
- ✅ Updated all imports in game.js and index.html
- ✅ Integrated BattleAI into battleController
- ✅ Fixed battle victory bug (battleUI.hide() properly called)
- ✅ Stored battleController in gameState for cross-system access

### Current File Structure:
```
public/games/switch/
├── index.html
├── game.js (2,536 lines)
├── bitmapFont.js
├── battle/
│   ├── battleAI.js ✅
│   ├── battleCombat.js ✅
│   ├── battleCombatData.js ✅
│   ├── battleController.js ✅
│   ├── battleUI.js ✅ (1,323 lines - NEEDS REFACTORING)
│   ├── battleAnimations.js ✅
│   └── battleTextRenderer.js ✅
├── dialogue/
│   ├── dialogueLogic.js ✅ (DialogueManager class)
│   ├── dialogueTalkTo.js ✅ (DIALOGUES const)
│   ├── dialogueSwitchCharacter.js ✅ (SWITCH_DIALOGUES const)
│   ├── dialogueEncounter.js ✅ (agent encounters)
│   └── dialogueSpecial.js ✅ (healing, stealing)
└── map/
    ├── mapCharacters.js ✅
    ├── mapData.js ✅
    ├── mapMiniGames.js ✅
    ├── mapRenderer.js ✅
    ├── mapEnding.js ✅
    └── mapAudio.js ✅
```

---

## 🚀 PHASE 3: CODE QUALITY & ARCHITECTURE IMPROVEMENTS

### Issues Identified:
1. ❌ **Duplicate Combat Logic** - battleUI.js has its own combat handling (lines ~969-1100) that conflicts with battleController.js
2. ❌ **Monolithic Files** - battleUI.js (1,323 lines), game.js (2,536 lines) are too large
3. ❌ **Unclear Ownership** - Multiple files handle same responsibilities
4. ❌ **Complex Reference Chains** - `this.gameState.game.battleController` type paths
5. ❌ **No Interface Documentation** - Hard to understand what each file exports/requires

---

## 📋 PHASE 3.1: Remove Duplicate Combat Logic from battleUI.js

**PRIORITY: HIGH** (This caused the victory screen bug!)

### Current Problem:
- `battleUI.js` has `handleAction()` method (lines ~969-1100)
- This duplicates combat flow logic in `battleController.js`
- Two code paths both try to handle combat = conflicts and bugs

### Action Plan:
1. **DELETE** the following from `battleUI.js`:
   - `handleAction()` method entirely
   - `executeEnemyStrifeTurn()` method
   - All STRIFE combat logic (lines ~969-1100)

2. **KEEP** only in `battleUI.js`:
   - UI rendering methods
   - Animation playback
   - Input handling (keyboard/mouse)
   - Display updates

3. **MOVE** all combat flow to `battleController.js`:
   - Decision making (which move to use)
   - Turn order management
   - Victory/defeat detection
   - Combat state transitions

### Result:
- ✅ Single source of truth for combat logic
- ✅ battleUI.js only handles visuals
- ✅ battleController.js handles all combat flow
- ✅ Easier to debug and maintain

---

## 📋 PHASE 3.2: Split battleUI.js into Smaller Files

**PRIORITY: MEDIUM**

### Current Size: 1,323 lines doing too much

### Proposed Split:

```
battle/
├── battleUI.js (200-300 lines)
│   └── Main orchestration, public API
│
├── battleUIRendering.js (300-400 lines)
│   ├── renderCombatDisplay()
│   ├── renderHealthBars()
│   ├── renderMoveButtons()
│   ├── renderCommandPrompt()
│   └── updateCombatData()
│
├── battleUIInput.js (200-300 lines)
│   ├── setupKeyboardNavigation()
│   ├── handleButtonClick()
│   ├── navigateButtons()
│   └── waitForInput()
│
├── battleUIAnimations.js ✅ (ALREADY EXISTS)
│   ├── playAttackAnimation()
│   ├── playVictoryAnimation()
│   ├── playIntroAnimation()
│   └── playDefeatAnimation()
│
└── battleTextRenderer.js ✅ (ALREADY EXISTS)
    ├── showMultiHitMessages()
    ├── addLogMessage()
    └── renderTextToCanvas()
```

### battleUI.js becomes:
```javascript
/**
 * BattleUI - Main battle UI orchestrator
 * Coordinates rendering, input, and animations
 */
import { BattleUIRendering } from './battleUIRendering.js';
import { BattleUIInput } from './battleUIInput.js';
import { BattleAnimations } from './battleAnimations.js';
import { BattleTextRenderer } from './battleTextRenderer.js';

class BattleUI {
    constructor(gameState) {
        this.gameState = gameState;
        this.rendering = new BattleUIRendering(this);
        this.input = new BattleUIInput(this);
        this.animations = new BattleAnimations();
        this.textRenderer = new BattleTextRenderer();
    }
    
    show() { /* ... */ }
    hide() { /* ... */ }
    render() { this.rendering.render(); }
    // Delegate to sub-components
}
```

### Benefits:
- ✅ Easier to find specific functionality
- ✅ Smaller files = faster to read and modify
- ✅ Clear responsibility per file
- ✅ Can test components independently

---

## 📋 PHASE 3.3: Create GameCoordinator for Central System Registry

**PRIORITY: MEDIUM**

### Current Problem:
Complex object access chains like:
```javascript
this.gameState.game.battleController.endCombat()
this.game.combatSystem.player.hp
this.game.battleUI.hide()
```

### Solution: Central Registry

Create `game/GameCoordinator.js`:
```javascript
/**
 * GameCoordinator - Central registry for all game systems
 * Provides clean access to any subsystem from anywhere
 */
class GameCoordinator {
    constructor() {
        this.systems = {};
    }
    
    register(name, instance) {
        this.systems[name] = instance;
    }
    
    get(name) {
        return this.systems[name];
    }
}

// Usage:
const coordinator = new GameCoordinator();
coordinator.register('battleController', battleController);
coordinator.register('combatSystem', combatSystem);
coordinator.register('battleUI', battleUI);

// Then anywhere:
coordinator.get('battleController').endCombat(true);
coordinator.get('battleUI').hide();
```

### Benefits:
- ✅ No more complex reference chains
- ✅ Single point to access any system
- ✅ Easy to mock for testing
- ✅ Clear system dependencies

---

## 📋 PHASE 3.4: Extract Game Constants

**PRIORITY: LOW**

Create `game/constants.js`:
```javascript
// Display Constants
export const TILE_SIZE = 32;
export const MAP_WIDTH = 5120;
export const MAP_HEIGHT = 5120;

// Timing Constants
export const WAIT_TIMEOUT = 5000;
export const VICTORY_ANIMATION_DELAY = 1000;
export const INPUT_WAIT_TIME = 300;
export const DEFEAT_RELOAD_DELAY = 2000;

// Combat Constants
export const MAX_HP = 100;
export const CRITICAL_HIT_MULTIPLIER = 1.5;
export const STAGE_MODIFIER_DURATION = 3;

// UI Constants
export const BUTTON_PADDING = 10;
export const HP_BAR_WIDTH = 200;
export const HP_BAR_HEIGHT = 20;
```

### Benefits:
- ✅ Single place to change values
- ✅ No magic numbers in code
- ✅ Easier to balance game
- ✅ Self-documenting

---

## 📋 PHASE 3.5: Add Clear Interface Documentation

**PRIORITY: LOW (but helpful)**

Add JSDoc-style headers to each file:

**Example for battleController.js:**
```javascript
/**
 * BattleController - Orchestrates combat flow and turn management
 * 
 * RESPONSIBILITIES:
 * - Initiates combat with agents
 * - Manages combat turns (player and enemy)
 * - Handles victory/defeat conditions
 * - Coordinates with battleUI for display
 * 
 * DEPENDENCIES:
 * - game (SwitchGame instance)
 * - game.combatSystem (PokemonCombatSystem)
 * - game.battleUI (BattleUI)
 * - game.battleAI (BattleAI)
 * 
 * PUBLIC METHODS:
 * - startAgentCombat(agent) - Begin combat with an agent
 * - useCombatMove(moveIndex) - Execute player's selected move
 * - executeEnemyTurn() - Execute enemy's turn
 * - endCombat(playerWon) - Clean up and exit combat
 * 
 * CALLED BY:
 * - game.js (collision detection with agents)
 * - battleUI.js (victory/defeat callbacks)
 */
export class BattleController { /* ... */ }
```

### Benefits:
- ✅ Quick understanding of file's role
- ✅ Easy to spot circular dependencies
- ✅ Helps with refactoring
- ✅ Onboarding documentation

---

## 📊 Implementation Order

### Step 1: Remove Duplicate Combat Logic ⚠️ HIGH PRIORITY
- Delete `handleAction()` from battleUI.js
- Ensure all combat flows through battleController.js
- Test combat still works

### Step 2: Split battleUI.js 📦 MEDIUM PRIORITY
- Create battleUIRendering.js
- Create battleUIInput.js
- Update battleUI.js to use components
- Test all UI functionality

### Step 3: Create GameCoordinator 🎯 MEDIUM PRIORITY
- Create GameCoordinator class
- Register all systems in game.js
- Update references to use coordinator
- Test system interactions

### Step 4: Extract Constants 📝 LOW PRIORITY
- Create constants.js
- Replace magic numbers
- Test game balance unchanged

### Step 5: Add Documentation 📚 LOW PRIORITY
- Add JSDoc headers to all files
- Document public interfaces
- Document dependencies

---

## Success Criteria

After Phase 3 completion:
- ✅ No duplicate combat logic
- ✅ All files under 500 lines
- ✅ Clear single responsibility per file
- ✅ Simple object access (via coordinator)
- ✅ All magic numbers replaced with constants
- ✅ Every file has interface documentation
- ✅ All tests pass
- ✅ Game plays identically to before

---

## Risk Assessment

**LOW RISK:**
- Extract constants (doesn't change logic)
- Add documentation (doesn't change code)

**MEDIUM RISK:**
- Split battleUI.js (lots of code movement)
- Create GameCoordinator (changes many references)

**HIGH RISK:**
- Remove duplicate combat logic (must ensure no breaks)

**Mitigation:**
- Test after each step
- Make small incremental changes
- Keep git commits granular
- User tests after each major change
