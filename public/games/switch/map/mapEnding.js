export class EndingManager {
    constructor(game) {
        this.game = game;
        this.glitchFrozenCanvas = null;
        this.glitchScratchCanvas = null;
        this.glitchStuckCells = [];
        this.glitchOverlayIntervalId = null;
        this.scrambleActive = false;
        this._nextScrambleAt = null;
        this._origPositions = null;
        this._sceneTimer = null;
        this._scrambleTimeout = null;
        this._initialScrambleDelay = null;
    }

    triggerGlitchEnding() {
        if (this.game.questLogic) {
            this.game.questLogic.completeQuest('play_victor_ending');
        }

        const victorChar = CHARACTERS['victor'];
        if (victorChar && this.game.gameState.currentCharacter !== 'victor') {
            this.game.gameState.currentCharacter = 'victor';
            this.game.gameState.unlockCharacter('victor');

            const savedPos = this.game.gameState.characterPositions['victor'];
            if (savedPos) {
                this.game.player.x = savedPos.x;
                this.game.player.y = savedPos.y;
            }

            this.game.updateCharacterUI();
            this.game.applyCharacterTheme(victorChar);

            setTimeout(() => {
                this.startGlitchSequence();
            }, 500);
        } else {
            this.startGlitchSequence();
        }
    }

    startGlitchSequence() {
        this.game.isGameRunning = false;
        this.game.isGlitching = true;

        if (this.game.audioManager && typeof this.game.audioManager.playCharacterMusic === 'function') {
            this.game.audioManager.playCharacterMusic('victor');
        }

        if (this.game.glitchOverlay) this.game.glitchOverlay.style.display = 'block';

        this.addRealityBreakEffects();

        this.startGlitchEffect();

        this.runGlitchLoop();
    }

    addRealityBreakEffects() {
        if (this.game.canvas) {
            this.game.canvas.style.animation = 'glitch-shake 0.3s infinite';
        }

        const colorShiftInterval = setInterval(() => {
            if (!this.game.isGlitching) {
                clearInterval(colorShiftInterval);
                return;
            }

            const hue = Math.random() * 360;
            if (this.game.canvas) {
                this.game.canvas.style.filter = `hue-rotate(${hue}deg) saturate(${1 + Math.random() * 0.5})`;
            }
        }, 200);

        const invertInterval = setInterval(() => {
            if (!this.game.isGlitching) {
                clearInterval(invertInterval);
                return;
            }

            if (Math.random() < 0.3) {
                if (this.game.canvas) {
                    this.game.canvas.style.filter = 'invert(1)';
                    setTimeout(() => {
                        if (this.game.canvas && this.game.isGlitching) {
                            this.game.canvas.style.filter = '';
                        }
                    }, 100);
                }
            }
        }, 400);

        const uiElements = [
            document.getElementById('currentCharacter'),
            document.getElementById('ui'),
            document.getElementById('dialogueBox')
        ];

        const uiGlitchInterval = setInterval(() => {
            if (!this.game.isGlitching) {
                clearInterval(uiGlitchInterval);
                return;
            }

            uiElements.forEach(el => {
                if (el && Math.random() < 0.4) {
                    el.style.transform = `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`;
                    setTimeout(() => {
                        if (el) el.style.transform = '';
                    }, 100);
                }
            });
        }, 300);
    }

    startGlitchEffect() {
        if (!this.glitchFrozenCanvas) this.glitchFrozenCanvas = document.createElement('canvas');
        this.glitchFrozenCanvas.width = this.game.canvas.width;
        this.glitchFrozenCanvas.height = this.game.canvas.height;
        const gfc = this.glitchFrozenCanvas.getContext('2d');
        gfc.drawImage(this.game.canvas, 0, 0);

        if (!this.glitchScratchCanvas) this.glitchScratchCanvas = document.createElement('canvas');
        const px = Math.max(2, this.game.glitchPixelSize || 4);
        this.glitchScratchCanvas.width = Math.max(1, Math.floor(this.game.canvas.width / px));
        this.glitchScratchCanvas.height = Math.max(1, Math.floor(this.game.canvas.height / px));

        const cells = [];
        const cellCount = 80;
        for (let i = 0; i < cellCount; i++) {
            const w = Math.floor(2 + Math.random() * 10);
            const h = Math.floor(2 + Math.random() * 10);
            const x = Math.floor(Math.random() * (this.game.canvas.width - w));
            const y = Math.floor(Math.random() * (this.game.canvas.height - h));
            cells.push({ x, y, w, h });
        }
        this.glitchStuckCells = cells;

        if (this.glitchOverlayIntervalId) {
            clearInterval(this.glitchOverlayIntervalId);
        }
        const patterns = [
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.6) 0 2px, rgba(0,0,0,0.0) 2px 4px)',
            'repeating-linear-gradient(90deg, rgba(255,0,0,0.3) 0 6px, rgba(0,255,0,0.3) 6px 12px, rgba(0,0,255,0.3) 12px 18px)',
            'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0) 60%)',
            'repeating-linear-gradient(180deg, rgba(255,255,0,0.35) 0 3px, rgba(255,0,255,0.35) 3px 6px, rgba(0,255,255,0.35) 6px 9px)'
        ];
        let pIndex = 0;
        this.glitchOverlayIntervalId = setInterval(() => {
            if (this.game.glitchOverlay) {
                this.game.glitchOverlay.style.backgroundImage = patterns[pIndex % patterns.length];
                pIndex++;
            }
        }, 120);
    }

    runGlitchLoop() {
        if (!this.game.isGlitching) return;
        this.renderGlitchFrame();

        const now = performance.now();
        if (!this._nextScrambleAt) this._nextScrambleAt = now + 1200;
        if (!this.scrambleActive && now >= this._nextScrambleAt) {
            this.startScrambleBurst();
        }

        requestAnimationFrame(() => this.runGlitchLoop());
    }

    startScrambleBurst() {
        this.scrambleActive = true;
        if (!this._origPositions) this._origPositions = {};
        this._origPositions.player = { x: this.game.player.x, y: this.game.player.y };
        this._origPositions.npcs = (this.game.npcs || []).map(n => ({ id: n.id, x: n.position.x, y: n.position.y }));

        if (typeof this._initialScrambleDelay !== 'number') this._initialScrambleDelay = 1500;

        const activeDuration = 2000;
        const restDuration = 5000;
        const perScene = 300;
        const sceneSteps = Math.max(1, Math.floor(activeDuration / perScene));

        const minDistance = 28;
        const clusterRadius = 70;
        const mapW = this.game.mapWidth || this.game.canvas.width;
        const mapH = this.game.mapHeight || this.game.canvas.height;
        const pad = 24;
        const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

        const participants = [
            { type: 'player', id: 'player', ref: this.game.player, orig: this._origPositions.player },
            ...((this.game.npcs || []).map(n => ({ type: 'npc', id: n.id, ref: n, orig: this._origPositions.npcs.find(o => o.id === n.id) })))
        ];

        let groupTargets = new Map();

        const computeSceneTargets = () => {
            const targets = new Map();
            const clusterCount = (participants.length > 3 && Math.random() < 0.5) ? 2 : 1;

            const anchors = [];
            const shuffled = participants.slice().sort(() => Math.random() - 0.5);
            for (const p of shuffled) { if (anchors.length >= clusterCount) break; anchors.push(p); }

            const centers = [];
            for (let i = 0; i < anchors.length; i++) {
                let tries = 20; let cx = 0; let cy = 0; let ok = false;
                while (tries-- > 0 && !ok) {
                    cx = clamp(Math.random() * mapW, pad, mapW - pad);
                    cy = clamp(Math.random() * mapH, pad, mapH - pad);
                    ok = true;
                    for (const c of centers) {
                        if (Math.hypot(c.x - cx, c.y - cy) < 150) { ok = false; break; }
                    }
                }
                centers.push({ x: cx, y: cy, anchor: anchors[i] });
            }

            const others = participants.filter(p => !anchors.includes(p));
            const buckets = centers.map(c => [c.anchor]);
            const shuffledOthers = others.slice().sort(() => Math.random() - 0.5);
            for (let i = 0; i < shuffledOthers.length; i++) {
                const idx = (i % centers.length);
                buckets[idx].push(shuffledOthers[i]);
            }

            for (let i = 0; i < buckets.length; i++) {
                const center = centers[i];
                const placed = [];
                for (const m of buckets[i]) {
                    let tries = 28; let pos = null;
                    while (tries-- > 0 && !pos) {
                        const angle = Math.random() * Math.PI * 2;
                        const r = (Math.random() ** 0.65) * clusterRadius;
                        const tx = clamp(center.x + Math.cos(angle) * r, pad, mapW - pad);
                        const ty = clamp(center.y + Math.sin(angle) * r, pad, mapH - pad);
                        let ok = true;
                        for (const p of placed) {
                            if (Math.hypot(p.x - tx, p.y - ty) < minDistance) { ok = false; break; }
                        }
                        if (ok) pos = { x: tx, y: ty };
                    }
                    if (!pos) pos = { x: center.x, y: center.y };
                    placed.push(pos);
                    targets.set(m, pos);
                }
            }
            return targets;
        };

        const applyTargets = () => {
            for (const [p, pos] of groupTargets.entries()) {
                if (p.type === 'player') { p.ref.x = pos.x; p.ref.y = pos.y; }
                else { p.ref.position.x = pos.x; p.ref.position.y = pos.y; }
                if (p.ref && typeof p.ref.direction === 'string') {
                    let nearest = null; let nd = Infinity;
                    for (const [q, qpos] of groupTargets.entries()) {
                        if (q === p) continue;
                        const d = Math.hypot(qpos.x - pos.x, qpos.y - pos.y);
                        if (d < nd) { nd = d; nearest = qpos; }
                    }
                    if (nearest) {
                        const dx = nearest.x - pos.x; const dy = nearest.y - pos.y;
                        if (Math.abs(dx) > Math.abs(dy)) p.ref.direction = dx < 0 ? 'left' : 'right';
                        else p.ref.direction = dy < 0 ? 'up' : 'down';
                    }
                }
            }
        };

        let microAnimId;
        let microFrame = 0;
        const microMotion = () => {
            if (!this.scrambleActive) return;
            microFrame++;
            for (const [p, center] of groupTargets.entries()) {
                const jitter = 3 + Math.sin(microFrame * 0.15) * 2;
                const angle = (microFrame * 0.1 + (p.ref.id ? p.ref.id.charCodeAt(0) : 0) * 0.5) % (Math.PI * 2);
                const nx = clamp(center.x + Math.cos(angle) * jitter, pad, mapW - pad);
                const ny = clamp(center.y + Math.sin(angle) * jitter, pad, mapH - pad);
                if (p.type === 'player') { p.ref.x = nx; p.ref.y = ny; }
                else { p.ref.position.x = nx; p.ref.position.y = ny; }

                if (microFrame % 20 === 0 && p.ref && typeof p.ref.direction === 'string') {
                    const dirs = ['up', 'down', 'left', 'right'];
                    p.ref.direction = dirs[Math.floor(Math.random() * dirs.length)];
                }
            }
            microAnimId = requestAnimationFrame(microMotion);
        };

        let step = 0;
        const runScene = () => {
            if (!this.scrambleActive) return;
            groupTargets = computeSceneTargets();
            applyTargets();

            if (groupTargets.size > 0) {
                let sumX = 0, sumY = 0, count = 0;
                for (const pos of groupTargets.values()) {
                    sumX += pos.x;
                    sumY += pos.y;
                    count++;
                }
                const centerX = sumX / count;
                const centerY = sumY / count;
                const targetCameraX = centerX - this.game.canvas.width / 2;
                const targetCameraY = centerY - this.game.canvas.height / 2;
                this.game.camera.x += (targetCameraX - this.game.camera.x) * 0.3;
                this.game.camera.y += (targetCameraY - this.game.camera.y) * 0.3;
            }

            if (this.game.glitchOverlay && step > 0) {
                this.game.glitchOverlay.style.opacity = '0.6';
                setTimeout(() => {
                    if (this.game.glitchOverlay) this.game.glitchOverlay.style.opacity = '0.3';
                }, 50);
            }

            step++;
            if (step < sceneSteps) {
                this._sceneTimer = setTimeout(runScene, perScene);
            }
        };

        runScene();
        microAnimId = requestAnimationFrame(microMotion);

        clearTimeout(this._scrambleTimeout);
        this._scrambleTimeout = setTimeout(() => {
            this.scrambleActive = false;
            if (this._sceneTimer) clearTimeout(this._sceneTimer);
            if (microAnimId) cancelAnimationFrame(microAnimId);
            this.game.player.x = this._origPositions.player.x;
            this.game.player.y = this._origPositions.player.y;
            for (const npc of (this.game.npcs || [])) {
                const orig = this._origPositions.npcs.find(o => o.id === npc.id);
                if (orig) { npc.position.x = orig.x; npc.position.y = orig.y; }
            }
            this.game.camera.x = this.game.player.x - this.game.canvas.width / 2;
            this.game.camera.y = this.game.player.y - this.game.canvas.height / 2;
            this._nextScrambleAt = performance.now() + restDuration;
        }, activeDuration);
    }

    renderGlitchFrame() {
        const ctx = this.game.ctx;
        if (!ctx) return;
        const scratch = this.glitchScratchCanvas && this.glitchScratchCanvas.getContext('2d');
        if (!scratch || !this.glitchFrozenCanvas) return;

        if (typeof this.game.render === 'function') {
            this.game.render();
        }

        const gfc = this.glitchFrozenCanvas.getContext('2d');
        if (gfc) {
            gfc.clearRect(0, 0, this.glitchFrozenCanvas.width, this.glitchFrozenCanvas.height);
            gfc.drawImage(this.game.canvas, 0, 0);
        }

        ctx.imageSmoothingEnabled = false;
        scratch.imageSmoothingEnabled = false;

        const sW = this.glitchScratchCanvas.width;
        const sH = this.glitchScratchCanvas.height;
        const jitterX = Math.floor(Math.random() * 8) - 4;
        const jitterY = Math.floor(Math.random() * 8) - 4;

        scratch.clearRect(0, 0, sW, sH);
        scratch.drawImage(this.glitchFrozenCanvas, jitterX, jitterY, this.game.canvas.width, this.game.canvas.height, 0, 0, sW, sH);
        ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        ctx.drawImage(this.glitchScratchCanvas, 0, 0, sW, sH, 0, 0, this.game.canvas.width, this.game.canvas.height);

        for (let i = 0; i < 10; i++) {
            const y = Math.floor(Math.random() * this.game.canvas.height);
            const h = Math.max(2, Math.floor(Math.random() * 12));
            const dx = Math.floor(Math.random() * 40) - 20;
            ctx.drawImage(this.glitchFrozenCanvas, 0, y, this.game.canvas.width, h, dx, y, this.game.canvas.width, h);
        }

        for (let i = 0; i < Math.min(40, this.glitchStuckCells.length); i++) {
            const cell = this.glitchStuckCells[i];
            ctx.drawImage(
                this.glitchFrozenCanvas,
                cell.x, cell.y, cell.w, cell.h,
                cell.x, cell.y, cell.w, cell.h
            );
        }
    }
}
