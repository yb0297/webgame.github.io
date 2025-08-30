class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' });
    }
    
    create() {
        console.log('Pause Scene: Creating pause menu');
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Semi-transparent overlay
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        
        // Pause container
        const pauseContainer = this.add.container(width / 2, height / 2);
        
        // Background panel
        const panel = this.add.rectangle(0, 0, 400, 300, 0x1a1a2e, 0.95);
        panel.setStrokeStyle(3, 0xe94560);
        pauseContainer.add(panel);
        
        // Pause title
        const title = this.add.text(0, -100, 'GAME PAUSED', {
            fontSize: '32px',
            color: '#e94560',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        pauseContainer.add(title);
        
        // Resume button
        const resumeButton = this.add.rectangle(0, -30, 200, 50, 0x4caf50)
            .setInteractive()
            .setStrokeStyle(2, 0x66bb6a);
        
        const resumeText = this.add.text(0, -30, 'RESUME', {
            fontSize: '20px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        pauseContainer.add(resumeButton);
        pauseContainer.add(resumeText);
        
        resumeButton.on('pointerdown', () => {
            this.resumeGame();
        });
        
        resumeButton.on('pointerover', () => {
            resumeButton.setScale(1.05);
        });
        
        resumeButton.on('pointerout', () => {
            resumeButton.setScale(1.0);
        });
        
        // Settings button
        const settingsButton = this.add.rectangle(0, 30, 180, 40, 0x424242)
            .setInteractive()
            .setStrokeStyle(2, 0x616161);
        
        const settingsText = this.add.text(0, 30, 'SETTINGS', {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        pauseContainer.add(settingsButton);
        pauseContainer.add(settingsText);
        
        settingsButton.on('pointerdown', () => {
            this.toggleAudio();
        });
        
        // Main menu button
        const menuButton = this.add.rectangle(0, 80, 180, 40, 0x616161)
            .setInteractive()
            .setStrokeStyle(2, 0x757575);
        
        const menuText = this.add.text(0, 80, 'MAIN MENU', {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        pauseContainer.add(menuButton);
        pauseContainer.add(menuText);
        
        menuButton.on('pointerdown', () => {
            this.returnToMenu();
        });
        
        menuButton.on('pointerover', () => {
            menuButton.setScale(1.05);
        });
        
        menuButton.on('pointerout', () => {
            menuButton.setScale(1.0);
        });
        
        // Control instructions
        const controlsText = this.add.text(0, 140, 'Press ESC to resume', {
            fontSize: '14px',
            color: '#cccccc',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        pauseContainer.add(controlsText);
        
        // Setup keyboard input for resume
        this.input.keyboard.on('keydown-ESC', () => {
            this.resumeGame();
        });
        
        // Animate pause menu
        pauseContainer.setScale(0);
        this.tweens.add({
            targets: pauseContainer,
            scale: 1,
            duration: 300,
            ease: 'Back.out'
        });
    }
    
    resumeGame() {
        console.log('Resuming game');
        
        const audioManager = this.registry.get('audioManager');
        if (audioManager) {
            audioManager.playSound('ui_click');
        }
        
        // Resume the game scene
        this.scene.resume('GameScene');
        this.scene.stop();
    }
    
    returnToMenu() {
        console.log('Returning to main menu');
        
        const audioManager = this.registry.get('audioManager');
        if (audioManager) {
            audioManager.playSound('ui_click');
        }
        
        // Stop both game and UI scenes
        this.scene.stop('GameScene');
        this.scene.stop('UIScene');
        this.scene.start('MenuScene');
    }
    
    toggleAudio() {
        const audioManager = this.registry.get('audioManager');
        if (audioManager) {
            audioManager.toggleMute();
            
            // Visual feedback
            const feedback = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 100, 
                audioManager.isMuted ? 'AUDIO MUTED' : 'AUDIO ENABLED', {
                fontSize: '16px',
                color: audioManager.isMuted ? '#f44336' : '#4caf50',
                fontFamily: 'Arial',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5);
            
            // Fade out feedback text
            this.time.delayedCall(1000, () => {
                this.tweens.add({
                    targets: feedback,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        feedback.destroy();
                    }
                });
            });
        }
    }
}
