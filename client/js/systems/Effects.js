class Effects {
    constructor(scene) {
        this.scene = scene;
        this.activeEffects = [];
        this.particleEmitters = new Map();
        
        this.initialize();
        console.log('Effects system initialized');
    }
    
    initialize() {
        // Create reusable graphics for effects
        this.createEffectTextures();
        
        // Set up particle emitters
        this.setupParticleEmitters();
    }
    
    createEffectTextures() {
        // Create simple particle textures
        if (!this.scene.textures.exists('spark')) {
            const graphics = this.scene.add.graphics();
            graphics.fillStyle(0xffffff);
            graphics.fillCircle(4, 4, 4);
            graphics.generateTexture('spark', 8, 8);
            graphics.destroy();
        }
        
        if (!this.scene.textures.exists('dust')) {
            const graphics = this.scene.add.graphics();
            graphics.fillStyle(0x888888);
            graphics.fillCircle(3, 3, 3);
            graphics.generateTexture('dust', 6, 6);
            graphics.destroy();
        }
    }
    
    setupParticleEmitters() {
        // Spark emitter for impacts
        if (this.scene.textures.exists('spark')) {
            this.sparkEmitter = this.scene.add.particles(0, 0, 'spark', {
                speed: { min: 50, max: 150 },
                scale: { start: 0.3, end: 0 },
                alpha: { start: 1, end: 0 },
                lifespan: { min: 200, max: 400 },
                quantity: 5,
                emitting: false
            });
            this.sparkEmitter.setDepth(20);
        } else {
            console.warn('Spark texture not available, spark emitter disabled');
        }
        
        // Dust emitter for landings
        if (this.scene.textures.exists('dust')) {
            this.dustEmitter = this.scene.add.particles(0, 0, 'dust', {
                speed: { min: 20, max: 80 },
                scale: { start: 0.5, end: 0 },
                alpha: { start: 0.6, end: 0 },
                lifespan: { min: 500, max: 1000 },
                gravityY: 100,
                quantity: 8,
                emitting: false
            });
            this.dustEmitter.setDepth(15);
        } else {
            console.warn('Dust texture not available, dust emitter disabled');
        }
        
        console.log('Particle emitters created');
    }
    
    // Create impact effect for collisions
    createImpact(x, y, color = 0xffffff, intensity = 1) {
        // Spark burst
        if (this.sparkEmitter) {
            this.sparkEmitter.setPosition(x, y);
            this.sparkEmitter.setTint(color);
            this.sparkEmitter.setConfig({
                quantity: Math.floor(5 * intensity),
                speed: { min: 50 * intensity, max: 150 * intensity }
            });
            this.sparkEmitter.explode();
        }
        
        // Flash effect
        const flash = this.scene.add.circle(x, y, 15 * intensity, color, 0.8);
        flash.setDepth(25);
        
        this.scene.tweens.add({
            targets: flash,
            scale: 3,
            alpha: 0,
            duration: 200,
            ease: 'Power2',
            onComplete: () => flash.destroy()
        });
        
        console.log('Impact effect created at', x, y);
    }
    
    // Create explosion effect for enemy deaths
    createExplosion(x, y, size = 1) {
        // Multiple rings expanding
        const colors = [0xff4444, 0xff8800, 0xffff00];
        
        colors.forEach((color, index) => {
            const ring = this.scene.add.circle(x, y, 5, color, 0.8);
            ring.setDepth(25);
            
            this.scene.tweens.add({
                targets: ring,
                scale: (3 + index) * size,
                alpha: 0,
                duration: 300 + index * 100,
                ease: 'Power2',
                onComplete: () => ring.destroy()
            });
        });
        
        // Spark burst
        if (this.sparkEmitter) {
            this.sparkEmitter.setPosition(x, y);
            this.sparkEmitter.setTint(0xff8800);
            this.sparkEmitter.setConfig({
                quantity: Math.floor(15 * size),
                speed: { min: 100, max: 250 },
                lifespan: { min: 300, max: 600 }
            });
            this.sparkEmitter.explode();
        }
        
        console.log('Explosion effect created at', x, y);
    }
    
    // Create dust effect for landings
    createDustEffect(x, y) {
        if (this.dustEmitter) {
            this.dustEmitter.setPosition(x, y);
            this.dustEmitter.setTint(0xcccccc);
            this.dustEmitter.explode();
        }
        
        console.log('Dust effect created at', x, y);
    }
    
    // Create pickup effect for coins and items
    createPickupEffect(x, y, color = 0xffd700) {
        // Sparkle effect
        for (let i = 0; i < 8; i++) {
            const sparkle = this.scene.add.circle(x, y, 3, color, 0.8);
            sparkle.setDepth(20);
            
            const angle = (i / 8) * Math.PI * 2;
            const distance = 30;
            const targetX = x + Math.cos(angle) * distance;
            const targetY = y + Math.sin(angle) * distance - 20;
            
            this.scene.tweens.add({
                targets: sparkle,
                x: targetX,
                y: targetY,
                scale: 0,
                alpha: 0,
                duration: 600,
                ease: 'Power2',
                onComplete: () => sparkle.destroy()
            });
        }
        
        // Plus text
        const text = this.scene.add.text(x, y - 20, '+', {
            fontSize: '24px',
            color: color === 0xffd700 ? '#ffd700' : '#00ff00',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        text.setDepth(30);
        
        this.scene.tweens.add({
            targets: text,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => text.destroy()
        });
        
        console.log('Pickup effect created at', x, y);
    }
    
    // Create damage number effect
    createDamageNumber(x, y, damage, color = '#ff4444') {
        const text = this.scene.add.text(x, y, `-${Math.floor(damage)}`, {
            fontSize: '18px',
            color: color,
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        text.setDepth(30);
        
        // Animate damage number
        this.scene.tweens.add({
            targets: text,
            y: y - 40,
            scale: 1.2,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => text.destroy()
        });
        
        console.log('Damage number created:', damage);
    }
    
    // Create heal effect
    createHealEffect(x, y) {
        // Green sparkles
        for (let i = 0; i < 6; i++) {
            const sparkle = this.scene.add.circle(x, y, 4, 0x00ff00, 0.8);
            sparkle.setDepth(20);
            
            const angle = (i / 6) * Math.PI * 2;
            const distance = 25;
            const targetX = x + Math.cos(angle) * distance;
            const targetY = y + Math.sin(angle) * distance;
            
            this.scene.tweens.add({
                targets: sparkle,
                x: targetX,
                y: targetY,
                scale: 0,
                alpha: 0,
                duration: 800,
                ease: 'Power2',
                onComplete: () => sparkle.destroy()
            });
        }
        
        // Plus symbol
        const plus = this.scene.add.text(x, y, '+', {
            fontSize: '20px',
            color: '#00ff00',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        plus.setDepth(30);
        
        this.scene.tweens.add({
            targets: plus,
            y: y - 30,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => plus.destroy()
        });
    }
    
    // Create muzzle flash for guns
    createMuzzleFlash(x, y) {
        const flash = this.scene.add.circle(x, y, 8, 0xffff88, 0.9);
        flash.setDepth(25);
        
        this.scene.tweens.add({
            targets: flash,
            scale: 2,
            alpha: 0,
            duration: 100,
            ease: 'Power2',
            onComplete: () => flash.destroy()
        });
        
        // Sparks
        this.sparkEmitter.setPosition(x, y);
        this.sparkEmitter.setTint(0xffff88);
        this.sparkEmitter.setConfig({
            quantity: 3,
            speed: { min: 30, max: 80 },
            lifespan: { min: 100, max: 200 }
        });
        this.sparkEmitter.explode();
    }
    
    // Create sparks effect
    createSparks(x, y, count = 5, color = 0xffffff) {
        this.sparkEmitter.setPosition(x, y);
        this.sparkEmitter.setTint(color);
        this.sparkEmitter.setConfig({
            quantity: count,
            speed: { min: 50, max: 120 }
        });
        this.sparkEmitter.explode();
    }
    
    // Screen shake effect
    createScreenShake(duration = 200, intensity = 0.01) {
        this.scene.cameras.main.shake(duration, intensity);
        console.log('Screen shake effect triggered');
    }
    
    // Slow motion effect
    createSlowMotion(duration = 1000, factor = 0.5) {
        this.scene.physics.world.timeScale = factor;
        this.scene.tweens.timeScale = factor;
        
        this.scene.time.delayedCall(duration, () => {
            this.scene.physics.world.timeScale = 1;
            this.scene.tweens.timeScale = 1;
        });
        
        console.log('Slow motion effect applied');
    }
    
    // Create trail effect for moving objects
    createTrail(targetObject, color = 0x8888ff, length = 10) {
        const trail = {
            target: targetObject,
            points: [],
            maxLength: length,
            graphics: this.scene.add.graphics(),
            color: color
        };
        
        trail.graphics.setDepth(5);
        this.activeEffects.push(trail);
        
        return trail;
    }
    
    // Update trail effects
    updateTrails() {
        this.activeEffects.forEach((effect, index) => {
            if (effect.target && effect.target.active) {
                // Add current position to trail
                effect.points.push({ x: effect.target.x, y: effect.target.y });
                
                // Limit trail length
                if (effect.points.length > effect.maxLength) {
                    effect.points.shift();
                }
                
                // Draw trail
                effect.graphics.clear();
                if (effect.points.length > 1) {
                    effect.graphics.lineStyle(3, effect.color, 0.5);
                    effect.graphics.beginPath();
                    effect.graphics.moveTo(effect.points[0].x, effect.points[0].y);
                    
                    for (let i = 1; i < effect.points.length; i++) {
                        const alpha = i / effect.points.length;
                        effect.graphics.lineStyle(3, effect.color, alpha * 0.5);
                        effect.graphics.lineTo(effect.points[i].x, effect.points[i].y);
                    }
                    
                    effect.graphics.strokePath();
                }
            } else {
                // Remove inactive trails
                effect.graphics.destroy();
                this.activeEffects.splice(index, 1);
            }
        });
    }
    
    // Update effects system
    update() {
        this.updateTrails();
    }
    
    // Clean up effects system
    destroy() {
        // Destroy particle emitters
        this.sparkEmitter.destroy();
        this.dustEmitter.destroy();
        
        // Clean up active effects
        this.activeEffects.forEach(effect => {
            if (effect.graphics) {
                effect.graphics.destroy();
            }
        });
        this.activeEffects = [];
        
        console.log('Effects system destroyed');
    }
}
