class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'zombie');
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Enemy properties
        this.maxHealth = 60;
        this.health = this.maxHealth;
        this.damage = 20;
        this.speed = 80;
        this.detectionRange = 150;
        this.attackRange = 40;
        this.attackCooldown = 1000;
        this.attackTimer = 0;
        
        // Physics setup
        this.body.setSize(24, 36);
        this.body.setOffset(2, 4);
        this.body.setCollideWorldBounds(true);
        this.body.setDragX(100);
        this.body.setMaxVelocityX(this.speed);
        
        // AI state
        this.currentState = 'patrol';
        this.target = null;
        this.patrolDirection = Math.random() > 0.5 ? 1 : -1;
        this.patrolDistance = 100 + Math.random() * 100;
        this.patrolStartX = x;
        this.lastTargetSeen = 0;
        this.pursuitTimeout = 3000; // Stop pursuing after 3 seconds
        
        // Visual state
        this.invulnerable = false;
        this.damageFlashTimer = 0;
        this.deathTimer = 0;
        this.isDying = false;
        
        // Animation
        this.animationTimer = 0;
        this.animationFrame = 0;
        
        console.log('Enemy created at', x, y);
    }
    
    spawn(x, y) {
        this.setPosition(x, y);
        this.setActive(true);
        this.setVisible(true);
        
        // Reset properties
        this.health = this.maxHealth;
        this.currentState = 'patrol';
        this.target = null;
        this.patrolStartX = x;
        this.patrolDirection = Math.random() > 0.5 ? 1 : -1;
        this.invulnerable = false;
        this.damageFlashTimer = 0;
        this.deathTimer = 0;
        this.isDying = false;
        this.attackTimer = 0;
        this.lastTargetSeen = 0;
        
        // Reset physics
        this.body.setVelocity(0, 0);
        this.setTint(0xffffff);
        this.setScale(1, 1);
        
        console.log('Enemy spawned at', x, y);
    }
    
    update(time, delta) {
        if (!this.active || this.isDying) {
            if (this.isDying) {
                this.updateDeath(delta);
            }
            return;
        }
        
        // Update timers
        if (this.attackTimer > 0) {
            this.attackTimer -= delta;
        }
        
        if (this.damageFlashTimer > 0) {
            this.damageFlashTimer -= delta;
            const flash = Math.sin(this.damageFlashTimer * 0.01) > 0;
            this.setTint(flash ? 0xff0000 : 0xffffff);
            
            if (this.damageFlashTimer <= 0) {
                this.setTint(0xffffff);
                this.invulnerable = false;
            }
        }
        
        // Find target
        this.findTarget();
        
        // Update AI state
        this.updateAI(delta);
        
        // Update animation
        this.updateAnimation(delta);
        
        // Check if fallen off world
        if (this.y > this.scene.cameras.main.height + 100) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
    
    findTarget() {
        const gameScene = this.scene;
        let closestTarget = null;
        let closestDistance = this.detectionRange;
        
        // Check for car
        if (gameScene.car && gameScene.car.active) {
            const distance = Phaser.Math.Distance.Between(this.x, this.y, gameScene.car.x, gameScene.car.y);
            if (distance < closestDistance) {
                closestTarget = gameScene.car;
                closestDistance = distance;
            }
        }
        
        // Check for player (prioritize player if closer or car not available)
        if (gameScene.player && gameScene.player.active) {
            const distance = Phaser.Math.Distance.Between(this.x, this.y, gameScene.player.x, gameScene.player.y);
            if (distance < closestDistance) {
                closestTarget = gameScene.player;
                closestDistance = distance;
            }
        }
        
        // Update target
        if (closestTarget) {
            this.target = closestTarget;
            this.lastTargetSeen = this.scene.time.now;
        } else if (this.scene.time.now - this.lastTargetSeen > this.pursuitTimeout) {
            this.target = null;
        }
    }
    
    updateAI(delta) {
        switch (this.currentState) {
            case 'patrol':
                this.updatePatrol(delta);
                break;
            case 'pursue':
                this.updatePursuit(delta);
                break;
            case 'attack':
                this.updateAttack(delta);
                break;
            case 'knockback':
                this.updateKnockback(delta);
                break;
        }
        
        // State transitions
        if (this.target && this.currentState !== 'attack' && this.currentState !== 'knockback') {
            const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
            
            if (distance <= this.attackRange && this.attackTimer <= 0) {
                this.currentState = 'attack';
            } else if (distance <= this.detectionRange) {
                this.currentState = 'pursue';
            }
        } else if (!this.target && this.currentState !== 'knockback') {
            this.currentState = 'patrol';
        }
    }
    
    updatePatrol(delta) {
        // Simple patrol behavior
        const targetX = this.patrolStartX + (this.patrolDirection * this.patrolDistance);
        
        if (this.patrolDirection > 0 && this.x >= targetX) {
            this.patrolDirection = -1;
        } else if (this.patrolDirection < 0 && this.x <= targetX) {
            this.patrolDirection = 1;
        }
        
        // Move in patrol direction
        this.body.setVelocityX(this.patrolDirection * this.speed * 0.5);
        this.setFlipX(this.patrolDirection < 0);
    }
    
    updatePursuit(delta) {
        if (!this.target) {
            this.currentState = 'patrol';
            return;
        }
        
        // Move toward target
        const direction = this.target.x > this.x ? 1 : -1;
        this.body.setVelocityX(direction * this.speed);
        this.setFlipX(direction < 0);
        
        // Jump if target is higher and we're on ground
        if (this.target.y < this.y - 50 && this.body.blocked.down) {
            this.body.setVelocityY(-300);
        }
    }
    
    updateAttack(delta) {
        if (!this.target) {
            this.currentState = 'patrol';
            return;
        }
        
        // Stop moving during attack
        this.body.setVelocityX(0);
        
        // Face target
        this.setFlipX(this.target.x < this.x);
        
        // Perform attack
        if (this.attackTimer <= 0) {
            this.performAttack();
            this.attackTimer = this.attackCooldown;
            
            // Return to pursuit after attack
            this.currentState = 'pursue';
        }
    }
    
    updateKnockback(delta) {
        // Let physics handle knockback, return to normal state after velocity settles
        if (Math.abs(this.body.velocity.x) < 50) {
            this.currentState = this.target ? 'pursue' : 'patrol';
        }
    }
    
    updateDeath(delta) {
        this.deathTimer -= delta;
        
        // Fade out and scale down
        const progress = 1 - (this.deathTimer / 1000);
        this.setAlpha(1 - progress);
        this.setScale(1 - progress * 0.5);
        
        if (this.deathTimer <= 0) {
            this.setActive(false);
            this.setVisible(false);
            this.isDying = false;
        }
    }
    
    updateAnimation(delta) {
        this.animationTimer += delta;
        
        if (this.animationTimer >= 300) { // Change frame every 300ms
            this.animationTimer = 0;
            this.animationFrame = (this.animationFrame + 1) % 2;
            
            // Simple animation by slightly changing scale
            const scale = this.animationFrame === 0 ? 1.0 : 1.05;
            this.setScale(scale, 1.0);
        }
    }
    
    performAttack() {
        if (!this.target) return;
        
        console.log('Enemy attacking target');
        
        // Check if target is still in range
        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
        if (distance > this.attackRange) {
            return;
        }
        
        // Deal damage to target
        if (this.target.takeDamage) {
            this.target.takeDamage(this.damage);
        }
        
        // Create attack effect
        const attackX = this.x + (this.flipX ? -20 : 20);
        const attackY = this.y - 10;
        
        if (this.scene.effects) {
            this.scene.effects.createImpact(attackX, attackY, 0xff0000);
        }
        
        // Play attack sound
        if (this.scene.audioManager) {
            this.scene.audioManager.playSound('zombie_attack');
        }
        
        // Attack animation
        this.scene.tweens.add({
            targets: this,
            scaleX: this.flipX ? -1.3 : 1.3,
            duration: 200,
            yoyo: true,
            ease: 'Power2'
        });
    }
    
    takeDamage(amount) {
        if (this.invulnerable || this.isDying) return false;
        
        this.health -= amount;
        this.health = Math.max(0, this.health);
        
        console.log(`Enemy took ${amount} damage, health: ${this.health}`);
        
        // Damage effects
        this.invulnerable = true;
        this.damageFlashTimer = 300;
        this.currentState = 'knockback';
        
        // Create damage number
        if (this.scene.effects) {
            this.scene.effects.createDamageNumber(this.x, this.y - 20, amount);
        }
        
        // Play hurt sound
        if (this.scene.audioManager) {
            this.scene.audioManager.playSound('zombie_hurt');
        }
        
        // Check if dead
        if (this.health <= 0) {
            this.die();
            return true;
        }
        
        return false;
    }
    
    die() {
        if (this.isDying) return;
        
        console.log('Enemy died');
        this.isDying = true;
        this.deathTimer = 1000;
        
        // Stop physics
        this.body.setVelocity(0, 0);
        
        // Death effects
        if (this.scene.effects) {
            this.scene.effects.createExplosion(this.x, this.y);
        }
        
        // Play death sound
        if (this.scene.audioManager) {
            this.scene.audioManager.playSound('zombie_death');
        }
        
        // Drop coins
        this.dropLoot();
    }
    
    dropLoot() {
        const coinCount = 1 + Math.floor(Math.random() * 3); // 1-3 coins
        
        for (let i = 0; i < coinCount; i++) {
            // Get coin from pool or create new one
            let coin = null;
            
            if (this.scene.coins) {
                coin = this.scene.coins.get();
            }
            
            if (!coin) {
                // Create new coin if pool is empty
                coin = this.scene.add.sprite(0, 0, 'coin').setScale(0.6);
                this.scene.physics.add.existing(coin);
                coin.body.setSize(20, 20);
                if (this.scene.coins) {
                    this.scene.coins.add(coin);
                }
            }
            
            if (coin) {
                // Position coin near enemy
                const offsetX = (Math.random() - 0.5) * 60;
                const offsetY = -20 - Math.random() * 20;
                
                coin.setPosition(this.x + offsetX, this.y + offsetY);
                coin.setActive(true);
                coin.setVisible(true);
                
                // Give coin some physics movement
                coin.body.setVelocity(
                    (Math.random() - 0.5) * 200,
                    -100 - Math.random() * 100
                );
                
                coin.body.setBounce(0.3);
                coin.body.setDragX(100);
                
                // Animate coin
                this.scene.tweens.add({
                    targets: coin,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1
                });
            }
        }
    }
    
    // Get current state for debugging
    getState() {
        return {
            state: this.currentState,
            health: this.health,
            hasTarget: !!this.target,
            position: { x: Math.floor(this.x), y: Math.floor(this.y) }
        };
    }
}
