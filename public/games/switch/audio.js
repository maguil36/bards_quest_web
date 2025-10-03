 // Audio management system for the Switch game
class AudioManager {
    constructor() {
        this.backgroundMusic = document.getElementById('backgroundMusic');
        this.currentTrack = null;
        this.volume = 0.5;
        this.isMuted = false;
        this.isEnabled = true;
        this.isFading = false; // Track if music is currently fading out

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

        // Allow Victor's music to interrupt any fade-out (for the glitch ending)
        if (characterId === 'victor' && this.isFading) {
            this.isFading = false;
        }

        if (this.isFading) return;

        const audio = this.backgroundMusic;

        // Require a file named after the character id only (no legacy fallbacks)
        const nextTrack = `audio/${characterId}.mp3`;

        if (this.currentTrack !== nextTrack) {
            this.currentTrack = nextTrack;
            audio.src = nextTrack;
            // Restore volume when starting new track (in case it was lowered during fade)
            audio.volume = this.isMuted ? 0 : this.volume;
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

    // Fade out music over specified duration (in milliseconds), then stop
    fadeOutAndStop(duration = 2000) {
        if (this.isFading) return; // Already fading
        if (this.isMuted || this.backgroundMusic.paused) {
            // If already muted or paused, just stop immediately
            this.stopMusic();
            return;
        }

        this.isFading = true;
        const startVolume = this.backgroundMusic.volume;
        const startTime = Date.now();

        const fadeInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1.0);

            // Calculate new volume (linear fade from startVolume to 0)
            const newVolume = startVolume * (1 - progress);
            this.backgroundMusic.volume = Math.max(0, newVolume);

            // When fade is complete, stop the music
            if (progress >= 1.0) {
                clearInterval(fadeInterval);
                this.stopMusic();
                this.isFading = false;
                // Restore volume for next playback
                this.backgroundMusic.volume = this.isMuted ? 0 : this.volume;
            }
        }, 50); // Update every 50ms for smooth fade
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