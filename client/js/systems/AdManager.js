class AdManager {
    constructor() {
        this.isInitialized = false;
        this.isWebVersion = true; // Will be false in Unity/mobile builds
        this.adConfig = {
            interstitialFrequency: 3, // Show interstitial every N game overs
            rewardedAdReward: 50, // Coins for watching rewarded ad
            bannerEnabled: false, // Not recommended for web version
            testMode: true // Set to false in production
        };
        
        this.adState = {
            gamesPlayedSinceAd: 0,
            totalAdsShown: 0,
            rewardedAdsWatched: 0,
            lastAdTime: 0
        };
        
        this.callbacks = {
            onInterstitialClosed: null,
            onRewardedAdCompleted: null,
            onAdFailed: null
        };
        
        console.log('AdManager initialized (Web Version - Stub)');
    }
    
    initialize() {
        if (this.isInitialized) return;
        
        if (this.isWebVersion) {
            // Web version - no real ads
            console.log('AdManager: Web version detected, ad functionality stubbed');
            this.isInitialized = true;
            return;
        }
        
        // This would be replaced with real ad SDK initialization in Unity
        // Example: GoogleMobileAds.Initialize(status => { ... });
        
        this.isInitialized = true;
        console.log('AdManager initialized');
    }
    
    // Check if ads are available
    isAdAvailable(adType) {
        if (!this.isInitialized) return false;
        
        if (this.isWebVersion) {
            // In web version, simulate ad availability
            return Math.random() > 0.1; // 90% availability
        }
        
        // In Unity/mobile, this would check actual ad availability
        // Example: return this.interstitialAd.IsLoaded();
        return true;
    }
    
    // Show interstitial ad (game over, level complete)
    showInterstitial(onClosed = null) {
        if (!this.shouldShowInterstitial()) {
            if (onClosed) onClosed(false);
            return;
        }
        
        console.log('AdManager: Showing interstitial ad');
        
        if (this.isWebVersion) {
            // Web version - simulate ad
            this.simulateInterstitialAd(onClosed);
            return;
        }
        
        // Unity/mobile implementation would be:
        // this.interstitialAd.Show();
        this.callbacks.onInterstitialClosed = onClosed;
    }
    
    // Show rewarded ad (double coins, extra fuel, revive)
    showRewarded(onCompleted = null) {
        if (!this.isAdAvailable('rewarded')) {
            console.log('AdManager: Rewarded ad not available');
            if (onCompleted) onCompleted(false, 0);
            return;
        }
        
        console.log('AdManager: Showing rewarded ad');
        
        if (this.isWebVersion) {
            // Web version - simulate rewarded ad
            this.simulateRewardedAd(onCompleted);
            return;
        }
        
        // Unity/mobile implementation would be:
        // this.rewardedAd.Show();
        this.callbacks.onRewardedAdCompleted = onCompleted;
    }
    
    // Show banner ad (persistent, usually bottom of screen)
    showBanner() {
        if (!this.adConfig.bannerEnabled) {
            console.log('AdManager: Banner ads disabled');
            return;
        }
        
        if (this.isWebVersion) {
            console.log('AdManager: Banner ads not recommended for web version');
            return;
        }
        
        // Unity/mobile implementation would be:
        // this.bannerAd.Show();
        console.log('AdManager: Showing banner ad');
    }
    
    // Hide banner ad
    hideBanner() {
        if (this.isWebVersion) return;
        
        // Unity/mobile implementation would be:
        // this.bannerAd.Hide();
        console.log('AdManager: Hiding banner ad');
    }
    
    // Check if interstitial should be shown based on frequency
    shouldShowInterstitial() {
        this.adState.gamesPlayedSinceAd++;
        
        const shouldShow = this.adState.gamesPlayedSinceAd >= this.adConfig.interstitialFrequency;
        
        if (shouldShow) {
            this.adState.gamesPlayedSinceAd = 0;
        }
        
        // Don't show ads too frequently (minimum 2 minutes between)
        const timeSinceLastAd = Date.now() - this.adState.lastAdTime;
        if (timeSinceLastAd < 120000) { // 2 minutes
            return false;
        }
        
        return shouldShow;
    }
    
    // Simulate interstitial ad for web version
    simulateInterstitialAd(onClosed) {
        // Create fake ad overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(45deg, #2c3e50, #34495e);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            font-family: Arial, sans-serif;
        `;
        
        overlay.innerHTML = `
            <h2>Advertisement</h2>
            <p>This is a simulated ad for the web version</p>
            <div style="margin: 20px 0;">
                <div style="width: 300px; height: 200px; background: #34495e; border: 2px solid #3498db; display: flex; align-items: center; justify-content: center;">
                    Fake Ad Content
                </div>
            </div>
            <button id="close-ad" style="padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Close Ad (5s)
            </button>
        `;
        
        document.body.appendChild(overlay);
        
        // Simulate ad duration
        let countdown = 5;
        const button = overlay.querySelector('#close-ad');
        
        const countdownInterval = setInterval(() => {
            countdown--;
            button.textContent = `Close Ad (${countdown}s)`;
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                button.textContent = 'Close Ad';
                button.onclick = () => {
                    document.body.removeChild(overlay);
                    this.adState.totalAdsShown++;
                    this.adState.lastAdTime = Date.now();
                    if (onClosed) onClosed(true);
                };
            }
        }, 1000);
        
        console.log('AdManager: Simulated interstitial ad shown');
    }
    
    // Simulate rewarded ad for web version
    simulateRewardedAd(onCompleted) {
        // Create fake rewarded ad overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(45deg, #27ae60, #2ecc71);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            font-family: Arial, sans-serif;
        `;
        
        overlay.innerHTML = `
            <h2>Rewarded Advertisement</h2>
            <p>Watch this ad to earn ${this.adConfig.rewardedAdReward} coins!</p>
            <div style="margin: 20px 0;">
                <div style="width: 300px; height: 200px; background: #229954; border: 2px solid #58d68d; display: flex; align-items: center; justify-content: center;">
                    Rewarded Ad Content
                </div>
            </div>
            <div>
                <button id="close-rewarded" style="padding: 10px 20px; background: #7f8c8d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                    Close (No Reward)
                </button>
                <button id="complete-rewarded" style="padding: 10px 20px; background: #f39c12; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Complete Ad (10s)
                </button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Simulate ad duration for reward
        let countdown = 10;
        const completeButton = overlay.querySelector('#complete-rewarded');
        const closeButton = overlay.querySelector('#close-rewarded');
        
        const countdownInterval = setInterval(() => {
            countdown--;
            completeButton.textContent = `Complete Ad (${countdown}s)`;
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                completeButton.textContent = 'Claim Reward!';
                completeButton.style.background = '#e74c3c';
                completeButton.onclick = () => {
                    document.body.removeChild(overlay);
                    this.adState.rewardedAdsWatched++;
                    this.adState.lastAdTime = Date.now();
                    if (onCompleted) onCompleted(true, this.adConfig.rewardedAdReward);
                };
            }
        }, 1000);
        
        closeButton.onclick = () => {
            clearInterval(countdownInterval);
            document.body.removeChild(overlay);
            if (onCompleted) onCompleted(false, 0);
        };
        
        console.log('AdManager: Simulated rewarded ad shown');
    }
    
    // Get ad statistics
    getAdStats() {
        return {
            totalAdsShown: this.adState.totalAdsShown,
            rewardedAdsWatched: this.adState.rewardedAdsWatched,
            gamesPlayedSinceAd: this.adState.gamesPlayedSinceAd
        };
    }
    
    // Set ad frequency
    setInterstitialFrequency(frequency) {
        this.adConfig.interstitialFrequency = Math.max(1, frequency);
        console.log('AdManager: Interstitial frequency set to', frequency);
    }
    
    // Enable/disable banner ads
    setBannerEnabled(enabled) {
        this.adConfig.bannerEnabled = enabled;
        if (!enabled) {
            this.hideBanner();
        }
        console.log('AdManager: Banner ads', enabled ? 'enabled' : 'disabled');
    }
    
    // For Unity/mobile integration - these would be called by the ad SDK
    onInterstitialAdClosed(success) {
        if (this.callbacks.onInterstitialClosed) {
            this.callbacks.onInterstitialClosed(success);
            this.callbacks.onInterstitialClosed = null;
        }
    }
    
    onRewardedAdCompleted(success, reward) {
        if (this.callbacks.onRewardedAdCompleted) {
            this.callbacks.onRewardedAdCompleted(success, reward);
            this.callbacks.onRewardedAdCompleted = null;
        }
    }
    
    onAdFailed(adType, error) {
        console.error(`AdManager: ${adType} ad failed:`, error);
        if (this.callbacks.onAdFailed) {
            this.callbacks.onAdFailed(adType, error);
        }
    }
    
    // Clean up
    destroy() {
        this.hideBanner();
        this.callbacks = {};
        console.log('AdManager destroyed');
    }
}
