class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player_idle');
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Player properties
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.speed = GAME_CONFIG.PLAYER_SPEED;
        this.jumpForce = GAME_CONFIG.JUMP_FORCE;
        this.meleeDamage = 25;
        this.meleeRange = 40;
        this.attackCooldown = 500;
        
        // Physics setup
        this.body.setSize(24, 40);
        this.body.setOffset(4, 4);
        this.body.setCollideWorldBounds(true);
        this.body.setDragX(300);
        this.body.setMaxVelocityX(this.speed);
        
        // State
        this.isGrounded = false;
        this.isAttacking = false;
        this.attackTimer = 0;
        this.invulnerable = false;
        this.damageFlashTimer = 0;
        this.currentState = 'idle';
        
        // Weapons
        this.hasWeapon = false;
        this.weaponType = 'pistol';
        this.ammo = 30;
        this.maxAmmo = 30;
        
        // Apply upgrades
        this.applyUpgrades();
        
        console.log('Player created at', x, y);
    }
    
    applyUpgrades() {
        const upgrades = this.scene.registry.get('upgrades') || {};
        
        // Health upgrades
        const healthLevel = upgrades.health || 0;
        this.maxHealth = 100 + (healthLevel * 25);
        this.health = this.maxHealth;
        
        // Melee damage upgrades
        const meleeLevel = upgrades.meleeDamage || 0;
        this.meleeDamage = 25 + (meleeLevel * 10);
        
        // Speed upgrades
        const speedLevel = upgrades.speed || 0;
        this.speed = GAME_CONFIG.PLAYER_SPEED + (speedLevel * 25);
        this.body.setMaxVelocityX(this.speed);
        
        // Weapon damage upgrades
        const weaponLevel = upgrades.weaponDamage || 0;
        this.weaponDamage = 30 + (weaponLevel * 8);
        
        console.log('Player upgrades applied:', {
            health: healthLevel,
            melee: meleeLevel,
            speed: speedLevel,
            weapon: weaponLevel
        });
    }
    
    update(keys, wasd, delta) {
        if (!this.active) return;
        
        this.handleInput(keys, wasd);
        this.updatePhysics(delta);
        this.updateState();
        this.updateAnimation();
        this.handleGroundCheck();
        
        // Update attack cooldown
        if (this.attackTimer > 0) {
            this.attackTimer -= delta;
            if (this.attackTimer <= 0) {
                this.isAttacking = false;
            }
        }
        
        // Update damage flash
        if (this.damageFlashTimer > 0) {
            this.damageFlashTimer -= delta;
            const flash = Math.sin(this.damageFlashTimer * 0.01) > 0;
            this.setTint(flash ? 0xff0000 : 0xffffff);
            
            if (this.damageFlashTimer <= 0) {
                this.setTint(0xffffff);
                this.invulnerable = false;
            }
        }
    }
    
    handleInput(keys, wasd) {
        // Horizontal movement
        if (keys.left.isDown || wasd.A.isDown) {
            this.body.setVelocityX(-this.speed);
            this.setFlipX(true);
        } else if (keys.right.isDown || wasd.D.isDown) {
            this.body.setVelocityX(this.speed);
            this.setFlipX(false);
        } else {
            this.body.setVelocityX(0);
        }
        
        // Jumping
        if ((keys.up.isDown || wasd.W.isDown) && this.isGrounded && this.body.velocity.y > -10) {
            this.body.setVelocityY(this.jumpForce);
            this.isGrounded = false;
            
            if (this.scene.audioManager) {
                this.scene.audioManager.playSound('player_jump');
            }
        }
    }
    
    updatePhysics(delta) {
        // Ground friction
        if (this.isGrounded && Math.abs(this.body.velocity.x) < 10) {
            this.body.setVelocityX(0);
        }
    }
    
    updateState() {
        if (this.isAttacking) {
            this.currentState = 'attack';
        } else if (!this.isGrounded) {
            this.currentState = 'jump';
        } else if (Math.abs(this.body.velocity.x) > 10) {
            this.currentState = 'run';
        } else {
            this.currentState = 'idle';
        }
    }
    
    updateAnimation() {
        // Simple animation system - would be replaced with proper sprite sheets
        switch (this.currentState) {
            case 'idle':
                this.setTexture('player_idle');
                break;
            case 'run':
                this.setTexture('player_run');
                break;
            case 'jump':
                this.setTexture('player_idle'); // Would be jump sprite
                break;
            case 'attack':
                this.setTexture('player_idle'); // Would be attack sprite
                break;
        }
    }
    
    handleGroundCheck() {
        const wasGrounded = this.isGrounded;
        this.isGrounded = this.body.blocked.down || (Math.abs(this.body.velocity.y) < 10 && this.body.velocity.y >= 0);
        
        // Landing effects
        if (this.isGrounded && !wasGrounded && this.body.velocity.y > 300) {
            if (this.scene.effects) {
                this.scene.effects.createDustEffect(this.x, this.y + 20);
            }
            
            if (this.scene.audioManager) {
                this.scene.audioManager.playSound('player_land');
            }
        }
    }
    
    punch() {
        if (this.isAttacking) return;
        
        console.log('Player punching');
        this.performMeleeAttack('punch');
    }
    
    kick() {
        if (this.isAttacking) return;
        
        console.log('Player kicking');
        this.performMeleeAttack('kick');
    }
    
    performMeleeAttack(attackType) {
        this.isAttacking = true;
        this.attackTimer = this.attackCooldown;
        
        // Determine attack direction
        const attackDirection = this.flipX ? -1 : 1;
        const attackX = this.x + (this.meleeRange * attackDirection);
        const attackY = this.y;
        
        // Create attack hitbox
        const hitArea = new Phaser.Geom.Circle(attackX, attackY, this.meleeRange);
        
        // Check for enemies in range
        this.scene.enemies.children.entries.forEach(enemy => {
            if (enemy.active && Phaser.Geom.Circle.Contains(hitArea, enemy.x, enemy.y)) {
                this.hitEnemy(enemy, attackType);
            }
        });
        
        // Visual effect
        this.createAttackEffect(attackX, attackY, attackType);
        
        // Sound effect
        if (this.scene.audioManager) {
            this.scene.audioManager.playSound(attackType === 'punch' ? 'punch' : 'kick');
        }
        
        // Attack animation
        const attackTween = this.scene.tweens.add({
            targets: this,
            scaleX: this.flipX ? -1.2 : 1.2,
            duration: 150,
            yoyo: true,
            ease: 'Power2'
        });
    }
    
    hitEnemy(enemy, attackType) {
        const damage = attackType === 'kick' ? this.meleeDamage * 1.5 : this.meleeDamage;
        enemy.takeDamage(damage);
        
        // Knockback enemy
        const knockbackDirection = enemy.x > this.x ? 1 : -1;
        const knockbackForce = damage * 3;
        enemy.body.setVelocityX(knockbackDirection * knockbackForce);
        
        // Create impact effect
        if (this.scene.effects) {
            this.scene.effects.createImpact(enemy.x, enemy.y, attackType === 'kick' ? 0xff5722 : 0x2196f3);
        }
        
        console.log(`${attackType} hit enemy for ${damage} damage`);
    }
    
    createAttackEffect(x, y, attackType) {
        // Simple attack effect
        const effect = this.scene.add.circle(x, y, 20, attackType === 'kick' ? 0xff5722 : 0x2196f3, 0.6);
        
        this.scene.tweens.add({
            targets: effect,
            scale: 2,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                effect.destroy();
            }
        });
    }
    
    shoot(targetX, targetY) {
        if (this.isAttacking || !this.hasWeapon || this.ammo <= 0) {
            return;
        }
        
        console.log('Player shooting at', targetX, targetY);
        
        this.isAttacking = true;
        this.attackTimer = 300; // Shorter cooldown for shooting
        this.ammo--;
        
        // Calculate direction
        const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
        const bulletSpeed = 600;
        const velocityX = Math.cos(angle) * bulletSpeed;
        const velocityY = Math.sin(angle) * bulletSpeed;
        
        // Create bullet
        const bullet = this.scene.bullets.get();
        if (bullet) {
            bullet.fire(this.x, this.y - 10, velocityX, velocityY, this.weaponDamage);
        }
        
        // Muzzle flash effect
        if (this.scene.effects) {
            this.scene.effects.createMuzzleFlash(this.x + (this.flipX ? -10 : 10), this.y - 10);
        }
        
        // Sound effect
        if (this.scene.audioManager) {
            this.scene.audioManager.playSound('gun_shoot');
        }
        
        // Recoil animation
        this.scene.tweens.add({
            targets: this,
            x: this.x - (this.flipX ? 5 : -5),
            duration: 50,
            yoyo: true,
            ease: 'Power2'
        });
    }
    
    takeDamage(amount) {
        if (this.invulnerable) return false;
        
        this.health -= amount;
        this.health = Math.max(0, this.health);
        
        console.log(`Player took ${amount} damage, health: ${this.health}`);
        
        // Damage effects
        this.invulnerable = true;
        this.damageFlashTimer = 500;
        
        // Knockback
        const knockbackForce = amount * 2;
        this.body.setVelocityX(this.body.velocity.x - knockbackForce);
        
        // Screen shake
        this.scene.cameras.main.shake(200, 0.015);
        
        // Create damage effect
        if (this.scene.effects) {
            this.scene.effects.createDamageNumber(this.x, this.y - 20, amount);
        }
        
        // Sound effect
        if (this.scene.audioManager) {
            this.scene.audioManager.playSound('player_hurt');
        }
        
        return this.health <= 0;
    }
    
    heal(amount) {
        this.health += amount;
        this.health = Math.min(this.health, this.maxHealth);
        
        console.log(`Player healed by ${amount}, health: ${this.health}`);
        
        if (this.scene.effects) {
            this.scene.effects.createHealEffect(this.x, this.y - 20);
        }
    }
    
    giveWeapon(weaponType) {
        this.hasWeapon = true;
        this.weaponType = weaponType;
        this.ammo = this.maxAmmo;
        
        console.log(`Player equipped ${weaponType}`);
    }
    
    reloadWeapon() {
        if (!this.hasWeapon) return;
        
        this.ammo = this.maxAmmo;
        console.log('Weapon reloaded');
        
        if (this.scene.audioManager) {
            this.scene.audioManager.playSound('reload');
        }
    }
}
