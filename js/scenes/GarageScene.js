class GarageScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GarageScene' });
    }
    
    create() {
        console.log('Garage Scene: Creating upgrade interface');
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x16213e);
        
        // Title
        this.add.text(width / 2, 60, 'GARAGE & UPGRADES', {
            fontSize: '36px',
            color: '#e94560',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Get current stats and coins
        this.coins = this.registry.get('coins') || 0;
        this.upgrades = this.registry.get('upgrades') || {};
        
        // Display coins
        this.coinsText = this.add.text(width - 50, 50, `COINS: ${this.coins}`, {
            fontSize: '20px',
            color: '#ffd700',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(1, 0);
        
        // Create upgrade sections
        this.createCarUpgrades();
        this.createPlayerUpgrades();
        
        // Back button
        this.createBackButton();
        
        // Car preview (simple representation)
        this.createCarPreview();
    }
    
    createCarUpgrades() {
        const startX = 100;
        const startY = 150;
        
        this.add.text(startX, startY, 'CAR UPGRADES', {
            fontSize: '24px',
            color: '#00bcd4',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        
        const carUpgrades = [
            {
                name: 'Engine',
                key: 'engine',
                description: 'Increase acceleration and top speed',
                baseCost: 50,
                maxLevel: 10,
                icon: '⚡'
            },
            {
                name: 'Armor',
                key: 'armor',
                description: 'Reduce damage taken',
                baseCost: 75,
                maxLevel: 8,
                icon: '🛡️'
            },
            {
                name: 'Fuel Tank',
                key: 'fuelTank',
                description: 'Increase fuel capacity',
                baseCost: 40,
                maxLevel: 15,
                icon: '⛽'
            },
            {
                name: 'Suspension',
                key: 'suspension',
                description: 'Improve jumping and landing',
                baseCost: 60,
                maxLevel: 6,
                icon: '🔧'
            }
        ];
        
        carUpgrades.forEach((upgrade, index) => {
            this.createUpgradeItem(upgrade, startX, startY + 60 + index * 80);
        });
    }
    
    createPlayerUpgrades() {
        const startX = 550;
        const startY = 150;
        
        this.add.text(startX, startY, 'PLAYER UPGRADES', {
            fontSize: '24px',
            color: '#ff5722',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        
        const playerUpgrades = [
            {
                name: 'Health',
                key: 'health',
                description: 'Increase maximum health',
                baseCost: 30,
                maxLevel: 12,
                icon: '❤️'
            },
            {
                name: 'Melee Damage',
                key: 'meleeDamage',
                description: 'Increase punch and kick damage',
                baseCost: 45,
                maxLevel: 10,
                icon: '👊'
            },
            {
                name: 'Movement Speed',
                key: 'speed',
                description: 'Move faster on foot',
                baseCost: 35,
                maxLevel: 8,
                icon: '🏃'
            },
            {
                name: 'Weapon Proficiency',
                key: 'weaponDamage',
                description: 'Increase ranged weapon damage',
                baseCost: 55,
                maxLevel: 8,
                icon: '🔫'
            }
        ];
        
        playerUpgrades.forEach((upgrade, index) => {
            this.createUpgradeItem(upgrade, startX, startY + 60 + index * 80);
        });
    }
    
    createUpgradeItem(upgrade, x, y) {
        const currentLevel = this.upgrades[upgrade.key] || 0;
        const cost = upgrade.baseCost + (currentLevel * upgrade.baseCost * 0.5);
        const maxLevel = upgrade.maxLevel;
        const canUpgrade = currentLevel < maxLevel && this.coins >= cost;
        
        // Background
        const bg = this.add.rectangle(x, y, 400, 70, 0x1a1a2e, 0.8);
        bg.setOrigin(0, 0);
        bg.setStrokeStyle(2, canUpgrade ? 0x4caf50 : 0x424242);
        
        // Icon and name
        this.add.text(x + 10, y + 15, `${upgrade.icon} ${upgrade.name}`, {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        
        // Level indicator
        this.add.text(x + 10, y + 40, `Level: ${currentLevel}/${maxLevel}`, {
            fontSize: '14px',
            color: '#cccccc',
            fontFamily: 'Arial'
        });
        
        // Description
        this.add.text(x + 200, y + 15, upgrade.description, {
            fontSize: '12px',
            color: '#aaaaaa',
            fontFamily: 'Arial',
            wordWrap: { width: 150, useAdvancedWrap: true }
        });
        
        // Cost and upgrade button
        if (currentLevel < maxLevel) {
            const costText = this.add.text(x + 300, y + 40, `Cost: ${Math.floor(cost)}`, {
                fontSize: '14px',
                color: canUpgrade ? '#ffd700' : '#666666',
                fontFamily: 'Arial'
            });
            
            const upgradeBtn = this.add.rectangle(x + 350, y + 25, 40, 20, canUpgrade ? 0x4caf50 : 0x424242);
            upgradeBtn.setStrokeStyle(1, canUpgrade ? 0x66bb6a : 0x616161);
            
            const upgradeBtnText = this.add.text(x + 350, y + 25, 'UP', {
                fontSize: '12px',
                color: canUpgrade ? '#ffffff' : '#888888',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            
            if (canUpgrade) {
                upgradeBtn.setInteractive();
                upgradeBtn.on('pointerdown', () => {
                    this.purchaseUpgrade(upgrade.key, cost);
                });
                
                upgradeBtn.on('pointerover', () => {
                    upgradeBtn.setScale(1.1);
                });
                
                upgradeBtn.on('pointerout', () => {
                    upgradeBtn.setScale(1.0);
                });
            }
        } else {
            this.add.text(x + 300, y + 40, 'MAX LEVEL', {
                fontSize: '14px',
                color: '#4caf50',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            });
        }
    }
    
    purchaseUpgrade(upgradeKey, cost) {
        console.log(`Purchasing upgrade: ${upgradeKey} for ${cost} coins`);
        
        // Deduct coins
        this.coins -= cost;
        this.registry.set('coins', this.coins);
        
        // Increase upgrade level
        this.upgrades[upgradeKey] = (this.upgrades[upgradeKey] || 0) + 1;
        this.registry.set('upgrades', this.upgrades);
        
        // Save to storage
        const saveManager = this.registry.get('saveManager');
        if (saveManager) {
            saveManager.save('gameData', {
                coins: this.coins,
                upgrades: this.upgrades,
                highScore: this.registry.get('highScore') || 0
            });
        }
        
        // Play sound
        const audioManager = this.registry.get('audioManager');
        if (audioManager) {
            audioManager.playSound('upgrade_purchase');
        }
        
        // Update display
        this.coinsText.setText(`COINS: ${this.coins}`);
        
        // Recreate the scene to show updated upgrades
        this.time.delayedCall(100, () => {
            this.scene.restart();
        });
        
        // Show success message
        this.showUpgradeMessage(`${upgradeKey.toUpperCase()} UPGRADED!`);
    }
    
    showUpgradeMessage(text) {
        const messageText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 100,
            text,
            {
                fontSize: '24px',
                color: '#4caf50',
                fontFamily: 'Arial',
                fontStyle: 'bold',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5);
        
        // Animate message
        messageText.setScale(0);
        this.tweens.add({
            targets: messageText,
            scale: 1,
            duration: 200,
            ease: 'Back.out',
            onComplete: () => {
                this.time.delayedCall(1500, () => {
                    this.tweens.add({
                        targets: messageText,
                        alpha: 0,
                        scale: 1.2,
                        duration: 300,
                        onComplete: () => {
                            messageText.destroy();
                        }
                    });
                });
            }
        });
    }
    
    createCarPreview() {
        const previewX = 200;
        const previewY = 450;
        
        this.add.text(previewX - 50, previewY - 50, 'CAR PREVIEW', {
            fontSize: '16px',
            color: '#cccccc',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Simple car representation
        const carBody = this.add.rectangle(previewX, previewY, 80, 40, 0x2196f3);
        const wheel1 = this.add.circle(previewX - 25, previewY + 25, 12, 0x424242);
        const wheel2 = this.add.circle(previewX + 25, previewY + 25, 12, 0x424242);
        
        // Apply visual upgrades based on current levels
        const engineLevel = this.upgrades.engine || 0;
        const armorLevel = this.upgrades.armor || 0;
        
        if (engineLevel > 3) {
            // Add exhaust effect
            const exhaust = this.add.circle(previewX - 45, previewY, 6, 0xff9800, 0.7);
            this.tweens.add({
                targets: exhaust,
                alpha: 0.3,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        }
        
        if (armorLevel > 2) {
            // Add armor plating visual
            carBody.setStrokeStyle(3, 0x795548);
        }
    }
    
    createBackButton() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const backButton = this.add.rectangle(width - 100, height - 50, 120, 40, 0x424242)
            .setInteractive()
            .setStrokeStyle(2, 0xe94560);
        
        const backText = this.add.text(width - 100, height - 50, 'BACK', {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        backButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
        
        backButton.on('pointerover', () => {
            backButton.setScale(1.05);
        });
        
        backButton.on('pointerout', () => {
            backButton.setScale(1.0);
        });
    }
}
