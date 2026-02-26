export class BattleAI {
    selectEnemyMove(enemy) {
        if (!enemy || !enemy.moves || enemy.moves.length === 0) {
            console.error('BattleAI: Invalid enemy or no moves available');
            return 0;
        }

        const moveIndex = Math.floor(Math.random() * enemy.moves.length);
        return moveIndex;
    }
}
