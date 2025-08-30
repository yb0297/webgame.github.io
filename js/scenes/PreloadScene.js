class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }
    
    preload() {
        console.log('Preload Scene: Loading assets');
        
        // Create loading progress display
        this.createLoadingDisplay();
        
        // Load sprites with fallbacks
        this.loadSprites();
        
        // Load backgrounds with fallbacks
        this.loadBackgrounds();
        
        // Initialize audio
        this.loadAudio();
        
        // Update loading progress
        this.load.on('progress', this.updateProgress, this);
        this.load.on('complete', this.onLoadComplete, this);
    }
    
    create() {
        console.log('Preload Scene: Assets loaded, starting menu');
        
        // Create procedural textures if assets failed to load
        this.createFallbackAssets();
        
        // Start menu scene
        this.scene.start('MenuScene');
    }
    
    createLoadingDisplay() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);
        
        // Title
        this.titleText = this.add.text(width / 2, height / 2 - 100, 'ZOMBIE DRIVE & DUEL', {
            fontSize: '36px',
            color: '#e94560',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Progress bar background
        this.progressBg = this.add.rectangle(width / 2, height / 2, 400, 20, 0x16213e);
        this.progressBg.setStrokeStyle(2, 0xe94560);
        
        // Progress bar fill
        this.progressBar = this.add.rectangle(width / 2 - 200, height / 2, 0, 16, 0xe94560);
        this.progressBar.setOrigin(0, 0.5);
        
        // Loading text
        this.loadingText = this.add.text(width / 2, height / 2 + 50, 'Loading... 0%', {
            fontSize: '18px',
            color: '#f5f5f5',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
    }
    
    loadSprites() {
        // Try to load actual sprite assets, with error handling
        this.load.on('loaderror', (file) => {
            console.warn(`Failed to load: ${file.key} from ${file.url}`);
        });
        
        // Player sprites
        this.load.image('player_idle', 'assets/sprites/player_idle.png');
        this.load.image('player_run', 'assets/sprites/player_run.png');
        
        // Car sprites
        this.load.image('car_body', 'assets/sprites/car_body.png');
        this.load.image('wheel', 'assets/sprites/wheel.png');
        
        // Enemy sprites
        this.load.image('zombie', 'assets/sprites/zombie.png');
        
        // Pickup sprites
        this.load.image('coin', 'assets/sprites/coin.png');
    }
    
    loadBackgrounds() {
        this.load.image('bg_far', 'assets/backgrounds/bg_far.png');
        this.load.image('bg_mid', 'assets/backgrounds/bg_mid.png');
        this.load.image('bg_near', 'assets/backgrounds/bg_near.png');
    }
    
    loadAudio() {
        // Audio will be handled by AudioManager with WebAudio synthesis
        console.log('Audio system will use WebAudio synthesis');
    }
    
    updateProgress(progress) {
        const percentage = Math.round(progress * 100);
        this.progressBar.width = 400 * progress;
        this.loadingText.setText(`Loading... ${percentage}%`);
    }
    
    onLoadComplete() {
        this.loadingText.setText('Loading Complete!');
        
        // Delay before starting menu
        this.time.delayedCall(500, () => {
            this.scene.start('MenuScene');
        });
    }
    
    createFallbackAssets() {
        // Create procedural textures for missing assets
        this.createPlayerSprites();
        this.createCarSprites();
        this.createEnemySprites();
        this.createPickupSprites();
        this.createBackgroundTextures();
    }
    
    createPlayerSprites() {
        if (!this.textures.exists('player_idle')) {
            const graphics = this.add.graphics();
            graphics.fillStyle(0x4CAF50); // Green
            graphics.fillRect(0, 0, 32, 48);
            graphics.fillStyle(0x2E7D32); // Darker green for details
            graphics.fillRect(8, 8, 16, 16); // Head
            graphics.generateTexture('player_idle', 32, 48);
            graphics.destroy();
        }
        
        if (!this.textures.exists('player_run')) {
            const graphics = this.add.graphics();
            graphics.fillStyle(0x4CAF50);
            graphics.fillRect(0, 0, 32, 48);
            graphics.fillStyle(0x2E7D32);
            graphics.fillRect(8, 8, 16, 16);
            graphics.generateTexture('player_run', 32, 48);
            graphics.destroy();
        }
    }
    
    createCarSprites() {
        if (!this.textures.exists('car_body')) {
            const graphics = this.add.graphics();
            graphics.fillStyle(0x2196F3); // Blue
            graphics.fillRect(0, 0, 80, 40);
            graphics.fillStyle(0x1976D2); // Darker blue for details
            graphics.fillRect(10, 5, 60, 10); // Windshield
            graphics.generateTexture('car_body', 80, 40);
            graphics.destroy();
        }
        
        if (!this.textures.exists('wheel')) {
            const graphics = this.add.graphics();
            graphics.fillStyle(0x424242); // Dark gray
            graphics.fillCircle(12, 12, 12);
            graphics.fillStyle(0x616161); // Lighter gray for rim
            graphics.fillCircle(12, 12, 8);
            graphics.generateTexture('wheel', 24, 24);
            graphics.destroy();
        }
    }
    
    createEnemySprites() {
        if (!this.textures.exists('zombie')) {
            const graphics = this.add.graphics();
            graphics.fillStyle(0x795548); // Brown
            graphics.fillRect(0, 0, 28, 40);
            graphics.fillStyle(0x5D4037); // Darker brown for details
            graphics.fillRect(6, 6, 16, 12); // Head
            graphics.fillStyle(0xF44336); // Red for zombie features
            graphics.fillRect(10, 10, 2, 2); // Eye 1
            graphics.fillRect(16, 10, 2, 2); // Eye 2
            graphics.generateTexture('zombie', 28, 40);
            graphics.destroy();
        }
    }
    
    createPickupSprites() {
        if (!this.textures.exists('coin')) {
            const graphics = this.add.graphics();
            graphics.fillStyle(0xFFD700); // Gold
            graphics.fillCircle(16, 16, 16);
            graphics.fillStyle(0xFFC107); // Darker gold for details
            graphics.fillCircle(16, 16, 12);
            graphics.generateTexture('coin', 32, 32);
            graphics.destroy();
        }
    }
    
    createBackgroundTextures() {
        if (!this.textures.exists('bg_far')) {
            const graphics = this.add.graphics();
            graphics.fillStyle(0x303F9F); // Dark blue
            graphics.fillRect(0, 0, 1024, 576);
            graphics.generateTexture('bg_far', 1024, 576);
            graphics.destroy();
        }
        
        if (!this.textures.exists('bg_mid')) {
            const graphics = this.add.graphics();
            graphics.fillStyle(0x3F51B5); // Medium blue
            graphics.fillRect(0, 0, 1024, 576);
            // Add some simple shapes for buildings/trees
            graphics.fillStyle(0x1A237E);
            for (let i = 0; i < 10; i++) {
                const x = i * 120;
                const height = 100 + Math.random() * 100;
                graphics.fillRect(x, 576 - height, 80, height);
            }
            graphics.generateTexture('bg_mid', 1024, 576);
            graphics.destroy();
        }
        
        if (!this.textures.exists('bg_near')) {
            const graphics = this.add.graphics();
            graphics.fillStyle(0x424242); // Gray for road
            graphics.fillRect(0, 400, 1024, 176);
            // Road lines
            graphics.fillStyle(0xFFFFFF);
            for (let i = 0; i < 20; i++) {
                graphics.fillRect(i * 60, 480, 30, 4);
            }
            graphics.generateTexture('bg_near', 1024, 576);
            graphics.destroy();
        }
    }
}
