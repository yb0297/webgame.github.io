// Main Phaser 3 Game Configuration
class ZombieDriveGame {
    constructor() {
        this.config = {
            type: Phaser.AUTO,
            width: 1024,
            height: 576,
            parent: 'game-container',
            canvas: document.getElementById('game-canvas'),
            backgroundColor: '#1a1a2e',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 800 },
                    debug: false
                }
            },
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: 1024,
                height: 576
            },
            scene: [
                BootScene,
                PreloadScene,
                MenuScene,
                GarageScene,
                GameScene,
                UIScene,
                PauseScene
            ],
            audio: {
                disableWebAudio: false
            },
            input: {
                keyboard: true,
                mouse: true,
                touch: true
            },
            render: {
                pixelArt: false,
                antialias: true
            }
        };
        
        this.game = new Phaser.Game(this.config);
        this.setupGlobalEventListeners();
    }
    
    setupGlobalEventListeners() {
        // Handle visibility change for performance
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.game.sound.pauseAll();
            } else {
                this.game.sound.resumeAll();
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.game.scale.refresh();
        });
        
        // Prevent context menu on right click
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // Prevent zoom on mobile
        document.addEventListener('touchmove', (e) => {
            if (e.scale !== 1) {
                e.preventDefault();
            }
        }, { passive: false });
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    const game = new ZombieDriveGame();
    
    // Hide loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
});

// Global game constants
const GAME_CONFIG = {
    WORLD_WIDTH: 3200,
    WORLD_HEIGHT: 576,
    GRAVITY: 800,
    PLAYER_SPEED: 200,
    CAR_SPEED: 300,
    JUMP_FORCE: -400,
    FUEL_CONSUMPTION_RATE: 1,
    ENEMY_SPAWN_RATE: 2000,
    COIN_VALUE: 10
};
