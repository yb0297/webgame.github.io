class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.audioContext = null;
        this.masterGain = null;
        this.sounds = new Map();
        this.music = new Map();
        this.currentMusic = null;
        this.isMuted = false;
        this.masterVolume = 0.7;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.8;
        
        this.initialize();
        console.log('AudioManager initialized');
    }
    
    initialize() {
        // Initialize Web Audio API
        this.initializeWebAudio();
        
        // Create synthesized sounds
        this.createSounds();
        
        // Create music loops
        this.createMusic();
    }
    
    initializeWebAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.masterVolume;
            
            console.log('Web Audio API initialized');
        } catch (error) {
            console.warn('Web Audio API not supported, falling back to HTML5 audio');
            this.audioContext = null;
        }
    }
    
    createSounds() {
        // Define sound effects with their synthesis parameters
        const soundDefinitions = {
            // UI Sounds
            ui_click: {
                type: 'tone',
                frequency: 800,
                duration: 0.1,
                attack: 0.01,
                decay: 0.09,
                volume: 0.3
            },
            
            // Player Sounds
            player_jump: {
                type: 'sweep',
                startFreq: 200,
                endFreq: 400,
                duration: 0.3,
                volume: 0.4
            },
            
            player_land: {
                type: 'noise',
                duration: 0.2,
                frequency: 150,
                volume: 0.3
            },
            
            player_hurt: {
                type: 'tone',
                frequency: 180,
                duration: 0.4,
                attack: 0.01,
                decay: 0.39,
                volume: 0.5
            },
            
            // Combat Sounds
            punch: {
                type: 'noise',
                duration: 0.15,
                frequency: 200,
                volume: 0.4
            },
            
            kick: {
                type: 'noise',
                duration: 0.2,
                frequency: 120,
                volume: 0.5
            },
            
            gun_shoot: {
                type: 'noise',
                duration: 0.1,
                frequency: 800,
                volume: 0.6
            },
            
            bullet_hit: {
                type: 'tone',
                frequency: 600,
                duration: 0.1,
                volume: 0.4
            },
            
            // Car Sounds
            car_jump: {
                type: 'sweep',
                startFreq: 150,
                endFreq: 300,
                duration: 0.4,
                volume: 0.5
            },
            
            car_land: {
                type: 'noise',
                duration: 0.3,
                frequency: 100,
                volume: 0.6
            },
            
            car_enter: {
                type: 'tone',
                frequency: 400,
                duration: 0.2,
                volume: 0.4
            },
            
            car_exit: {
                type: 'tone',
                frequency: 300,
                duration: 0.2,
                volume: 0.4
            },
            
            // Enemy Sounds
            zombie_attack: {
                type: 'noise',
                duration: 0.3,
                frequency: 180,
                volume: 0.4
            },
            
            zombie_hurt: {
                type: 'tone',
                frequency: 250,
                duration: 0.2,
                volume: 0.3
            },
            
            zombie_death: {
                type: 'sweep',
                startFreq: 300,
                endFreq: 100,
                duration: 0.6,
                volume: 0.4
            },
            
            // Pickup Sounds
            coin_pickup: {
                type: 'tone',
                frequency: 1000,
                duration: 0.2,
                attack: 0.01,
                decay: 0.19,
                volume: 0.5
            },
            
            // Special Sounds
            crush: {
                type: 'noise',
                duration: 0.4,
                frequency: 80,
                volume: 0.7
            },
            
            upgrade_purchase: {
                type: 'sweep',
                startFreq: 400,
                endFreq: 800,
                duration: 0.5,
                volume: 0.6
            },
            
            reload: {
                type: 'tone',
                frequency: 500,
                duration: 0.3,
                volume: 0.4
            }
        };
        
        // Generate sound buffers
        Object.entries(soundDefinitions).forEach(([name, params]) => {
            this.sounds.set(name, this.createSoundBuffer(params));
        });
        
        console.log('Synthesized sounds created:', this.sounds.size);
    }
    
    createSoundBuffer(params) {
        if (!this.audioContext) return null;
        
        const sampleRate = this.audioContext.sampleRate;
        const length = params.duration * sampleRate;
        const buffer = this.audioContext.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        
        switch (params.type) {
            case 'tone':
                this.generateTone(data, params, sampleRate);
                break;
            case 'noise':
                this.generateNoise(data, params, sampleRate);
                break;
            case 'sweep':
                this.generateSweep(data, params, sampleRate);
                break;
        }
        
        return buffer;
    }
    
    generateTone(data, params, sampleRate) {
        const frequency = params.frequency || 440;
        const attack = params.attack || 0.1;
        const decay = params.decay || 0.1;
        const attackSamples = attack * sampleRate;
        const decaySamples = decay * sampleRate;
        
        for (let i = 0; i < data.length; i++) {
            let amplitude = 1;
            
            // Envelope
            if (i < attackSamples) {
                amplitude = i / attackSamples;
            } else if (i > data.length - decaySamples) {
                amplitude = (data.length - i) / decaySamples;
            }
            
            data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * amplitude * (params.volume || 0.5);
        }
    }
    
    generateNoise(data, params, sampleRate) {
        const frequency = params.frequency || 1000;
        const filterStrength = 1000 / frequency; // Rough frequency control
        
        for (let i = 0; i < data.length; i++) {
            let amplitude = 1 - (i / data.length); // Fade out
            let noise = (Math.random() * 2 - 1) * amplitude * (params.volume || 0.5);
            
            // Simple low-pass filter
            if (i > 0) {
                noise = (noise + data[i - 1] * filterStrength) / (filterStrength + 1);
            }
            
            data[i] = noise;
        }
    }
    
    generateSweep(data, params, sampleRate) {
        const startFreq = params.startFreq || 200;
        const endFreq = params.endFreq || 800;
        const freqDiff = endFreq - startFreq;
        
        for (let i = 0; i < data.length; i++) {
            const progress = i / data.length;
            const frequency = startFreq + freqDiff * progress;
            const amplitude = 1 - progress; // Fade out
            
            data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * amplitude * (params.volume || 0.5);
        }
    }
    
    createMusic() {
        // Simple background music loops using oscillators
        const musicDefinitions = {
            menu: {
                tempo: 120,
                notes: [
                    { freq: 261.63, duration: 0.5 }, // C4
                    { freq: 329.63, duration: 0.5 }, // E4
                    { freq: 392.00, duration: 0.5 }, // G4
                    { freq: 523.25, duration: 0.5 }  // C5
                ]
            },
            
            game: {
                tempo: 140,
                notes: [
                    { freq: 196.00, duration: 0.25 }, // G3
                    { freq: 220.00, duration: 0.25 }, // A3
                    { freq: 246.94, duration: 0.25 }, // B3
                    { freq: 261.63, duration: 0.25 }  // C4
                ]
            }
        };
        
        Object.entries(musicDefinitions).forEach(([name, data]) => {
            this.music.set(name, data);
        });
        
        console.log('Music definitions created');
    }
    
    playSound(soundName) {
        if (this.isMuted || !this.audioContext) return;
        
        const buffer = this.sounds.get(soundName);
        if (!buffer) {
            console.warn(`Sound not found: ${soundName}`);
            return;
        }
        
        try {
            // Resume audio context if suspended (browser autoplay policy)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = buffer;
            gainNode.gain.value = this.sfxVolume;
            
            source.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            source.start();
            
            console.log(`Playing sound: ${soundName}`);
        } catch (error) {
            console.warn(`Failed to play sound ${soundName}:`, error);
        }
    }
    
    playMusic(musicName) {
        if (this.isMuted || !this.audioContext) return;
        
        this.stopMusic();
        
        const musicData = this.music.get(musicName);
        if (!musicData) {
            console.warn(`Music not found: ${musicName}`);
            return;
        }
        
        this.currentMusic = musicName;
        this.playMusicLoop(musicData);
        
        console.log(`Playing music: ${musicName}`);
    }
    
    playMusicLoop(musicData) {
        if (!this.audioContext || this.currentMusic === null) return;
        
        const noteTime = 60 / musicData.tempo; // Duration of each note
        let noteIndex = 0;
        
        const playNote = () => {
            if (this.currentMusic === null || this.isMuted) return;
            
            const note = musicData.notes[noteIndex];
            
            try {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.frequency.value = note.freq;
                oscillator.type = 'sine';
                
                gainNode.gain.value = this.musicVolume * 0.3; // Quiet background music
                gainNode.gain.setValueAtTime(this.musicVolume * 0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + note.duration);
                
                oscillator.connect(gainNode);
                gainNode.connect(this.masterGain);
                
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + note.duration);
                
                noteIndex = (noteIndex + 1) % musicData.notes.length;
            } catch (error) {
                console.warn('Failed to play music note:', error);
            }
            
            // Schedule next note
            setTimeout(playNote, noteTime * 1000);
        };
        
        playNote();
    }
    
    stopMusic() {
        this.currentMusic = null;
        console.log('Music stopped');
    }
    
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
        console.log('Master volume set to:', this.masterVolume);
    }
    
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        console.log('SFX volume set to:', this.sfxVolume);
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        console.log('Music volume set to:', this.musicVolume);
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.stopMusic();
        }
        
        console.log('Audio', this.isMuted ? 'muted' : 'unmuted');
    }
    
    // Enable audio after user interaction (browser autoplay policy)
    enableAudio() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                console.log('Audio context resumed');
            });
        }
    }
    
    destroy() {
        this.stopMusic();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        this.sounds.clear();
        this.music.clear();
        
        console.log('AudioManager destroyed');
    }
}
