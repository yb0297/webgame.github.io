class Car extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'car_body');
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Car properties
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.maxFuel = 100;
        this.fuel = this.maxFuel;
        this.enginePower = GAME_CONFIG.CAR_SPEED;
        this.maxSpeed = GAME_CONFIG.CAR_SPEED;
        this.jumpForce = GAME_CONFIG.JUMP_FORCE;
        this.fuelConsumptionRate = GAME_CONFIG.FUEL_CONSUMPTION_RATE;
        this.armor = 0;
        
        // Physics setup
        this.body.setSize(70, 35);
        this.body.setOffset(5, 2);
        this.body.setCollideWorldBounds(true);
        this.body.setDragX(200);
        this.body.setMaxVelocityX(this.maxSpeed);
        
        // Create wheels
        this.createWheels();
        
        // Effects
        this.exhaustParticles = null;
        this.createExhaustEffect();
        
        // State
        this.isAccelerating = false;
        this.isGrounded = false;
        this.invulnerable = false;
        this.damageFlashTimer = 0;
        
        // Apply upgrades
        this.applyUpgrades();
        
        console.log('Car created at', x, y);
    }
    
    createWheels() {
        // Create wheel sprites
        this.wheels = [];
        
        const wheelPositions = [
            { x: -25, y: 20 }, // Front wheel
            { x: 25, y: 20 }   // Rear wheel
        ];
        
        wheelPositions.forEach((pos, index) => {
            const wheel = this.scene.add.sprite(this.x + pos.x, this.y + pos.y, 'wheel');
            wheel.setScale(0.8);
            this.wheels.push(wheel);
        });
    }
    
    createExhaustEffect() {
        // Simple exhaust effect using graphics
        this.exhaustParticles = this.scene.add.particles(this.x - 40, this.y, 'coin', {
            scale: { start: 0.1, end: 0 },
            alpha: { start: 0.5, end: 0 },
            speed: { min: 20, max: 40 },
            lifespan: 300,
            frequency: 50,
            tint: 0x444444,
            emitting: false
        });
    }
    
    applyUpgrades() {
        const upgrades = this.scene.registry.get('upgrades') || {};
        
        // Engine upgrades
        const engineLevel = upgrades.engine || 0;
        this.enginePower = GAME_CONFIG.CAR_SPEED + (engineLevel * 30);
        this.maxSpeed = GAME_CONFIG.CAR_SPEED + (engineLevel * 40);
        this.body.setMaxVelocityX(this.maxSpeed);
        
        // Armor upgrades
        const armorLevel = upgrades.armor || 0;
        this.armor = armorLevel * 5; // 5% damage reduction per level
        
        // Fuel tank upgrades
        const fuelTankLevel = upgrades.fuelTank || 0;
        this.maxFuel = 100 + (fuelTankLevel * 20);
        this.fuel = this.maxFuel;
        
        // Suspension upgrades
        const suspensionLevel = upgrades.suspension || 0;
        this.jumpForce = GAME_CONFIG.JUMP_FORCE - (suspensionLevel * 20); // More negative = higher jump
        
        console.log('Car upgrades applied:', {
            engine: engineLevel,
            armor: armorLevel,
            fuelTank: fuelTankLevel,
            suspension: suspensionLevel
        });
    }
    
    update(keys, wasd, delta) {
        if (!this.active) return;
        
        this.handleInput(keys, wasd);
        this.updatePhysics(delta);
        this.updateVisuals();
        this.updateEffects();
        this.handleGroundCheck();
        
        // Consume fuel when accelerating
        if (this.isAccelerating && this.fuel > 0) {
            this.fuel -= this.fuelConsumptionRate * (delta / 1000);
            this.fuel = Math.max(0, this.fuel);
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
        this.isAccelerating = false;
        
        // Can't accelerate without fuel
        if (this.fuel <= 0) {
            return;
        }
        
        // Left/Right movement
        if (keys.left.isDown || wasd.A.isDown) {
            if (this.body.velocity.x > -50) {
                this.body.setAccelerationX(-this.enginePower * 0.5); // Slower reverse
            }
        } else if (keys.right.isDown || wasd.D.isDown) {
            this.body.setAccelerationX(this.enginePower);
            this.isAccelerating = true;
        } else {
            this.body.setAccelerationX(0);
        }
        
        // Jumping
        if ((keys.up.isDown || wasd.W.isDown) && this.isGrounded && this.body.velocity.y > -10) {
            this.body.setVelocityY(this.jumpForce);
            this.isGrounded = false;
            
            // Play jump sound
            if (this.scene.audioManager) {
                this.scene.audioManager.playSound('car_jump');
            }
        }
    }
    
    updatePhysics(delta) {
        // Air resistance when not accelerating
        if (!this.isAccelerating && Math.abs(this.body.velocity.x) > 10) {
            const airResistance = this.body.velocity.x * 0.02;
            this.body.setVelocityX(this.body.velocity.x - airResistance);
        }
        
        // Ground friction
        if (this.isGrounded && !this.isAccelerating) {
            const friction = this.body.velocity.x * 0.1;
            this.body.setVelocityX(this.body.velocity.x - friction);
        }
    }
    
    updateVisuals() {
        // Rotate wheels based on velocity
        this.wheels.forEach(wheel => {
            wheel.x = this.x + (wheel === this.wheels[0] ? -25 : 25);
            wheel.y = this.y + 20;
            
            const rotationSpeed = this.body.velocity.x * 0.01;
            wheel.rotation += rotationSpeed;
        });
        
        // Tilt car slightly based on acceleration
        if (this.isAccelerating) {
            this.rotation = Phaser.Math.Angle.RotateTo(this.rotation, -0.1, 0.02);
        } else if (this.body.velocity.x < -50) {
            this.rotation = Phaser.Math.Angle.RotateTo(this.rotation, 0.05, 0.02);
        } else {
            this.rotation = Phaser.Math.Angle.RotateTo(this.rotation, 0, 0.02);
        }
        
        // Car body animation when landing
        if (this.isGrounded && Math.abs(this.body.velocity.y) > 100) {
            this.scene.tweens.add({
                targets: this,
                scaleY: 0.9,
                duration: 100,
                yoyo: true,
                ease: 'Power2'
            });
        }
    }
    
    updateEffects() {
        // Update exhaust particles
        if (this.exhaustParticles) {
            this.exhaustParticles.setPosition(this.x - 40, this.y + 5);
            
            if (this.isAccelerating && this.fuel > 0) {
                this.exhaustParticles.setEmitting(true);
                this.exhaustParticles.setFrequency(30);
            } else {
                this.exhaustParticles.setEmitting(false);
            }
        }
    }
    
    handleGroundCheck() {
        // Simple ground check - if not moving vertically much and velocity was downward
        const wasGrounded = this.isGrounded;
        this.isGrounded = this.body.blocked.down || (Math.abs(this.body.velocity.y) < 10 && this.body.velocity.y >= 0);
        
        // Landing effects
        if (this.isGrounded && !wasGrounded && this.body.velocity.y > 200) {
            this.createLandingEffect();
            
            if (this.scene.audioManager) {
                this.scene.audioManager.playSound('car_land');
            }
        }
    }
    
    createLandingEffect() {
        // Dust particles on landing
        if (this.scene.effects) {
            this.scene.effects.createDustEffect(this.x, this.y + 25);
        }
        
        // Camera shake
        this.scene.cameras.main.shake(200, 0.01);
    }
    
    takeDamage(amount) {
        if (this.invulnerable) return;
        
        // Apply armor reduction
        const actualDamage = amount * (1 - this.armor / 100);
        this.health -= actualDamage;
        this.health = Math.max(0, this.health);
        
        console.log(`Car took ${actualDamage} damage, health: ${this.health}`);
        
        // Damage effects
        this.invulnerable = true;
        this.damageFlashTimer = 500;
        
        // Knockback
        const knockbackForce = actualDamage * 2;
        this.body.setVelocityX(this.body.velocity.x - knockbackForce);
        
        // Screen shake
        this.scene.cameras.main.shake(300, 0.02);
        
        // Create damage effect
        if (this.scene.effects) {
            this.scene.effects.createDamageNumber(this.x, this.y - 20, Math.floor(actualDamage));
        }
        
        return this.health <= 0;
    }
    
    refuel(amount) {
        this.fuel += amount;
        this.fuel = Math.min(this.fuel, this.maxFuel);
        
        console.log(`Car refueled by ${amount}, fuel: ${this.fuel}`);
        
        if (this.scene.effects) {
            this.scene.effects.createPickupEffect(this.x, this.y - 30, 0x00ff00);
        }
    }
    
    repair(amount) {
        this.health += amount;
        this.health = Math.min(this.health, this.maxHealth);
        
        console.log(`Car repaired by ${amount}, health: ${this.health}`);
        
        if (this.scene.effects) {
            this.scene.effects.createPickupEffect(this.x, this.y - 30, 0x4caf50);
        }
    }
    
    destroy() {
        // Clean up wheels
        if (this.wheels) {
            this.wheels.forEach(wheel => wheel.destroy());
        }
        
        // Clean up exhaust particles
        if (this.exhaustParticles) {
            this.exhaustParticles.destroy();
        }
        
        super.destroy();
    }
}
