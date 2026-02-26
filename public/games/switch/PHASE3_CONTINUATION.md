# Phase 3 Refactoring - Continuation Prompt

## Context: Switch Game Codebase Refactoring

You are working on a Homestuck-inspired browser game located at `public/games/switch/`. The codebase has undergone Phases 1 & 2 of a major refactoring and is now ready for Phase 3 architecture improvements.

---

## ✅ COMPLETED WORK (Phases 1 & 2)

### Phase 1: File Organization
- **Created `battle/` folder** with 7 files:
  - `battleAI.js` - Enemy move selection logic
  - `battleCombat.js` - Core combat system (renamed from `combat.js`)
  - `battleCombatData.js` - Stats, moves, abilities (renamed from `combat_data.js`)
  - `battleController.js` - Combat flow orchestration
  - `battleUI.js` - Battle user interface (1,323 lines)
  - `battleAnimations.js` - Battle animations
  - `battleTextRenderer.js` - Text rendering utilities

- **Created `map/` folder** with 6 files:
  - `mapCharacters.js` - Character definitions (renamed from `characters.js`)
  - `mapData.js` - Map tiles and room data
  - `mapMiniGames.js` - Mini-games (renamed from `minigames.js`)
  - `mapRenderer.js` - Game rendering (renamed from `gameRenderer.js`)
  - `mapEnding.js` - Ending manager (renamed from `ending.js`)
  - `mapAudio.js` - Audio system (renamed from `audio.js`)

- **Created `dialogue/` folder** with 5 files (split from 863-line `dialogue.js`):
  - `dialogueLogic.js` - DialogueManager class + helper functions
  - `dialogueTalkTo.js` - Character-to-character dialogues
  - `dialogueSwitchCharacter.js` - Character switching dialogues
  - `dialogueEncounter.js` - Agent encounter dialogues
  - `dialogueSpecial.js` - Special interactions (healing, stealing)

### Phase 2: Import & Reference Updates
- ✅ Updated all imports in `game.js`
- ✅ Updated all script tags in `index.html`
- ✅ Integrated `BattleAI` into `battleController.js`
- ✅ Stored `battleController` in `gameState` for cross-system access
- ✅ Fixed battle victory bug (properly calls `battleUI.hide()`)
- ✅ Removed all debug console.log statements (🔥 🎯 🎉 🎊 emojis)

### Current File Structure:
```
public/games/switch/
├── index.html
├── game.js (2,536 lines)
├── bitmapFont.js
├── battle/ (7 files) ✅
├── dialogue/ (5 files) ✅
└── map/ (6 files) ✅
```

---

## 🚨 CRITICAL ISSUE TO FIX (Phase 3.1)

### **Duplicate Combat Logic in battleUI.js**

**Problem:** `battleUI.js` contains ~200 lines of combat handling code that duplicates and conflicts with `battleController.js`:

1. **Lines 969-1058:** `handleAction(action)` method
   - Handles STRIFE combat actions ('aggrieve', 'assault', etc.)
   - Executes combat, detects victory/defeat
   - Calls victory animations
   - **This is duplicate logic that conflicts with battleController!**

2. **Lines 1060-1130:** `executeEnemyStrifeTurn()` method
   - Handles enemy turn logic
   - Uses random move selection (should use BattleAI)
   - **Also duplicate logic!**

3. **Line 902:** `this.handleAction(action)` called from button click handler

**Impact:**
- Two code paths try to handle combat = confusion and bugs
- Recent bug (victory screen not dismissing) was caused by this duplication
- Hard to maintain and debug

---

## 🎯 PHASE 3.1 TASK: Remove Duplicate Combat Logic

### Goal:
Move ALL combat flow logic to `battleController.js`. Keep ONLY UI rendering/animations in `battleUI.js`.

### Step-by-Step Plan:

#### **Step 1: Add `useStrifeAction()` method to battleController.js**

Location: After `useCombatMove()` method (around line 200)

