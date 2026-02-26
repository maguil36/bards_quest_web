export class BattleState {
    constructor(config = {}) {
        this.inCombat = false;
        this.currentAgent = null;
        
        this.playerCharacter = null;
        this.enemy = null;
        
        this.spawnPosition = config.spawnPosition || { x: 0, y: 0 };
        this.canEscape = config.canEscape !== false;
        
        this.turnCount = 0;
        this.damageDealt = 0;
        this.damageTaken = 0;
        this.battleStartTime = null;
    }
    
    startBattle(playerData, enemyData, agent) {
        this.inCombat = true;
        this.currentAgent = agent;
        this.playerCharacter = { ...playerData };
        this.enemy = { ...enemyData };
        this.turnCount = 0;
        this.damageDealt = 0;
        this.damageTaken = 0;
        this.battleStartTime = Date.now();
    }
    
    endBattle(result = {}) {
        const battleDuration = this.battleStartTime ? Date.now() - this.battleStartTime : 0;
        const battleSummary = {
            won: result.won || false,
            turnCount: this.turnCount,
            damageDealt: this.damageDealt,
            damageTaken: this.damageTaken,
            duration: battleDuration,
            escaped: result.escaped || false
        };
        
        this.inCombat = false;
        this.currentAgent = null;
        this.playerCharacter = null;
        this.enemy = null;
        this.turnCount = 0;
        this.damageDealt = 0;
        this.damageTaken = 0;
        this.battleStartTime = null;
        
        return battleSummary;
    }
    
    incrementTurn() {
        this.turnCount++;
    }
    
    recordDamageDealt(amount) {
        this.damageDealt += amount;
    }
    
    recordDamageTaken(amount) {
        this.damageTaken += amount;
    }
    
    getBattleSnapshot() {
        return {
            inCombat: this.inCombat,
            playerHealth: this.playerCharacter?.health || 0,
            playerMaxHealth: this.playerCharacter?.maxHealth || 0,
            enemyHealth: this.enemy?.health || 0,
            enemyMaxHealth: this.enemy?.maxHealth || 0,
            turnCount: this.turnCount,
            canEscape: this.canEscape,
            currentAgent: this.currentAgent
        };
    }
    
    isInCombat() {
        return this.inCombat;
    }
    
    getCurrentAgent() {
        return this.currentAgent;
    }
    
    setCurrentAgent(agent) {
        this.currentAgent = agent;
    }
}
