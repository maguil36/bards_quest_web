import { BattleOrchestrator } from './BattleOrchestrator.js';
import { BattleController } from './battleController.js';
import { PokemonCombatSystem } from './battleCombat.js';
import { BattleUI } from './battleUI.js';
import { GameState } from '../gameState.js';

export class StandaloneBattle {
    constructor(config = {}) {
        this.canvas = config.canvas || document.getElementById('gameCanvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        
        this.gameState = config.gameState || new GameState();
        
        this.combatSystem = new PokemonCombatSystem(this.gameState);
        this.battleUI = new BattleUI(this.gameState);
        
        const spawnPosition = config.spawnPosition || { x: 400, y: 300 };
        
        this.battleController = new BattleController({
            gameState: this.gameState,
            battleUI: this.battleUI,
            combatSystem: this.combatSystem,
            player: { x: spawnPosition.x, y: spawnPosition.y },
            spawnPosition: spawnPosition,
            getInCombat: () => this.battleOrchestrator.isInCombat(),
            setInCombat: (value) => {},
            getCurrentAgent: () => this.battleOrchestrator.battleState.getCurrentAgent(),
            setCurrentAgent: (agent) => this.battleOrchestrator.battleState.setCurrentAgent(agent),
            callbacks: {
                updateQuestUI: config.onQuestUpdate || (() => {}),
                showFloatingText: config.onFloatingText || ((x, y, text, color) => {
                    console.log(`Floating text at (${x}, ${y}): ${text}`);
                })
            }
        });
        
        this.battleOrchestrator = new BattleOrchestrator({
            gameState: this.gameState,
            combatSystem: this.combatSystem,
            battleUI: this.battleUI,
            battleController: this.battleController,
            spawnPosition: spawnPosition,
            canEscape: config.canEscape !== false,
            onVictory: (summary) => this.handleVictory(summary),
            onDefeat: (summary) => this.handleDefeat(summary),
            onEscape: () => this.handleEscape()
        });
        
        this.onVictoryCallback = config.onVictory;
        this.onDefeatCallback = config.onDefeat;
        this.onEscapeCallback = config.onEscape;
    }
    
    start(playerCharId = 'opal', enemyId = 'derseAgent') {
        this.battleOrchestrator.startBattle({
            playerName: playerCharId,
            enemyName: enemyId,
            agent: null
        });

        console.log(`🎮 Standalone Battle Started: ${playerCharId} vs ${enemyId}`);
    }
    
    handleVictory(summary) {
        console.log('🎉 Battle Won!', summary);
        console.log(`  - Turns: ${summary.turnCount}`);
        console.log(`  - Damage Dealt: ${summary.damageDealt}`);
        console.log(`  - Damage Taken: ${summary.damageTaken}`);
        console.log(`  - Duration: ${(summary.duration / 1000).toFixed(1)}s`);
        
        if (this.onVictoryCallback) {
            this.onVictoryCallback(summary);
        }
    }
    
    handleDefeat(summary) {
        console.log('💀 Battle Lost!', summary);
        console.log(`  - Turns: ${summary.turnCount}`);
        console.log(`  - Damage Dealt: ${summary.damageDealt}`);
        console.log(`  - Damage Taken: ${summary.damageTaken}`);
        console.log(`  - Duration: ${(summary.duration / 1000).toFixed(1)}s`);
        
        if (this.onDefeatCallback) {
            this.onDefeatCallback(summary);
        }
    }
    
    handleEscape() {
        console.log('🏃 Escaped from battle!');
        
        if (this.onEscapeCallback) {
            this.onEscapeCallback();
        }
    }
    
    getBattleState() {
        return this.battleOrchestrator.getBattleSnapshot();
    }
    
    isInCombat() {
        return this.battleOrchestrator.isInCombat();
    }
    
    pause() {
        this.battleOrchestrator.pause();
    }
    
    resume() {
        this.battleOrchestrator.resume();
    }
}

window.StandaloneBattle = StandaloneBattle;
