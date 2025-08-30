// Minimal Phaser 3 Game Configuration to isolate runtime errors
class MinimalBootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }
    
    create() {
        console.log('Minimal Boot Scene: Starting initialization');
        
        // Set minimal game constants
        this.registry.set('gameConfig', {
            WORLD_WIDTH: 3200,
            WORLD_HEIGHT: 576,
            GRAVITY: 800,
            PLAYER_SPEED: 200,
            CAR_SPEED: 300,
            JUMP_FORCE: -400
        });
        
        // Set minimal registry values
        this.registry.set('coins', 0);
        this.registry.set('upgrades', {});
        this.registry.set('highScore', 0);
        
        console.log('Minimal Boot Scene: Registry initialized');
        
        // Start menu scene directly
        this.scene.start('MenuScene');
    }
}

class MinimalMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }
    
    create() {
        console.log('Minimal Menu Scene: Creating simple menu');
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);
        
        // Title
        this.add.text(width / 2, height / 4, 'ZOMBIE DRIVE & DUEL', {
            fontSize: '48px',
            color: '#e94560',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Simple play button
        const playButton = this.add.rectangle(width / 2, height / 2, 200, 60, 0xe94560)
            .setInteractive();
            
        const playText = this.add.text(width / 2, height / 2, 'PLAY', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        playButton.on('pointerdown', () => {
            console.log('Play button clicked - minimal test successful!');
            // Don't start game yet, just show success
            this.add.text(width / 2, height / 2 + 100, 'Game systems loading...', {
                fontSize: '18px',
                color: '#00ff00',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
        });
        
        playButton.on('pointerover', () => {
            playButton.setScale(1.05);
        });
        
        playButton.on('pointerout', () => {
            playButton.setScale(1.0);
        });
        
        console.log('Minimal Menu Scene: Menu created successfully');
    }
}

// Minimal game configuration
const minimalConfig = {
    type: Phaser.AUTO,
    width: 1024,
    height: 576,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    scene: [
        MinimalBootScene,
        MinimalMenuScene
    ],
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
    }
};

// Initialize minimal game
window.addEventListener('load', () => {
    console.log('Starting minimal game test...');
    const minimalGame = new Phaser.Game(minimalConfig);
    
    // Hide loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
    
    console.log('Minimal game initialized successfully');
});