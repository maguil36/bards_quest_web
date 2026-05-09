# TODO List

## Section 1: Map Changes
1. Create map assets. Draw them out, replace AI generated versions of these assets
2. Fill in map with puzzles, chests, and encounters
3. fill in map with chests
4. fill in map with encounters
5. create a failure ending, it should be the same as victors incomplete ending
6. Fix up the map quests
7. Implement map quest logic and checks 
8. Implement alternative ending check
9. ~~Fix bug when switching old character becomes a block~~ FIXED: ghost NPC sprite now uses sprites.characters[id] fallback so the starting character renders correctly instead of as a colored block
10. Fix quests to be backward compatiable if you have already completed their prerequists but haven't progressed far enough to meet that prequesite. 
11. Seperate ending with incomplete ending, ending will play an animation .mp4 file, while incomplete ending will display what happens when you swap to victor. The check it will preform to see if you have the ability to do the complete ending is it'll see if you have been on read/2/1 yet. If yes it'll display the complete ending else the static victor swap ending will play. When you arrive to this page you'll be given an option to start the game again.

## Section 2: Dialogue Changes
1. Write up dialogue
2. Draw character assets for images of characters during dialogue with one another
3. Alexis steal weapon special dialogue for isabela
4. moving character potraits into the stat page area
5. 

