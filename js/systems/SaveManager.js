class SaveManager {
    constructor() {
        this.version = '1.0.0';
        this.saveKey = 'zombieDriveGameSave';
        this.defaultData = {
            version: this.version,
            coins: 0,
            highScore: 0,
            upgrades: {},
            settings: {
                audio: true,
                volume: 0.7,
                difficulty: 'normal'
            },
            statistics: {
                totalPlayTime: 0,
                enemiesKilled: 0,
                coinsCollected: 0,
                gamesPlayed: 0,
                carsCrashed: 0,
                distanceTraveled: 0
            },
            achievements: {},
            lastPlayed: Date.now()
        };
        
        console.log('SaveManager initialized');
    }
    
    save(data) {
        try {
            const saveData = {
                ...this.defaultData,
                ...data,
                version: this.version,
                lastPlayed: Date.now(),
                checksum: this.generateChecksum(data)
            };
            
            const serialized = JSON.stringify(saveData);
            localStorage.setItem(this.saveKey, serialized);
            
            console.log('Game data saved successfully');
            return true;
        } catch (error) {
            console.error('Failed to save game data:', error);
            return false;
        }
    }
    
    load() {
        try {
            const saved = localStorage.getItem(this.saveKey);
            if (!saved) {
                console.log('No save data found, using defaults');
                return this.defaultData;
            }
            
            const data = JSON.parse(saved);
            
            // Verify checksum
            if (!this.verifyChecksum(data)) {
                console.warn('Save data checksum verification failed, using defaults');
                return this.defaultData;
            }
            
            // Handle version migration
            const migratedData = this.migrateData(data);
            
            console.log('Game data loaded successfully');
            return migratedData;
        } catch (error) {
            console.error('Failed to load game data:', error);
            return this.defaultData;
        }
    }
    
    generateChecksum(data) {
        // Simple checksum generation
        const str = JSON.stringify({
            coins: data.coins || 0,
            highScore: data.highScore || 0,
            upgrades: data.upgrades || {}
        });
        
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return hash.toString();
    }
    
    verifyChecksum(data) {
        if (!data.checksum) return false;
        
        const expectedChecksum = this.generateChecksum(data);
        return data.checksum === expectedChecksum;
    }
    
    migrateData(data) {
        const currentVersion = this.version;
        const dataVersion = data.version || '0.0.0';
        
        if (dataVersion === currentVersion) {
            return { ...this.defaultData, ...data };
        }
        
        console.log(`Migrating save data from ${dataVersion} to ${currentVersion}`);
        
        // Perform migration based on version differences
        let migratedData = { ...data };
        
        // Example migrations:
        if (this.compareVersions(dataVersion, '1.0.0') < 0) {
            // Migration from pre-1.0.0
            migratedData = this.migrateToV1_0_0(migratedData);
        }
        
        // Ensure all default fields exist
        migratedData = { ...this.defaultData, ...migratedData };
        migratedData.version = currentVersion;
        
        // Save migrated data
        this.save(migratedData);
        
        return migratedData;
    }
    
    migrateToV1_0_0(data) {
        // Example migration logic
        if (!data.statistics) {
            data.statistics = this.defaultData.statistics;
        }
        
        if (!data.achievements) {
            data.achievements = {};
        }
        
        return data;
    }
    
    compareVersions(v1, v2) {
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);
        
        for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
            const part1 = parts1[i] || 0;
            const part2 = parts2[i] || 0;
            
            if (part1 > part2) return 1;
            if (part1 < part2) return -1;
        }
        
        return 0;
    }
    
    updateStatistics(stats) {
        const currentData = this.load();
        
        // Update statistics
        Object.keys(stats).forEach(key => {
            if (currentData.statistics.hasOwnProperty(key)) {
                currentData.statistics[key] += stats[key];
            }
        });
        
        this.save(currentData);
        console.log('Statistics updated:', stats);
    }
    
    unlockAchievement(achievementId) {
        const currentData = this.load();
        
        if (!currentData.achievements[achievementId]) {
            currentData.achievements[achievementId] = {
                unlockedAt: Date.now(),
                id: achievementId
            };
            
            this.save(currentData);
            console.log('Achievement unlocked:', achievementId);
            return true;
        }
        
        return false;
    }
    
    isAchievementUnlocked(achievementId) {
        const currentData = this.load();
        return !!currentData.achievements[achievementId];
    }
    
    getStatistics() {
        const currentData = this.load();
        return currentData.statistics;
    }
    
    getAchievements() {
        const currentData = this.load();
        return currentData.achievements;
    }
    
    exportSave() {
        try {
            const data = this.load();
            const exportData = {
                ...data,
                exportedAt: Date.now(),
                exportVersion: this.version
            };
            
            const encoded = btoa(JSON.stringify(exportData));
            console.log('Save data exported');
            return encoded;
        } catch (error) {
            console.error('Failed to export save data:', error);
            return null;
        }
    }
    
    importSave(encodedData) {
        try {
            const decoded = atob(encodedData);
            const importData = JSON.parse(decoded);
            
            // Verify the imported data
            if (!this.verifyChecksum(importData)) {
                console.error('Invalid import data: checksum verification failed');
                return false;
            }
            
            // Migrate if necessary
            const migratedData = this.migrateData(importData);
            
            // Save imported data
            const success = this.save(migratedData);
            
            if (success) {
                console.log('Save data imported successfully');
            }
            
            return success;
        } catch (error) {
            console.error('Failed to import save data:', error);
            return false;
        }
    }
    
    clearSave() {
        try {
            localStorage.removeItem(this.saveKey);
            console.log('Save data cleared');
            return true;
        } catch (error) {
            console.error('Failed to clear save data:', error);
            return false;
        }
    }
    
    getSaveInfo() {
        const data = this.load();
        return {
            version: data.version,
            lastPlayed: new Date(data.lastPlayed),
            coins: data.coins,
            highScore: data.highScore,
            totalPlayTime: data.statistics.totalPlayTime,
            gamesPlayed: data.statistics.gamesPlayed
        };
    }
    
    // Auto-save functionality
    enableAutoSave(interval = 30000) { // Default: 30 seconds
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        this.autoSaveInterval = setInterval(() => {
            if (this.pendingData) {
                this.save(this.pendingData);
                this.pendingData = null;
            }
        }, interval);
        
        console.log('Auto-save enabled with interval:', interval, 'ms');
    }
    
    disableAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
            console.log('Auto-save disabled');
        }
    }
    
    queueSave(data) {
        this.pendingData = { ...this.load(), ...data };
    }
    
    destroy() {
        this.disableAutoSave();
        console.log('SaveManager destroyed');
    }
}
