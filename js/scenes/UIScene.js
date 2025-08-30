class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }
    
    create() {
        console.log('UI Scene: Creating game HUD');
        
        // Create HUD elements
        this.createHUD();
        
        // Listen for game events
        this.setupEventListeners();
        
        // Update interval
        this.time.addEvent({
            delay: 100,
            callback: this.updateHUD,
            callbackScope: this,
            loop: true
        });
    }
    
    createHUD() {
        const width = this.cameras.main.width;
        
        // Fuel bar background
        this.fuelBg = this.add.rectangle(20, 30, 200, 20, 0x000000, 0.6)
            .setOrigin(0, 0.5)
            .setScrollFactor(0);
        
        this.fuelBg.setStrokeStyle(2, 0xffa500);
        
        // Fuel bar fill
        this.fuelBar = this.add.rectangle(22, 30, 196, 16, 0xffa500)
            .setOrigin(0, 0.5)
            .setScrollFactor(0);
        
        // Fuel text
        this.fuelText = this.add.text(25, 15, 'FUEL', {
            fontSize: '12px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setScrollFactor(0);
        
        // Health bar background (for player mode)
        this.healthBg = this.add.rectangle(20, 70, 200, 20, 0x000000, 0.6)
            .setOrigin(0, 0.5)
            .setScrollFactor(0);
        
        this.healthBg.setStrokeStyle(2, 0x4caf50);
        
        // Health bar fill
        this.healthBar = this.add.rectangle(22, 70, 196, 16, 0x4caf50)
            .setOrigin(0, 0.5)
            .setScrollFactor(0);
        
        // Health text
        this.healthText = this.add.text(25, 55, 'HEALTH', {
            fontSize: '12px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setScrollFactor(0);
        
        // Distance display
        this.distanceText = this.add.text(width / 2, 30, 'DISTANCE: 0m', {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0);
        
        // Coins display
        this.coinsText = this.add.text(width - 20, 30, 'COINS: 0', {
            fontSize: '18px',
            color: '#ffd700',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(1, 0.5).setScrollFactor(0);
        
        // Mode indicator
        this.modeText = this.add.text(width / 2, 60, 'DRIVING', {
            fontSize: '14px',
            color: '#00bcd4',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setScrollFactor(0);
        
        // Speed indicator
        this.speedText = this.add.text(20, 110, 'SPEED: 0', {
            fontSize: '12px',
            color: '#cccccc',
            fontFamily: 'Arial'
        }).setScrollFactor(0);
        
        console.log('HUD elements created');
    }
    
    setupEventListeners() {
        // Listen to the game scene for updates
        this.gameScene = this.scene.get('GameScene');
        
        this.registry.events.on('changedata', (parent, key, data) => {
            this.handleRegistryChange(key, data);
        });
    }
    
    handleRegistryChange(key, value) {
        switch (key) {
            case 'gameDistance':
                if (this.distanceText) {
                    this.distanceText.setText(`DISTANCE: ${value}m`);
                }
                break;
                
            case 'gameCoins':
                if (this.coinsText) {
                    const totalCoins = (this.registry.get('coins') || 0) + value;
                    this.coinsText.setText(`COINS: ${totalCoins}`);
                }
                break;
        }
    }
    
    updateHUD() {
        if (!this.gameScene || !this.gameScene.scene.isActive()) {
            return;
        }
        
        const gameState = this.gameScene.gameState;
        if (!gameState) {
            return;
        }
        
        // Update based on current mode
        if (gameState.mode === 'car' && this.gameScene.car && this.gameScene.car.active) {
            this.updateCarHUD();
        } else if (gameState.mode === 'foot' && this.gameScene.player && this.gameScene.player.active) {
            this.updatePlayerHUD();
        }
        
        // Update common elements
        this.updateCommonHUD();
    }
    
    updateCarHUD() {
        const car = this.gameScene.car;
        
        // Show fuel bar
        this.fuelBg.setVisible(true);
        this.fuelBar.setVisible(true);
        this.fuelText.setVisible(true);
        
        // Update fuel bar
        const fuelPercent = car.fuel / car.maxFuel;
        this.fuelBar.scaleX = fuelPercent;
        
        // Change color based on fuel level
        if (fuelPercent > 0.5) {
            this.fuelBar.setFillStyle(0xffa500); // Orange
        } else if (fuelPercent > 0.2) {
            this.fuelBar.setFillStyle(0xff9800); // Darker orange
        } else {
            this.fuelBar.setFillStyle(0xf44336); // Red
        }
        
        // Hide health bar for car mode
        this.healthBg.setVisible(false);
        this.healthBar.setVisible(false);
        this.healthText.setVisible(false);
        
        // Update mode text
        this.modeText.setText('DRIVING');
        this.modeText.setColor('#00bcd4');
        
        // Update speed
        const speed = Math.abs(car.body.velocity.x);
        this.speedText.setText(`SPEED: ${Math.floor(speed)}`);
    }
    
    updatePlayerHUD() {
        const player = this.gameScene.player;
        
        // Hide fuel bar
        this.fuelBg.setVisible(false);
        this.fuelBar.setVisible(false);
        this.fuelText.setVisible(false);
        
        // Show health bar
        this.healthBg.setVisible(true);
        this.healthBar.setVisible(true);
        this.healthText.setVisible(true);
        
        // Update health bar
        const healthPercent = player.health / player.maxHealth;
        this.healthBar.scaleX = healthPercent;
        
        // Change color based on health level
        if (healthPercent > 0.6) {
            this.healthBar.setFillStyle(0x4caf50); // Green
        } else if (healthPercent > 0.3) {
            this.healthBar.setFillStyle(0xff9800); // Orange
        } else {
            this.healthBar.setFillStyle(0xf44336); // Red
        }
        
        // Update mode text
        this.modeText.setText('ON FOOT');
        this.modeText.setColor('#ff5722');
        
        // Update speed
        const speed = Math.abs(player.body.velocity.x);
        this.speedText.setText(`SPEED: ${Math.floor(speed)}`);
    }
    
    updateCommonHUD() {
        // Update distance
        const distance = this.registry.get('gameDistance') || 0;
        this.distanceText.setText(`DISTANCE: ${distance}m`);
        
        // Update coins (total + current run)
        const totalCoins = this.registry.get('coins') || 0;
        const runCoins = this.registry.get('gameCoins') || 0;
        this.coinsText.setText(`COINS: ${totalCoins + runCoins}`);
    }
    
    // Method to show temporary messages
    showMessage(text, duration = 2000, color = '#ffffff') {
        const messageText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 50,
            text,
            {
                fontSize: '24px',
                color: color,
                fontFamily: 'Arial',
                fontStyle: 'bold',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5).setScrollFactor(0);
        
        // Fade in
        messageText.setAlpha(0);
        this.tweens.add({
            targets: messageText,
            alpha: 1,
            duration: 200,
            onComplete: () => {
                // Fade out after duration
                this.time.delayedCall(duration - 400, () => {
                    this.tweens.add({
                        targets: messageText,
                        alpha: 0,
                        duration: 200,
                        onComplete: () => {
                            messageText.destroy();
                        }
                    });
                });
            }
        });
        
        return messageText;
    }
    
    // Method to show control hints
    showControlHint(hint, duration = 3000) {
        const hintText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 100,
            hint,
            {
                fontSize: '16px',
                color: '#ffeb3b',
                fontFamily: 'Arial',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                padding: { x: 15, y: 8 },
                align: 'center'
            }
        ).setOrigin(0.5).setScrollFactor(0);
        
        // Fade out after duration
        this.time.delayedCall(duration, () => {
            this.tweens.add({
                targets: hintText,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    hintText.destroy();
                }
            });
        });
        
        return hintText;
    }
}
