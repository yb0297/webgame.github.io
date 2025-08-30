class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }
    
    preload() {
        // Create loading bar graphics
        this.createLoadingBar();
    }
    
    create() {
        console.log('Boot Scene: Starting game initialization');
        
        // Set global game constants
        this.registry.set('gameConfig', GAME_CONFIG);
        this.registry.set('playerStats', {
            health: 100,
            maxHealth: 100,
            meleeDamage: 25,
            speed: 200,
            jumpForce: -400
        });
        
        this.registry.set('carStats', {
            health: 100,
            maxHealth: 100,
            fuel: 100,
            maxFuel: 100,
            enginePower: 300,
            maxSpeed: 400,
            jumpForce: -350,
            armor: 0,
            fuelConsumptionRate: 1
        });
        
        // Initialize save manager
        this.saveManager = new SaveManager();
        this.registry.set('saveManager', this.saveManager);
        
        // Initialize audio manager
        this.audioManager = new AudioManager(this);
        this.registry.set('audioManager', this.audioManager);
        
        // Load saved data
        const savedData = this.saveManager.load('gameData');
        if (savedData) {
            console.log('Loaded save data:', savedData);
            this.registry.set('coins', savedData.coins || 0);
            this.registry.set('upgrades', savedData.upgrades || {});
            this.registry.set('highScore', savedData.highScore || 0);
        } else {
            this.registry.set('coins', 0);
            this.registry.set('upgrades', {});
            this.registry.set('highScore', 0);
        }
        
        // Proceed to preload scene
        this.scene.start('PreloadScene');
    }
    
    createLoadingBar() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Progress bar background
        const progressBg = this.add.rectangle(width / 2, height / 2, 400, 20, 0x16213e);
        progressBg.setStrokeStyle(2, 0xe94560);
        
        // Progress bar fill
        const progressBar = this.add.rectangle(width / 2 - 200, height / 2, 0, 16, 0xe94560);
        progressBar.setOrigin(0, 0.5);
        
        // Loading text
        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Initializing...', {
            fontSize: '24px',
            color: '#f5f5f5',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Animate loading bar
        this.tweens.add({
            targets: progressBar,
            width: 400,
            duration: 1000,
            ease: 'Power2'
        });
    }
}
