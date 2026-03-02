export class BattleAudio {
    constructor() {
        this.audio = new Audio();
        this.currentTrack = null;
        this.volume = 0.5;
        this.isMuted = false;
        this.isEnabled = true;
        this.loopStart = 0;
        this.loopEnd = 0;
        this.loopBackTo = 0;
        this.isLooping = false;
        this.hasStarted = false;

        this.audio.volume = this.volume;
        this.audio.preload = 'auto';

        this.audio.addEventListener('timeupdate', () => {
            if (this.isLooping && this.audio.currentTime >= this.loopEnd) {
                const backToTime = this.loopBackTo > 0 ? this.loopBackTo : this.loopStart;
                this.audio.currentTime = backToTime;
                this.hasStarted = true;
            }
        });
    }
    
    playEnemyMusic(enemyId) {
        console.log('[BattleAudio] playEnemyMusic called with enemyId:', enemyId);
        if (this.isMuted) {
            console.log('[BattleAudio] Audio is muted, not playing');
            return;
        }

        const musicConfig = this.getEnemyMusicConfig(enemyId);
        console.log('[BattleAudio] Music config:', musicConfig);
        if (!musicConfig) {
            console.warn('[BattleAudio] No music config found for enemy:', enemyId);
            return;
        }

        const { track, loopStart, loopEnd, loopBackTo } = musicConfig;
        const nextTrack = `audio/${track}`;

        console.log('[BattleAudio] Playing track:', nextTrack, 'start:', loopStart, 'loop:', loopEnd, 'back to:', loopBackTo || loopStart);

        if (this.currentTrack !== nextTrack) {
            this.currentTrack = nextTrack;
            this.audio.src = nextTrack;
            this.loopStart = loopStart;
            this.loopEnd = loopEnd;
            this.loopBackTo = loopBackTo || 0;
            this.isLooping = true;
            this.hasStarted = false;

            this.audio.currentTime = loopStart;

            const playPromise = this.audio.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch((err) => {
                    console.error('[BattleAudio] Play failed:', err);
                });
            }
        }
    }
    
    getEnemyMusicConfig(enemyId) {
        const configs = {
            'derseAgent': {
                track: 'vs_derse_agent.mp3',
                loopStart: 67,
                loopEnd: 181,
                loopBackTo: 76
            },
            'derseGuard': {
                track: 'vs_derse_agent.mp3',
                loopStart: 67,
                loopEnd: 181,
                loopBackTo: 76
            },
            'derseArchagent': {
                track: 'vs_derse_archagent.mp3',
                loopStart: 54,
                loopEnd: 176
            },
            'dd': {
                track: 'vs_derse_midnight_archagents.mp3',
                loopStart: 28,
                loopEnd: 119,
                loopBackTo: 35
            },
            'cd': {
                track: 'vs_derse_midnight_archagents.mp3',
                loopStart: 28,
                loopEnd: 119,
                loopBackTo: 35
            },
            'hb': {
                track: 'vs_derse_midnight_archagents.mp3',
                loopStart: 28,
                loopEnd: 119,
                loopBackTo: 35
            },
            'ss': {
                track: 'vs_derse_midnight_archagents.mp3',
                loopStart: 28,
                loopEnd: 119,
                loopBackTo: 35
            }
        };

        return configs[enemyId] || {
            track: 'vs_derse_agent.mp3',
            loopStart: 67,
            loopEnd: 181,
            loopBackTo: 76
        };
    }
    
    stopMusic() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.currentTrack = null;
        this.isLooping = false;
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (!this.isMuted) {
            this.audio.volume = this.volume;
        }
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.audio.volume = this.isMuted ? 0 : this.volume;
    }
}