## Section 3: Combat Changes
~~Fix `isabelaUpgrade` wrong questProgress key: `battleCombat.js` read `questProgress.isabelaUpgrade` (always `undefined`) instead of `questProgress['isabela']?.completed` — Isabela's weapon upgrade condition could never activate~~ FIXED
~~Fix single-waypoint patrol crash: `updateAgentPatrol` computed `patrolIndex = patrolPath.length - 2 = -1` for a 1-waypoint path, causing `patrolPath[-1]` (undefined) on the next tick and silently breaking that agent's patrol permanently. One agent in `mapData.js` has `patrolPath: [[120, 80]]`. Fixed by returning early for paths shorter than 2 waypoints~~ FIXED
~~Fix `encounterStarted` never cleared: set to `true` when a chasing agent reaches the player but never reset — after escaping (Tyson reset) the agent would keep chasing but the encounter could never fire again. Now cleared in `BattleController.endCombat` on both victory and escape~~ FIXED
~~Fix fraymotif charge not saved in `PokemonCombatSystem.endCombat`: only `currentHp` was persisted — charge was silently dropped on any combat path that doesn't go through `BattleOrchestrator.endBattle` (e.g. `playerStrifeAction`, `executeFraymotif`). Now saves charge alongside HP~~ FIXED
~~Fix `upgradedPower` mutating shared move object: `executeMove` was writing `move.power = move.upgradedPower` directly onto the `STRIFE_OPTIONS` entry, permanently upgrading the power for all future battles even after the quest check. Fixed by spreading a local copy~~ FIXED
~~Fix strife stat changes never expiring: `changeStats` applied stage changes but never pushed to `stageModifiers`, so `decrementStageModifiers` had nothing to expire — all strife buffs/debuffs (ABUSE, ACCOST, AGGRESS, etc.) were permanent. Now pushes a 4-turn modifier record for each net stage change~~ FIXED
~~Fix `lowAccuracyHighDamage` (Nicholas / Light Destroyer) accuracy penalty never applied: ability doubled special damage but never halved accuracy — `checkAccuracy` ignored it entirely. Now halves `moveAccuracy` before stage multipliers are applied~~ FIXED
~~Fix `customEnemy` path in `initBattler` missing fields: named boss enemies were created without `stageModifiers`, `critStage`, or `weapon` — stage expiry was silently skipped, crit stage defaulted via `|| 0` masking the bug, and weapon-dependent logic had no weapon. Also switched `||` to `??` so a legitimate stat value of `0` is not replaced by base stats~~ FIXED
~~Fix Tactician ability quadrupling enemy debuffs: `changeStats` had two branches both multiplying stat changes for Austine — the `doubleStatChanges` check (×2) and a redundant `Tactician` check (×2 again) stacked to ×4 on enemy debuffs. Removed the redundant second branch~~ FIXED
~~Fix `nextAttackCrit` flag never consumed: set by `lucid_lament` fraymotif (`temporaryAccuracyCrit` effect) but never read — the guaranteed crit never fired. Fixed by checking and clearing `attacker.nextAttackCrit` at the top of `checkCritical`~~ FIXED
~~Fix `decrementStageModifiers` never called: stat stage changes from moves and fraymotifs were permanent — the function was defined but never invoked. Fixed by reworking it to revert expired stages back onto `battler.stages` and calling it for both player and enemy in `handleEndOfTurn`~~ FIXED
~~Fix `flinched` flag never consumed: `defender.flinched` was set by `blinding_bolero` fraymotif but never checked — the enemy always attacked even when flinched. Now `executeMove` checks and clears `attacker.flinched` at the top, skipping the move if true~~ FIXED
~~Fix unimplemented weapon abilities `tripleHit`, `critBoost`, and `sniper`: `tripleHit` weapons now hit 3 times in AGGRIEVE, `critBoost` weapons now raise player crit stage +1 on AGGRIEVE, `sniper` weapons now apply an additional 1.5× multiplier on crits in `calculateWeaponDamage`~~ FIXED
~~Fix `accuracyLowerAndFlinch` double-application in `battleCombatFrayMotif.js`: stat change and flinch were applied once in `executeStatusMove` and again in `applySecondaryEffects`, halving enemy accuracy twice~~ FIXED
~~Fix key casing mismatch: `STRIFE_OPTIONS.derseArchAgent` renamed to `derseArchagent` to match `CHARACTER_STATS`/`DEFAULT_WEAPONS`/audio keys (archagents were silently falling back to derseAgent moves)~~ FIXED
~~Fix `CHARACTER_BASE_HP` mismatches in `mapCharacters.js`: tyson was 311 (correct: 331), isabela was 282 (correct: 295)~~ FIXED
~~Fix `strifeAnnihilate` missing SP.ATK drop: tooltip said `-1 SP.ATK and -1 accuracy` but code only applied `-1 accuracy`~~ FIXED
1. Re-balance current combat
2. Add in more animations for combat
3. Fraymotif bar for within fraymotif UI
4. Draw sprites to fight one another
5. Add in victory sound, and add in victory text
6. Fix the text display for battling
7. Draw additional strife option boxes
8. Alchamy UI for Isabela
9. ~~Fix bug for shinning effect~~ FIXED: shine was measuring .actions bounding rect while mid-animation (fired at 3200ms, slide-in finishes at 3300ms); now fires at 3400ms, uses #combatUI containerRect.left+20 and hardcoded 227px button width
10. ~~Fix sequence for multi attack attacks~~ FIXED: each hit now shows "Hit for X damage!" (white), then summary "MOVENAME hit N times for X damage!" (green), matching Pokemon style; HP bar now stays at pre-attack value on initial message then drops incrementally per hit via updateCombatData snapshot before addLogMessage
11. Add tool tips for each strife option
12. Clean up Fraymotif UI
13. AI for enemies
14. Give enemies attacks/balance them
15. Additional fixes for combat bugs (ex fraymotifs not increasing stats)
16. perminate method to see stat changes, status effects
17. Fix battle text so that it scrolls like regular text
18. Godtiers obtain fraymotifs x2 faster
19. Fraymotif UI broken?
20. Fraymotif UI names much larger, hover over tooltip will convay  everything.
21. ~~Fraymotifs broken status effects not working, nor are special abilities from fraymotifs (ex: painsplit, fire vortex, ect)~~ FIXED: defenseDouble/regeneration/residualDamage now processed in handleEndOfTurn; vein_vibrato negativeStats now correctly targets enemy; blinding_bolero accuracyLowerAndFlinch now fires as secondary effect; Isabela endTurnHeal ability key casing fixed
