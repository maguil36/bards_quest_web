 // Audio management system for the Switch game
class AudioManager {
    constructor() {
        this.backgroundMusic = document.getElementById('backgroundMusic');
        this.currentTrack = null;
        this.volume = 0.5;
        this.isMuted = false;
        this.isEnabled = true;

        // Initialize audio settings
        this.backgroundMusic.volume = this.volume;
        this.backgroundMusic.loop = true; // ensure looping
        this.backgroundMusic.preload = 'auto';
        try { this.backgroundMusic.crossOrigin = 'anonymous'; } catch (_) {}

        // Load settings from localStorage
        this.loadSettings();

        // Note: Do not disable audio on play() errors; browsers often block
        // autoplay until user interaction. We'll retry on user input.
        this.backgroundMusic.addEventListener('canplaythrough', () => {
            this.isEnabled = true;
        });
    }

    // Require a file named after the character id only (no legacy fallbacks)
    playCharacterMusic(characterId) {
        if (this.isMuted) return;

        const audio = this.backgroundMusic;

        // Require a file named after the character id only (no legacy fallbacks)
        const nextTrack = `audio/${characterId}.mp3`;

        if (this.currentTrack !== nextTrack) {
            this.currentTrack = nextTrack;
            audio.src = nextTrack;
        }

        // Attempt to play (may be blocked until user interaction)
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
                // Likely autoplay policy; do not disable audio.
                // Music will start on the next user interaction.
            });
        }
    }

    // Stop background music
    stopMusic() {
        this.backgroundMusic.pause();
        this.backgroundMusic.currentTime = 0;
        this.currentTrack = null;
    }

    // Set volume (0.0 to 1.0)
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.backgroundMusic.volume = this.isMuted ? 0 : this.volume;
        this.saveSettings();
    }

    // Get current volume
    getVolume() {
        return this.volume;
    }

    // Toggle mute
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.backgroundMusic.volume = this.isMuted ? 0 : this.volume;
        this.saveSettings();
        return this.isMuted;
    }

    // Check if muted
    isMutedState() {
        return this.isMuted;
    }

    // Enable/disable audio system
    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (!enabled) {
            this.stopMusic();
        }
        this.saveSettings();
    }

    // Check if audio is enabled
    isAudioEnabled() {
        return this.isEnabled;
    }

    // Save audio settings to localStorage
    saveSettings() {
        const settings = {
            volume: this.volume,
            isMuted: this.isMuted,
            isEnabled: this.isEnabled
        };
        localStorage.setItem('switchAudioSettings', JSON.stringify(settings));
    }

    // Load audio settings from localStorage
    loadSettings() {
        const settings = localStorage.getItem('switchAudioSettings');
        if (settings) {
            try {
                const data = JSON.parse(settings);
                this.volume = data.volume !== undefined ? data.volume : 0.5;
                this.isMuted = data.isMuted !== undefined ? data.isMuted : false;
                this.isEnabled = data.isEnabled !== undefined ? data.isEnabled : true;

                this.backgroundMusic.volume = this.isMuted ? 0 : this.volume;
            } catch (e) {
                console.warn('Failed to load audio settings:', e);
            }
        }
    }
}

// Keep an exported mapping for documentation or UI, but runtime uses the derived filenames
const MUSIC_THEMES = {
    alexis: { url: 'audio/alexis.mp3'}, // purple bard
    austine: { url: 'audio/austine.mp3'}, // 
    chloe: { url: 'audio/chloe.mp3'}, // pale rapture
    isabell: { url: 'audio/isabell.mp3'}, // 
    nicholas: { url: 'audio/nicholas.mp3'}, // checkmate
    opal: { url: 'audio/opal.mp3'}, // pilot light
    tyson: { url: 'audio/tyson.mp3'}, // indigo archer
    victor: { url: 'audio/victor.mp3'} // a;slidhoerg;oajksd;guei;vrghian;ifuvgh;i
};