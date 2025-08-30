class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'coin'); // Using coin texture as placeholder
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Bullet properties
        this.damage = 30;
        this.speed = 600;
        this.lifespan = 2000; // 2 seconds
        this.lifeTimer = 0;
        
        // Physics setup
        this.body.setSize(8, 8);
        this.body.setOffset(12, 12); // Center the smaller hitbox
        this.setScale(0.3); // Make bullet smaller
        this.setTint(0xffff00); // Yellow tint to distinguish from coins
        
        // Visual trail
        this.trail = [];
        this.maxTrailLength = 5;
        
        // Set inactive by default
        this.setActive(false);
        this.setVisible(false);
        
        console.log('Bullet created');
    }
    
    fire(startX, startY, velocityX, velocityY, damage = 30) {
        // Reset bullet state
        this.setPosition(startX, startY);
        this.setActive(true);
        this.setVisible(true);
        this.setAlpha(1);
        
        // Set properties
        this.damage = damage;
        this.lifeTimer = this.lifespan;
        
        // Set velocity
        this.body.setVelocity(velocityX, velocityY);
        this.body.setGravityY(0); // Bullets ignore gravity
        
        // Rotate bullet to match direction
        this.rotation = Phaser.Math.Angle.Between(0, 0, velocityX, velocityY);
        
        // Clear trail
        this.trail = [];
        
        console.log('Bullet fired from', startX, startY, 'with velocity', velocityX, velocityY);
    }
    
    update(time, delta) {
        if (!this.active) return;
        
        // Update lifetime
        this.lifeTimer -= delta;
        if (this.lifeTimer <= 0) {
            this.deactivate();
            return;
        }
        
        // Update trail
        this.updateTrail();
        
        // Fade out near end of life
        if (this.lifeTimer < 500) {
            this.setAlpha(this.lifeTimer / 500);
        }
        
        // Check if bullet has left the world bounds
        const camera = this.scene.cameras.main;
        const bounds = {
            left: camera.scrollX - 100,
            right: camera.scrollX + camera.width + 100,
            top: -100,
            bottom: camera.height + 100
        };
        
        if (this.x < bounds.left || this.x > bounds.right || 
            this.y < bounds.top || this.y > bounds.bottom) {
            this.deactivate();
        }
    }
    
    updateTrail() {
        // Add current position to trail
        this.trail.push({ x: this.x, y: this.y });
        
        // Limit trail length
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        // Visual trail effect could be added here
        // For now, we'll keep it simple
    }
    
    onHit() {
        // Create impact effect
        if (this.scene.effects) {
            this.scene.effects.createImpact(this.x, this.y, 0xffff00);
            this.scene.effects.createSparks(this.x, this.y);
        }
        
        // Play hit sound
        if (this.scene.audioManager) {
            this.scene.audioManager.playSound('bullet_hit');
        }
        
        // Deactivate bullet
        this.deactivate();
    }
    
    deactivate() {
        this.setActive(false);
        this.setVisible(false);
        this.body.setVelocity(0, 0);
        this.trail = [];
        
        console.log('Bullet deactivated');
    }
    
    // Static method to create bullet pool
    static createPool(scene, size = 30) {
        const bullets = scene.physics.add.group({
            classType: Bullet,
            maxSize: size,
            runChildUpdate: true, // Important: allows bullets to update themselves
            createCallback: (bullet) => {
                bullet.setActive(false);
                bullet.setVisible(false);
            }
        });
        
        console.log(`Bullet pool created with ${size} bullets`);
        return bullets;
    }
    
    // Get bullet from pool and fire it
    static fireFromPool(bulletPool, startX, startY, velocityX, velocityY, damage = 30) {
        const bullet = bulletPool.get();
        
        if (bullet) {
            bullet.fire(startX, startY, velocityX, velocityY, damage);
            return bullet;
        } else {
            console.warn('No bullets available in pool');
            return null;
        }
    }
    
    // Clean up bullets that are outside camera bounds or expired
    static cleanupPool(bulletPool, camera) {
        bulletPool.children.entries.forEach(bullet => {
            if (bullet.active) {
                const bounds = {
                    left: camera.scrollX - 200,
                    right: camera.scrollX + camera.width + 200,
                    top: -200,
                    bottom: camera.height + 200
                };
                
                if (bullet.x < bounds.left || bullet.x > bounds.right || 
                    bullet.y < bounds.top || bullet.y > bounds.bottom) {
                    bullet.deactivate();
                }
            }
        });
    }
    
    // Get debug info
    getDebugInfo() {
        return {
            active: this.active,
            position: { x: Math.floor(this.x), y: Math.floor(this.y) },
            velocity: { x: Math.floor(this.body.velocity.x), y: Math.floor(this.body.velocity.y) },
            lifeTimer: Math.floor(this.lifeTimer),
            damage: this.damage
        };
    }
}
