class Parallax {
    constructor(scene) {
        this.scene = scene;
        this.layers = [];
        this.enabled = true;
        
        this.createLayers();
        console.log('Parallax system initialized');
    }
    
    createLayers() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        // Background layer (far) - slowest movement
        this.createLayer('bg_far', 0.1, -100, width * 2);
        
        // Midground layer - medium movement
        this.createLayer('bg_mid', 0.3, -50, width * 2);
        
        // Foreground layer (near) - fastest movement
        this.createLayer('bg_near', 0.6, 0, width * 2);
        
        // Add some procedural background elements
        this.createProceduralElements();
    }
    
    createLayer(textureKey, scrollFactor, yOffset, tileWidth) {
        const layer = {
            sprites: [],
            scrollFactor: scrollFactor,
            yOffset: yOffset,
            tileWidth: tileWidth
        };
        
        // Create multiple sprites to tile across the world
        const tilesNeeded = Math.ceil(GAME_CONFIG.WORLD_WIDTH / tileWidth) + 2;
        
        for (let i = 0; i < tilesNeeded; i++) {
            const sprite = this.scene.add.tileSprite(
                i * tileWidth,
                this.scene.cameras.main.height / 2 + yOffset,
                tileWidth,
                this.scene.cameras.main.height,
                textureKey
            );
            
            sprite.setOrigin(0, 0.5);
            sprite.setScrollFactor(0); // We'll handle scrolling manually
            sprite.setDepth(-10 - (scrollFactor * 10)); // Farther layers are deeper
            
            layer.sprites.push(sprite);
        }
        
        this.layers.push(layer);
        console.log(`Created parallax layer: ${textureKey} with ${tilesNeeded} tiles`);
    }
    
    createProceduralElements() {
        // Add some floating clouds in the background
        this.createClouds();
        
        // Add distant mountains/buildings
        this.createDistantObjects();
    }
    
    createClouds() {
        const cloudLayer = {
            sprites: [],
            scrollFactor: 0.05,
            yOffset: -200,
            elements: []
        };
        
        // Create simple cloud shapes
        for (let i = 0; i < 8; i++) {
            const cloud = this.scene.add.graphics();
            cloud.fillStyle(0xffffff, 0.3);
            
            // Draw simple cloud shape
            cloud.fillCircle(0, 0, 20);
            cloud.fillCircle(15, -5, 18);
            cloud.fillCircle(-12, -3, 16);
            cloud.fillCircle(8, -15, 14);
            
            const x = Math.random() * GAME_CONFIG.WORLD_WIDTH;
            const y = 100 + Math.random() * 150;
            
            cloud.setPosition(x, y);
            cloud.setScrollFactor(0);
            cloud.setDepth(-50);
            
            cloudLayer.elements.push({
                sprite: cloud,
                baseX: x,
                floatOffset: Math.random() * Math.PI * 2,
                floatSpeed: 0.5 + Math.random() * 0.5
            });
        }
        
        this.cloudLayer = cloudLayer;
        console.log('Created cloud layer with', cloudLayer.elements.length, 'clouds');
    }
    
    createDistantObjects() {
        // Create simple distant building/mountain silhouettes
        const distantLayer = {
            sprites: [],
            scrollFactor: 0.2,
            elements: []
        };
        
        for (let i = 0; i < 15; i++) {
            const building = this.scene.add.graphics();
            building.fillStyle(0x1a1a2e, 0.6);
            
            const width = 40 + Math.random() * 60;
            const height = 80 + Math.random() * 120;
            
            building.fillRect(-width/2, -height, width, height);
            
            // Add some windows
            building.fillStyle(0xffff88, 0.3);
            for (let w = 0; w < Math.floor(width / 15); w++) {
                for (let h = 0; h < Math.floor(height / 20); h++) {
                    if (Math.random() > 0.7) {
                        building.fillRect(-width/2 + w * 15 + 3, -height + h * 20 + 3, 8, 12);
                    }
                }
            }
            
            const x = i * (GAME_CONFIG.WORLD_WIDTH / 15) + Math.random() * 100;
            const y = this.scene.cameras.main.height - 50;
            
            building.setPosition(x, y);
            building.setScrollFactor(0);
            building.setDepth(-30);
            
            distantLayer.elements.push({
                sprite: building,
                baseX: x
            });
        }
        
        this.distantLayer = distantLayer;
        console.log('Created distant objects layer');
    }
    
    update(cameraScrollX) {
        if (!this.enabled) return;
        
        // Update main parallax layers
        this.layers.forEach(layer => {
            const parallaxX = cameraScrollX * layer.scrollFactor;
            
            layer.sprites.forEach((sprite, index) => {
                const baseX = index * layer.tileWidth;
                sprite.x = baseX - parallaxX;
                
                // Wrap tiles that go off screen
                if (sprite.x < cameraScrollX - layer.tileWidth) {
                    sprite.x += layer.sprites.length * layer.tileWidth;
                } else if (sprite.x > cameraScrollX + this.scene.cameras.main.width + layer.tileWidth) {
                    sprite.x -= layer.sprites.length * layer.tileWidth;
                }
            });
        });
        
        // Update clouds with floating animation
        if (this.cloudLayer) {
            this.cloudLayer.elements.forEach(cloud => {
                const parallaxX = cameraScrollX * this.cloudLayer.scrollFactor;
                const floatY = Math.sin(this.scene.time.now * 0.001 * cloud.floatSpeed + cloud.floatOffset) * 10;
                
                cloud.sprite.setPosition(
                    cloud.baseX - parallaxX,
                    cloud.sprite.y + floatY * 0.1
                );
            });
        }
        
        // Update distant objects
        if (this.distantLayer) {
            this.distantLayer.elements.forEach(obj => {
                const parallaxX = cameraScrollX * this.distantLayer.scrollFactor;
                obj.sprite.setPosition(obj.baseX - parallaxX, obj.sprite.y);
            });
        }
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
        console.log('Parallax system', enabled ? 'enabled' : 'disabled');
    }
    
    // Add dynamic weather effects
    addWeatherEffect(type) {
        switch (type) {
            case 'rain':
                this.createRainEffect();
                break;
            case 'snow':
                this.createSnowEffect();
                break;
            case 'fog':
                this.createFogEffect();
                break;
        }
    }
    
    createRainEffect() {
        const rainLayer = {
            particles: [],
            scrollFactor: 0.8
        };
        
        // Create rain particles
        for (let i = 0; i < 50; i++) {
            const rain = this.scene.add.graphics();
            rain.lineStyle(2, 0x4488cc, 0.6);
            rain.lineBetween(0, 0, 2, 20);
            
            const x = Math.random() * (GAME_CONFIG.WORLD_WIDTH + 200);
            const y = Math.random() * this.scene.cameras.main.height;
            
            rain.setPosition(x, y);
            rain.setScrollFactor(0);
            rain.setDepth(10);
            
            rainLayer.particles.push({
                sprite: rain,
                speed: 300 + Math.random() * 200,
                baseX: x
            });
        }
        
        this.rainLayer = rainLayer;
        
        // Animate rain
        this.scene.time.addEvent({
            delay: 16, // ~60fps
            callback: this.updateRain,
            callbackScope: this,
            loop: true
        });
        
        console.log('Rain effect added');
    }
    
    updateRain() {
        if (!this.rainLayer) return;
        
        const camera = this.scene.cameras.main;
        const cameraScrollX = camera.scrollX;
        
        this.rainLayer.particles.forEach(drop => {
            // Move rain down
            drop.sprite.y += drop.speed * 0.016; // Approximate 60fps delta
            
            // Parallax effect
            const parallaxX = cameraScrollX * this.rainLayer.scrollFactor;
            drop.sprite.x = drop.baseX - parallaxX;
            
            // Reset rain drop if it goes off screen
            if (drop.sprite.y > camera.height + 50) {
                drop.sprite.y = -50;
                drop.baseX = Math.random() * (GAME_CONFIG.WORLD_WIDTH + 200);
            }
        });
    }
    
    // Method to change time of day
    setTimeOfDay(timeOfDay) {
        let tint = 0xffffff;
        
        switch (timeOfDay) {
            case 'dawn':
                tint = 0xffccaa;
                break;
            case 'day':
                tint = 0xffffff;
                break;
            case 'dusk':
                tint = 0xffaa88;
                break;
            case 'night':
                tint = 0x6666cc;
                break;
        }
        
        // Apply tint to all layers
        this.layers.forEach(layer => {
            layer.sprites.forEach(sprite => {
                sprite.setTint(tint);
            });
        });
        
        console.log('Time of day changed to:', timeOfDay);
    }
    
    destroy() {
        // Clean up all layers
        this.layers.forEach(layer => {
            layer.sprites.forEach(sprite => sprite.destroy());
        });
        
        if (this.cloudLayer) {
            this.cloudLayer.elements.forEach(cloud => cloud.sprite.destroy());
        }
        
        if (this.distantLayer) {
            this.distantLayer.elements.forEach(obj => obj.sprite.destroy());
        }
        
        if (this.rainLayer) {
            this.rainLayer.particles.forEach(drop => drop.sprite.destroy());
        }
        
        console.log('Parallax system destroyed');
    }
}
