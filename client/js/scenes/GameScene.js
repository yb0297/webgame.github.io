class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    
    init() {
        console.log('Game Scene: Initializing');
        
        // Game state
        this.gameState = {
            distance: 0,
            coins: 0,
            mode: 'car', // 'car' or 'foot'
            isPaused: false,
            gameOver: false
        };
        
        // Camera and world setup
        this.cameraTarget = null;
        this.worldSpeed = 2;
        this.baseWorldSpeed = 2;
        
        // Enemy spawning
        this.enemySpawnTimer = 0;
        this.enemySpawnRate = 3000; // milliseconds
        
        // Object pools
        this.enemies = null;
        this.coins = null;
        this.bullets = null;
    }
    
    create() {
        console.log('Game Scene: Creating game world');
        
        // Set world bounds
        this.physics.world.setBounds(0, 0, GAME_CONFIG.WORLD_WIDTH, GAME_CONFIG.WORLD_HEIGHT);
        
        // Initialize systems
        this.initializeSystems();
        
        // Create world
        this.createWorld();
        
        // Create entities
        this.createEntities();
        
        // Setup input
        this.setupInput();
        
        // Setup collisions
        this.setupCollisions();
        
        // Setup camera
        this.setupCamera();
        
        // Start game loop
        this.startGameLoop();
        
        console.log('Game Scene: Game world created successfully');
    }
    
    initializeSystems() {
        // Initialize parallax system
        this.parallax = new Parallax(this);
        
        // Initialize effects system
        this.effects = new Effects(this);
        
        // Get audio manager
        this.audioManager = this.registry.get('audioManager');
        
        // Initialize virtual controls for mobile
        this.virtualControls = new VirtualControls(this);
    }
    
    createWorld() {
        // Create ground
        this.ground = this.physics.add.staticGroup();
        
        // Create invisible ground colliders
        const groundHeight = 50;
        for (let x = 0; x < GAME_CONFIG.WORLD_WIDTH; x += 100) {
            const groundTile = this.add.rectangle(x, GAME_CONFIG.WORLD_HEIGHT - groundHeight/2, 100, groundHeight, 0x424242, 0);
            this.physics.add.existing(groundTile, true);
            this.ground.add(groundTile);
        }
        
        // Create pickup spawns
        this.createPickupSpawns();
    }
    
    createEntities() {
        // Create object pools
        this.enemies = this.physics.add.group({
            classType: Enemy,
            maxSize: 20,
            createCallback: (enemy) => {
                enemy.setActive(false);
                enemy.setVisible(false);
            }
        });
        
        this.coins = this.physics.add.group({
            maxSize: 50,
            createCallback: (coin) => {
                coin.setActive(false);
                coin.setVisible(false);
            }
        });
        
        this.bullets = this.physics.add.group({
            classType: Bullet,
            maxSize: 30,
            createCallback: (bullet) => {
                bullet.setActive(false);
                bullet.setVisible(false);
            }
        });
        
        // Create car
        this.car = new Car(this, 200, 400);
        this.cameraTarget = this.car;
        
        // Create player (inactive initially)
        this.player = new Player(this, 200, 400);
        this.player.setActive(false);
        this.player.setVisible(false);
        
        console.log('Entities created: Car, Player, and object pools');
    }
    
    setupInput() {
        // Keyboard input
        this.keys = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D,E,J,K');
        
        // Mouse input
        this.input.on('pointerdown', (pointer) => {
            if (this.gameState.mode === 'foot' && this.player.active) {
                this.player.shoot(pointer.worldX, pointer.worldY);
            }
        });
        
        // Pause key
        this.input.keyboard.on('keydown-ESC', () => {
            this.pauseGame();
        });
        
        console.log('Input system initialized');
    }
    
    setupCollisions() {
        // Player collisions
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.overlap(this.player, this.enemies, this.playerEnemyCollision, null, this);
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
        
        // Car collisions
        this.physics.add.collider(this.car, this.ground);
        this.physics.add.overlap(this.car, this.enemies, this.carEnemyCollision, null, this);
        this.physics.add.overlap(this.car, this.coins, this.collectCoin, null, this);
        
        // Bullet collisions
        this.physics.add.overlap(this.bullets, this.enemies, this.bulletEnemyCollision, null, this);
        
        // Enemy collisions with ground
        this.physics.add.collider(this.enemies, this.ground);
        
        console.log('Collision system initialized');
    }
    
    setupCamera() {
        this.cameras.main.setBounds(0, 0, GAME_CONFIG.WORLD_WIDTH, GAME_CONFIG.WORLD_HEIGHT);
        this.cameras.main.startFollow(this.cameraTarget);
        this.cameras.main.setLerp(0.1, 0.1);
        
        console.log('Camera system initialized');
    }
    
    startGameLoop() {
        // Enemy spawning timer
        this.enemySpawnTimer = this.time.addEvent({
            delay: this.enemySpawnRate,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
        
        // Distance tracking
        this.distanceTimer = this.time.addEvent({
            delay: 100,
            callback: this.updateDistance,
            callbackScope: this,
            loop: true
        });
        
        // Coin spawning
        this.coinSpawnTimer = this.time.addEvent({
            delay: 2000,
            callback: this.spawnCoin,
            callbackScope: this,
            loop: true
        });
        
        console.log('Game loop started');
    }
    
    update(time, delta) {
        if (this.gameState.isPaused || this.gameState.gameOver) {
            return;
        }
        
        // Update parallax
        if (this.parallax) {
            this.parallax.update(this.cameras.main.scrollX);
        }
        
        // Update active entity based on mode
        if (this.gameState.mode === 'car' && this.car.active) {
            this.car.update(this.keys, this.wasd, delta);
            this.handleCarInput();
        } else if (this.gameState.mode === 'foot' && this.player.active) {
            this.player.update(this.keys, this.wasd, delta);
            this.handlePlayerInput();
        }
        
        // Update virtual controls
        if (this.virtualControls) {
            this.virtualControls.update();
        }
        
        // Clean up inactive objects
        this.cleanupObjects();
        
        // Check game over conditions
        this.checkGameOver();
        
        // Update world speed based on progress
        this.updateWorldSpeed();
    }
    
    handleCarInput() {
        // Exit car
        if (Phaser.Input.Keyboard.JustDown(this.wasd.E)) {
            this.exitCar();
        }
    }
    
    handlePlayerInput() {
        // Enter car (if near car)
        if (Phaser.Input.Keyboard.JustDown(this.wasd.E)) {
            this.enterCar();
        }
        
        // Melee attacks
        if (Phaser.Input.Keyboard.JustDown(this.wasd.J)) {
            this.player.punch();
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.wasd.K)) {
            this.player.kick();
        }
    }
    
    exitCar() {
        if (this.gameState.mode === 'car' && this.car.body.velocity.x < 50) {
            console.log('Exiting car');
            
            this.gameState.mode = 'foot';
            this.car.setActive(false);
            this.car.setVisible(false);
            
            // Position player near car
            this.player.x = this.car.x + 60;
            this.player.y = this.car.y;
            this.player.setActive(true);
            this.player.setVisible(true);
            
            // Switch camera target
            this.cameraTarget = this.player;
            this.cameras.main.startFollow(this.cameraTarget);
            
            if (this.audioManager) {
                this.audioManager.playSound('car_exit');
            }
            
            // Update virtual controls
            this.virtualControls.updateMode('foot');
        }
    }
    
    enterCar() {
        if (this.gameState.mode === 'foot') {
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.car.x, this.car.y);
            
            if (distance < 80) {
                console.log('Entering car');
                
                this.gameState.mode = 'car';
                this.player.setActive(false);
                this.player.setVisible(false);
                
                // Position car and reactivate
                this.car.x = this.player.x;
                this.car.y = this.player.y;
                this.car.setActive(true);
                this.car.setVisible(true);
                
                // Switch camera target
                this.cameraTarget = this.car;
                this.cameras.main.startFollow(this.cameraTarget);
                
                if (this.audioManager) {
                    this.audioManager.playSound('car_enter');
                }
                
                // Update virtual controls
                this.virtualControls.updateMode('car');
            }
        }
    }
    
    spawnEnemy() {
        if (this.enemies.countActive() >= 15) {
            return; // Limit active enemies
        }
        
        const enemy = this.enemies.get();
        if (enemy) {
            const spawnX = this.cameras.main.scrollX + this.cameras.main.width + 100;
            const spawnY = 450 + Math.random() * 50;
            
            enemy.spawn(spawnX, spawnY);
            console.log('Enemy spawned at', spawnX, spawnY);
        }
    }
    
    spawnCoin() {
        if (this.coins.countActive() >= 30) {
            return; // Limit active coins
        }
        
        const coin = this.coins.get();
        if (!coin) {
            // Create new coin if pool is empty
            const newCoin = this.add.sprite(0, 0, 'coin').setScale(0.8);
            this.physics.add.existing(newCoin);
            newCoin.body.setSize(24, 24);
            this.coins.add(newCoin);
            this.spawnCoin(); // Try again with new coin
            return;
        }
        
        const spawnX = this.cameras.main.scrollX + this.cameras.main.width + Math.random() * 200;
        const spawnY = 300 + Math.random() * 150;
        
        coin.setPosition(spawnX, spawnY);
        coin.setActive(true);
        coin.setVisible(true);
        coin.body.setVelocityX(-this.worldSpeed * 50);
        
        // Animate coin
        this.tweens.add({
            targets: coin,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }
    
    createPickupSpawns() {
        // Create fuel pickups along the world
        for (let x = 500; x < GAME_CONFIG.WORLD_WIDTH; x += 300 + Math.random() * 200) {
            this.spawnFuelPickup(x, 400);
        }
    }
    
    spawnFuelPickup(x, y) {
        const fuel = this.add.rectangle(x, y, 20, 30, 0x00ff00);
        this.physics.add.existing(fuel);
        fuel.body.setImmovable(true);
        fuel.pickupType = 'fuel';
        
        // Add to coins group for collision detection
        this.coins.add(fuel);
    }
    
    updateDistance() {
        if (this.gameState.mode === 'car' && this.car.active) {
            this.gameState.distance += this.worldSpeed;
        } else if (this.gameState.mode === 'foot' && this.player.active) {
            this.gameState.distance += this.worldSpeed * 0.5; // Slower on foot
        }
        
        // Update registry for UI
        this.registry.set('gameDistance', Math.floor(this.gameState.distance));
    }
    
    updateWorldSpeed() {
        // Gradually increase world speed
        const speedIncrease = Math.floor(this.gameState.distance / 1000) * 0.2;
        this.worldSpeed = this.baseWorldSpeed + speedIncrease;
        this.worldSpeed = Math.min(this.worldSpeed, 5); // Cap at 5x
    }
    
    // Collision handlers
    playerEnemyCollision(player, enemy) {
        if (!enemy.active || player.invulnerable) {
            return;
        }
        
        player.takeDamage(20);
        enemy.takeDamage(30);
        
        // Create impact effect
        this.effects.createImpact(enemy.x, enemy.y, 0xff0000);
        
        if (this.audioManager) {
            this.audioManager.playSound('hit');
        }
    }
    
    carEnemyCollision(car, enemy) {
        if (!enemy.active) {
            return;
        }
        
        // Check if car is crushing enemy (moving fast)
        if (Math.abs(car.body.velocity.x) > 100) {
            enemy.takeDamage(100); // Instant kill
            this.gameState.coins += 5;
            this.effects.createExplosion(enemy.x, enemy.y);
            
            if (this.audioManager) {
                this.audioManager.playSound('crush');
            }
        } else {
            // Car takes damage
            car.takeDamage(15);
            enemy.takeDamage(50);
            
            this.effects.createImpact(car.x, car.y, 0xffa500);
        }
    }
    
    bulletEnemyCollision(bullet, enemy) {
        if (!bullet.active || !enemy.active) {
            return;
        }
        
        bullet.setActive(false);
        bullet.setVisible(false);
        
        enemy.takeDamage(40);
        this.effects.createImpact(enemy.x, enemy.y, 0x00ff00);
        
        if (this.audioManager) {
            this.audioManager.playSound('bullet_hit');
        }
    }
    
    collectCoin(collector, coin) {
        if (!coin.active) {
            return;
        }
        
        if (coin.pickupType === 'fuel') {
            // Refuel car
            if (this.car) {
                this.car.refuel(25);
            }
            
            this.effects.createPickupEffect(coin.x, coin.y, 0x00ff00);
        } else {
            // Regular coin
            this.gameState.coins += GAME_CONFIG.COIN_VALUE;
            this.effects.createPickupEffect(coin.x, coin.y, 0xffd700);
        }
        
        coin.setActive(false);
        coin.setVisible(false);
        
        if (this.audioManager) {
            this.audioManager.playSound('coin_pickup');
        }
        
        // Update registry for UI
        this.registry.set('gameCoins', this.gameState.coins);
    }
    
    cleanupObjects() {
        const cameraLeft = this.cameras.main.scrollX - 200;
        
        // Cleanup enemies
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.active && enemy.x < cameraLeft) {
                enemy.setActive(false);
                enemy.setVisible(false);
            }
        });
        
        // Cleanup coins
        this.coins.children.entries.forEach(coin => {
            if (coin.active && coin.x < cameraLeft) {
                coin.setActive(false);
                coin.setVisible(false);
            }
        });
        
        // Cleanup bullets
        this.bullets.children.entries.forEach(bullet => {
            if (bullet.active && (bullet.x < cameraLeft || bullet.x > this.cameras.main.scrollX + this.cameras.main.width + 100)) {
                bullet.setActive(false);
                bullet.setVisible(false);
            }
        });
    }
    
    checkGameOver() {
        let gameOver = false;
        let reason = '';
        
        if (this.gameState.mode === 'car' && this.car.active) {
            if (this.car.fuel <= 0) {
                gameOver = true;
                reason = 'Out of fuel!';
            } else if (this.car.health <= 0) {
                gameOver = true;
                reason = 'Car destroyed!';
            }
        } else if (this.gameState.mode === 'foot' && this.player.active) {
            if (this.player.health <= 0) {
                gameOver = true;
                reason = 'Player died!';
            }
        }
        
        if (gameOver && !this.gameState.gameOver) {
            this.gameOver(reason);
        }
    }
    
    gameOver(reason) {
        console.log('Game Over:', reason);
        this.gameState.gameOver = true;
        
        // Stop timers
        if (this.enemySpawnTimer) this.enemySpawnTimer.destroy();
        if (this.distanceTimer) this.distanceTimer.destroy();
        if (this.coinSpawnTimer) this.coinSpawnTimer.destroy();
        
        // Save progress
        const coins = this.registry.get('coins') || 0;
        const newCoins = coins + this.gameState.coins;
        this.registry.set('coins', newCoins);
        
        const highScore = this.registry.get('highScore') || 0;
        const newHighScore = Math.max(highScore, this.gameState.distance);
        this.registry.set('highScore', newHighScore);
        
        // Save to local storage
        const saveManager = this.registry.get('saveManager');
        if (saveManager) {
            saveManager.save('gameData', {
                coins: newCoins,
                highScore: newHighScore,
                upgrades: this.registry.get('upgrades') || {}
            });
        }
        
        // Show game over after delay
        this.time.delayedCall(2000, () => {
            this.showGameOverScreen(reason);
        });
    }
    
    showGameOverScreen(reason) {
        // Create game over overlay
        const overlay = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.7
        );
        overlay.setScrollFactor(0);
        
        // Game over text
        const gameOverText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 100,
            'GAME OVER',
            {
                fontSize: '48px',
                color: '#e94560',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5).setScrollFactor(0);
        
        // Reason text
        this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 40,
            reason,
            {
                fontSize: '18px',
                color: '#f5f5f5',
                fontFamily: 'Arial'
            }
        ).setOrigin(0.5).setScrollFactor(0);
        
        // Stats
        this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 20,
            `Distance: ${Math.floor(this.gameState.distance)}m\nCoins Earned: ${this.gameState.coins}`,
            {
                fontSize: '16px',
                color: '#f5f5f5',
                fontFamily: 'Arial',
                align: 'center'
            }
        ).setOrigin(0.5).setScrollFactor(0);
        
        // Restart button
        const restartButton = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 100,
            200,
            50,
            0xe94560
        ).setInteractive().setScrollFactor(0);
        
        const restartText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 100,
            'RESTART',
            {
                fontSize: '20px',
                color: '#ffffff',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5).setScrollFactor(0);
        
        restartButton.on('pointerdown', () => {
            this.scene.stop('UIScene');
            this.scene.start('MenuScene');
        });
        
        // Menu button
        const menuButton = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 170,
            150,
            40,
            0x424242
        ).setInteractive().setScrollFactor(0);
        
        const menuText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 170,
            'MENU',
            {
                fontSize: '16px',
                color: '#f5f5f5',
                fontFamily: 'Arial'
            }
        ).setOrigin(0.5).setScrollFactor(0);
        
        menuButton.on('pointerdown', () => {
            this.scene.stop('UIScene');
            this.scene.start('MenuScene');
        });
    }
    
    pauseGame() {
        if (!this.gameState.gameOver) {
            this.scene.pause();
            this.scene.launch('PauseScene');
        }
    }
}
