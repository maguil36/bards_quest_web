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

        // Load settings from localStorage
        this.loadSettings();

        // Handle audio loading errors gracefully
        this.backgroundMusic.addEventListener('error', (e) => {
            console.warn('Audio loading error:', e);
            this.isEnabled = false;
        });

        this.backgroundMusic.addEventListener('canplaythrough', () => {
            this.isEnabled = true;
        });
    }

    // Play background music for a character
    playCharacterMusic(characterId) {
        if (!this.isEnabled || this.isMuted) return;

        const character = (typeof CHARACTERS !== 'undefined') ? CHARACTERS[characterId] : null;
        if (!character || !character.music) return;

        // Don't restart the same track
        if (this.currentTrack === character.music) return;

        this.currentTrack = character.music;
        this.backgroundMusic.src = character.music;

        // Play with error handling
        const playPromise = this.backgroundMusic.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn('Audio play failed:', error);
                this.isEnabled = false;
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

// Character-specific music themes (placeholder URLs - replace with actual files)
const MUSIC_THEMES = {
    breath: {
        url: 'audio/breath.mp3',
        description: 'Flowing, airy melody with wind instruments',
        tempo: 'Moderate',
        mood: 'Peaceful, liberating'
    },
    light: {
        url: 'audio/light.mp3',
        description: 'Bright, uplifting orchestral piece',
        tempo: 'Upbeat',
        mood: 'Optimistic, energetic'
    },
    time: {
        url: 'audio/time.mp3',
        description: 'Mysterious, clock-like rhythmic patterns',
        tempo: 'Variable',
        mood: 'Mysterious, contemplative'
    },
    space: {
        url: 'audio/space.mp3',
        description: 'Ambient cosmic tones and echoes',
        tempo: 'Slow',
        mood: 'Vast, curious'
    },
    heart: {
        url: 'audio/heart.mp3',
        description: 'Warm, emotive chords',
        tempo: 'Moderate',
        mood: 'Tender, passionate'
    },
    mind: {
        url: 'audio/mind.mp3',
        description: 'Clean, logical arpeggios',
        tempo: 'Steady',
        mood: 'Focused, analytical'
    },
    hope: {
        url: 'audio/hope.mp3',
        description: 'Rising melodic motifs',
        tempo: 'Upbeat',
        mood: 'Optimistic'
    },
    rage: {
        url: 'audio/rage.mp3',
        description: 'Intense, driving rhythms',
        tempo: 'Fast',
        mood: 'Righteous, fierce'
    }
};