```javascript
useStrifeAction(action) {
    this.game.battleUI.currentPhase = 'animating';
    this.game.battleUI.commandPrompt = '==> Engaging in STRIFE...';
    this.game.battleUI.render();

    const player = this.game.combatSystem.player;
    const enemy = this.game.combatSystem.enemy;

    setTimeout(() => {
        const playerName = player.name || player.id;
        const actionNames = {
            'aggrieve': 'AGGRIEVE',
            'assault': 'ASSAULT',
            'avenge': 'AVENGE',
            'assail': 'ASSAIL',
            'abjure': 'ABJURE',
            'apparate': 'APPARATE'
        };
        const actionName = actionNames[action] || action.toUpperCase();

        this.game.battleUI.commandPrompt = `==> ${playerName} used ${actionName}!`;
        this.game.battleUI.render();

        this.game.battleUI.playAttackAnimation(true, () => {
            const result = this.game.combatSystem.executeStrifeOption(action);

            if (result.success) {
                if (result.multiHitData && result.multiHitData.length > 0) {
                    const initialMessage = `${playerName} used ${actionName}!`;
                    this.game.battleUI.addLogMessage(initialMessage, '#0f0');

                    this.game.battleUI.waitForInput(() => {
                        this.game.battleUI.showMultiHitMessages(playerName, actionName, result.multiHitData, () => {
                            if (enemy.hp <= 0) {
                                this.game.combatSystem.inCombat = false;
                                setTimeout(() => {
                                    this.game.battleUI.playVictoryAnimation(() => {
                                        this.endCombat(true);
                                    });
                                }, 1000);
                                return;
                            }

                            this.executeEnemyTurn();
                        });
                    }, 5000);
                    return;
                }

                let message = result.damage > 0 
                    ? `${playerName} used ${actionName} for ${result.damage} damage`
                    : `${playerName} used ${actionName}!`;
                
                this.game.battleUI.addLogMessage(message, '#0f0');
            }

            this.game.battleUI.updateCombatData({
                player: this.game.combatSystem.player,
                enemy: this.game.combatSystem.enemy
            });

            if (enemy.hp <= 0) {
                this.game.combatSystem.inCombat = false;
                setTimeout(() => {
                    this.game.battleUI.playVictoryAnimation(() => {
                        this.endCombat(true);
                    });
                }, 1000);
                return;
            }

            this.game.battleUI.waitForInput(() => {
                this.executeEnemyTurn();
            });
        });
    }, 200);
}
```

#### **Step 2: Add callback setup in `startAgentCombat()`**

Add after line 29 (after `onMoveSelected` callback):

```javascript
this.game.battleUI.onStrifeAction = (action) => {
    this.useStrifeAction(action);
};
```

#### **Step 3: Delete duplicate methods from battleUI.js**

**DELETE entirely:**
- Lines 969-1058: `handleAction()` method
- Lines 1060-1130 (approximately): `executeEnemyStrifeTurn()` method

**Result:** Remove ~200 lines of duplicate combat logic

#### **Step 4: Update button handler in battleUI.js**

Change line 902 from:
```javascript
this.handleAction(action);
```

To:
```javascript
if (this.onStrifeAction) {
    this.onStrifeAction(action);
}
```

#### **Step 5: Test**
1. Start the game
2. Enter combat with an agent
3. Try all STRIFE actions
4. Verify victory screen works
5. Verify multi-hit attacks work
6. Verify defeat works

---

## 📋 REMAINING PHASES (After 3.1)

### Phase 3.2: Split battleUI.js (1,323 lines → 4 smaller files)
- Create `battleUIRendering.js` (rendering logic)
- Create `battleUIInput.js` (keyboard/mouse input)
- Refactor `battleUI.js` to orchestrate components

### Phase 3.3: Create GameCoordinator
- Central registry for all game systems
- Simplifies object access (no more `this.gameState.game.battleController`)

### Phase 3.4: Extract Game Constants
- Create `constants.js` for magic numbers
- TILE_SIZE, MAP_WIDTH, WAIT_TIMEOUT, etc.

### Phase 3.5: Add Interface Documentation
- JSDoc headers for all files
- Document dependencies and public methods

---

## 🔑 KEY FILE LOCATIONS

- **battleController.js**: `public/games/switch/battle/battleController.js`
- **battleUI.js**: `public/games/switch/battle/battleUI.js`
- **game.js**: `public/games/switch/game.js`
- **REFACTORING_PLAN.md**: `public/games/switch/REFACTORING_PLAN.md`

---

## 💡 IMPORTANT NOTES

1. **Test frequently** - Test after each major change
2. **Keep original game behavior** - Refactoring should not change gameplay
3. **Reference existing patterns** - Look at `useCombatMove()` as template for `useStrifeAction()`
4. **Single responsibility** - battleController handles combat flow, battleUI handles display
5. **Check line numbers** - They may have changed since this document was written

---

## 🎯 YOUR IMMEDIATE TASK

**Execute Phase 3.1: Remove Duplicate Combat Logic**

Follow the 5 steps above to move STRIFE combat handling from `battleUI.js` to `battleController.js`. This will eliminate the duplicate combat logic that has been causing bugs.

After completion, test thoroughly and then proceed to Phase 3.2 (splitting battleUI.js).

Good luck! The code is well-organized now and ready for these final architecture improvements.
