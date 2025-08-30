class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }
    
    create() {
        console.log('Menu Scene: Creating main menu');
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);
        
        // Title
        const title = this.add.text(width / 2, height / 4, 'ZOMBIE DRIVE & DUEL', {
            fontSize: '48px',
            color: '#e94560',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Subtitle
        this.add.text(width / 2, height / 4 + 60, 'Drive, Fight, Survive', {
            fontSize: '18px',
            color: '#f5f5f5',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Menu buttons
        this.createMenuButtons();
        
        // Stats display
        this.createStatsDisplay();
        
        // Initialize audio
        const audioManager = this.registry.get('audioManager');
        if (audioManager) {
            audioManager.playMusic('menu');
        }
        
        // Add floating particles for atmosphere
        this.createMenuParticles();
    }
    
    createMenuButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const buttonY = height / 2 + 50;
        
        // Play button
        const playButton = this.add.rectangle(width / 2, buttonY, 200, 60, 0xe94560)
            .setInteractive()
            .setStrokeStyle(3, 0xc73650);
            
        const playText = this.add.text(width / 2, buttonY, 'PLAY', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        playButton.on('pointerdown', () => {
            this.startGame();
        });
        
        playButton.on('pointerover', () => {
            playButton.setScale(1.05);
            this.tweens.add({
                targets: playButton,
                alpha: 0.8,
                duration: 100
            });
        });
        
        playButton.on('pointerout', () => {
            playButton.setScale(1.0);
            playButton.setAlpha(1.0);
        });
        
        // Garage button
        const garageButton = this.add.rectangle(width / 2, buttonY + 80, 200, 50, 0x16213e)
            .setInteractive()
            .setStrokeStyle(2, 0xe94560);
            
        const garageText = this.add.text(width / 2, buttonY + 80, 'GARAGE', {
            fontSize: '20px',
            color: '#e94560',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        garageButton.on('pointerdown', () => {
            this.scene.start('GarageScene');
        });
        
        garageButton.on('pointerover', () => {
            garageButton.setScale(1.05);
        });
        
        garageButton.on('pointerout', () => {
            garageButton.setScale(1.0);
        });
        
        // Settings button (placeholder)
        const settingsButton = this.add.rectangle(width / 2, buttonY + 140, 160, 40, 0x424242)
            .setInteractive()
            .setStrokeStyle(2, 0x616161);
            
        const settingsText = this.add.text(width / 2, buttonY + 140, 'SETTINGS', {
            fontSize: '16px',
            color: '#f5f5f5',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        settingsButton.on('pointerdown', () => {
            this.toggleAudio();
        });
    }
    
    createStatsDisplay() {
        const width = this.cameras.main.width;
        
        // High score
        const highScore = this.registry.get('highScore') || 0;
        this.add.text(50, 50, `HIGH SCORE: ${highScore}m`, {
            fontSize: '18px',
            color: '#f5f5f5',
            fontFamily: 'Arial'
        });
        
        // Coins
        const coins = this.registry.get('coins') || 0;
        this.add.text(width - 200, 50, `COINS: ${coins}`, {
            fontSize: '18px',
            color: '#ffd700',
            fontFamily: 'Arial'
        });
        
        // Controls help
        const controlsText = [
            'DESKTOP CONTROLS:',
            'A/D or Arrow Keys - Drive',
            'W or Up - Jump',
            'E - Exit/Enter Car',
            'J - Punch, K - Kick'
        ];
        
        controlsText.forEach((text, index) => {
            this.add.text(50, 450 + index * 20, text, {
                fontSize: '14px',
                color: '#cccccc',
                fontFamily: 'Arial'
            });
        });
    }
    
    createMenuParticles() {
        // Simple floating particles for atmosphere
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * this.cameras.main.width;
            const y = Math.random() * this.cameras.main.height;
            
            const particle = this.add.circle(x, y, 2, 0xe94560, 0.3);
            
            this.tweens.add({
                targets: particle,
                y: y - 100,
                alpha: 0,
                duration: 3000 + Math.random() * 2000,
                repeat: -1,
                yoyo: false,
                onComplete: () => {
                    particle.y = this.cameras.main.height + 20;
                    particle.alpha = 0.3;
                }
            });
        }
    }
    
    startGame() {
        console.log('Starting game...');
        
        const audioManager = this.registry.get('audioManager');
        if (audioManager) {
            audioManager.playSound('ui_click');
            audioManager.stopMusic();
        }
        
        // Reset game state
        this.registry.set('gameDistance', 0);
        this.registry.set('gameCoins', 0);
        this.registry.set('currentMode', 'car'); // 'car' or 'foot'
        
        // Start game scene
        this.scene.start('GameScene');
        this.scene.launch('UIScene');
    }
    
    toggleAudio() {
        const audioManager = this.registry.get('audioManager');
        if (audioManager) {
            audioManager.toggleMute();
        }
    }
}
