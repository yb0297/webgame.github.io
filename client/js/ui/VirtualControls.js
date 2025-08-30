class VirtualControls {
    constructor(scene) {
        this.scene = scene;
        this.isMobile = this.detectMobile();
        this.controls = new Map();
        this.activeInputs = new Set();
        this.currentMode = 'car'; // 'car' or 'foot'
        
        if (this.isMobile) {
            this.createControls();
        }
        
        console.log('VirtualControls initialized, mobile:', this.isMobile);
    }
    
    detectMobile() {
        // Simple mobile detection
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               ('ontouchstart' in window) ||
               (window.innerWidth <= 768);
    }
    
    createControls() {
        this.createCarControls();
        this.createPlayerControls();
        this.createCommonControls();
        
        // Start with car controls visible
        this.updateMode('car');
        
        console.log('Virtual controls created');
    }
    
    createCarControls() {
        // Left movement button
        this.createButton('left', 20, window.innerHeight - 120, 80, 80, '◀', () => {
            this.activeInputs.add('left');
        }, () => {
            this.activeInputs.delete('left');
        });
        
        // Right movement button
        this.createButton('right', 120, window.innerHeight - 120, 80, 80, '▶', () => {
            this.activeInputs.add('right');
        }, () => {
            this.activeInputs.delete('right');
        });
        
        // Jump button
        this.createButton('jump', window.innerWidth - 120, window.innerHeight - 120, 80, 80, '↑', () => {
            this.activeInputs.add('jump');
        }, () => {
            this.activeInputs.delete('jump');
        });
    }
    
    createPlayerControls() {
        // Attack buttons for player mode
        this.createButton('punch', window.innerWidth - 220, window.innerHeight - 120, 70, 70, '👊', () => {
            this.activeInputs.add('punch');
        }, () => {
            this.activeInputs.delete('punch');
        });
        
        this.createButton('kick', window.innerWidth - 220, window.innerHeight - 200, 70, 70, '🦵', () => {
            this.activeInputs.add('kick');
        }, () => {
            this.activeInputs.delete('kick');
        });
        
        // Shoot area (for touch shooting)
        this.createShootArea();
    }
    
    createCommonControls() {
        // Exit/Enter car button
        this.createButton('exitEnter', window.innerWidth / 2 - 50, window.innerHeight - 120, 100, 50, 'E', () => {
            this.activeInputs.add('exitEnter');
        }, () => {
            this.activeInputs.delete('exitEnter');
        });
    }
    
    createButton(id, x, y, width, height, text, onDown, onUp) {
        const button = document.createElement('div');
        button.className = 'virtual-button';
        button.id = `vbtn-${id}`;
        button.style.cssText = `
            position: fixed;
            left: ${x}px;
            bottom: ${window.innerHeight - y - height}px;
            width: ${width}px;
            height: ${height}px;
            background: rgba(233, 69, 96, 0.6);
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: ${Math.min(width, height) / 4}px;
            font-weight: bold;
            user-select: none;
            touch-action: manipulation;
            z-index: 1000;
            pointer-events: all;
        `;
        button.textContent = text;
        
        // Touch events
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            button.classList.add('pressed');
            onDown();
        });
        
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            button.classList.remove('pressed');
            onUp();
        });
        
        button.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            button.classList.remove('pressed');
            onUp();
        });
        
        // Mouse events for testing on desktop
        button.addEventListener('mousedown', (e) => {
            e.preventDefault();
            button.classList.add('pressed');
            onDown();
        });
        
        button.addEventListener('mouseup', (e) => {
            e.preventDefault();
            button.classList.remove('pressed');
            onUp();
        });
        
        button.addEventListener('mouseleave', (e) => {
            button.classList.remove('pressed');
            onUp();
        });
        
        document.body.appendChild(button);
        this.controls.set(id, button);
        
        console.log(`Virtual button created: ${id}`);
    }
    
    createShootArea() {
        const shootArea = document.createElement('div');
        shootArea.id = 'shoot-area';
        shootArea.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 50vh;
            background: transparent;
            z-index: 500;
            pointer-events: all;
            display: none;
        `;
        
        // Handle shooting on touch
        shootArea.addEventListener('touchstart', (e) => {
            if (this.currentMode === 'foot') {
                e.preventDefault();
                const touch = e.touches[0];
                const rect = this.scene.game.canvas.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                
                // Convert to world coordinates
                const camera = this.scene.cameras.main;
                const worldX = camera.scrollX + (x / rect.width) * camera.width;
                const worldY = camera.scrollY + (y / rect.height) * camera.height;
                
                // Trigger shooting
                if (this.scene.player && this.scene.player.active) {
                    this.scene.player.shoot(worldX, worldY);
                }
            }
        });
        
        document.body.appendChild(shootArea);
        this.controls.set('shootArea', shootArea);
    }
    
    updateMode(mode) {
        this.currentMode = mode;
        
        // Show/hide controls based on mode
        const carControls = ['left', 'right', 'jump'];
        const playerControls = ['punch', 'kick', 'shootArea'];
        
        carControls.forEach(id => {
            const control = this.controls.get(id);
            if (control) {
                control.style.display = mode === 'car' ? 'flex' : 'none';
            }
        });
        
        playerControls.forEach(id => {
            const control = this.controls.get(id);
            if (control) {
                control.style.display = mode === 'foot' ? (id === 'shootArea' ? 'block' : 'flex') : 'none';
            }
        });
        
        // Update exit/enter button text
        const exitEnterBtn = this.controls.get('exitEnter');
        if (exitEnterBtn) {
            exitEnterBtn.textContent = mode === 'car' ? 'EXIT' : 'ENTER';
            exitEnterBtn.style.background = mode === 'car' ? 'rgba(233, 69, 96, 0.6)' : 'rgba(46, 125, 50, 0.6)';
        }
        
        console.log('Virtual controls mode updated to:', mode);
    }
    
    update() {
        if (!this.isMobile) return;
        
        // Handle window resize
        this.handleResize();
        
        // Process active inputs and convert to keyboard-like events
        this.processInputs();
    }
    
    processInputs() {
        // Simulate keyboard state for the game
        const keys = this.scene.keys;
        const wasd = this.scene.wasd;
        
        if (!keys || !wasd) return;
        
        // Left movement
        if (this.activeInputs.has('left')) {
            if (keys.left) keys.left.isDown = true;
            if (wasd.A) wasd.A.isDown = true;
        }
        
        // Right movement
        if (this.activeInputs.has('right')) {
            if (keys.right) keys.right.isDown = true;
            if (wasd.D) wasd.D.isDown = true;
        }
        
        // Jump
        if (this.activeInputs.has('jump')) {
            if (keys.up) keys.up.isDown = true;
            if (wasd.W) wasd.W.isDown = true;
        }
        
        // Exit/Enter car
        if (this.activeInputs.has('exitEnter')) {
            if (wasd.E) {
                wasd.E.isDown = true;
                // Prevent multiple triggers
                setTimeout(() => {
                    this.activeInputs.delete('exitEnter');
                }, 200);
            }
        }
        
        // Player attacks
        if (this.activeInputs.has('punch')) {
            if (wasd.J) {
                wasd.J.isDown = true;
                setTimeout(() => {
                    this.activeInputs.delete('punch');
                }, 200);
            }
        }
        
        if (this.activeInputs.has('kick')) {
            if (wasd.K) {
                wasd.K.isDown = true;
                setTimeout(() => {
                    this.activeInputs.delete('kick');
                }, 200);
            }
        }
    }
    
    handleResize() {
        // Update button positions on window resize
        const currentWidth = window.innerWidth;
        const currentHeight = window.innerHeight;
        
        // Reposition buttons
        const leftBtn = this.controls.get('left');
        if (leftBtn) {
            leftBtn.style.left = '20px';
            leftBtn.style.bottom = '20px';
        }
        
        const rightBtn = this.controls.get('right');
        if (rightBtn) {
            rightBtn.style.left = '120px';
            rightBtn.style.bottom = '20px';
        }
        
        const jumpBtn = this.controls.get('jump');
        if (jumpBtn) {
            jumpBtn.style.left = `${currentWidth - 120}px`;
            jumpBtn.style.bottom = '20px';
        }
        
        const punchBtn = this.controls.get('punch');
        if (punchBtn) {
            punchBtn.style.left = `${currentWidth - 220}px`;
            punchBtn.style.bottom = '20px';
        }
        
        const kickBtn = this.controls.get('kick');
        if (kickBtn) {
            kickBtn.style.left = `${currentWidth - 220}px`;
            kickBtn.style.bottom = '100px';
        }
        
        const exitEnterBtn = this.controls.get('exitEnter');
        if (exitEnterBtn) {
            exitEnterBtn.style.left = `${currentWidth / 2 - 50}px`;
            exitEnterBtn.style.bottom = '20px';
        }
    }
    
    // Enable/disable virtual controls
    setVisible(visible) {
        if (!this.isMobile) return;
        
        this.controls.forEach(control => {
            control.style.display = visible ? (control.id === 'shoot-area' ? 'block' : 'flex') : 'none';
        });
        
        console.log('Virtual controls', visible ? 'shown' : 'hidden');
    }
    
    // Add haptic feedback (if supported)
    vibrate(duration = 50) {
        if (navigator.vibrate) {
            navigator.vibrate(duration);
        }
    }
    
    // Check if a virtual control is active
    isActive(controlId) {
        return this.activeInputs.has(controlId);
    }
    
    // Get current input state
    getInputState() {
        return {
            left: this.activeInputs.has('left'),
            right: this.activeInputs.has('right'),
            jump: this.activeInputs.has('jump'),
            exitEnter: this.activeInputs.has('exitEnter'),
            punch: this.activeInputs.has('punch'),
            kick: this.activeInputs.has('kick'),
            mode: this.currentMode
        };
    }
    
    // Clean up virtual controls
    destroy() {
        this.controls.forEach(control => {
            if (control.parentNode) {
                control.parentNode.removeChild(control);
            }
        });
        
        this.controls.clear();
        this.activeInputs.clear();
        
        console.log('Virtual controls destroyed');
    }
}
