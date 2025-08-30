// Simplified Phaser 3 Game for Testing
class SimpleTestScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TestScene' });
    }
    
    create() {
        console.log('Simple test scene loaded successfully!');
        
        // Add simple text to verify scene is working
        this.add.text(400, 300, 'ZOMBIE DRIVE & DUEL', {
            fontSize: '32px',
            color: '#e94560',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        this.add.text(400, 350, 'Game Loading Test - Click to continue', {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Add click handler to test interaction
        this.input.on('pointerdown', () => {
            console.log('Click detected - basic interaction working');
            this.add.text(400, 400, 'Interaction Working!', {
                fontSize: '16px',
                color: '#00ff00',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
        });
    }
}

// Simple game configuration
const testConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    scene: [SimpleTestScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    }
};

// Initialize simple test game
window.addEventListener('load', () => {
    console.log('Starting simplified game test...');
    const testGame = new Phaser.Game(testConfig);
    
    // Hide loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
});