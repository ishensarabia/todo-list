class LocalStorageManager {
    constructor(key) {
        this.key = key;
    }

    save(data) {
        try {
            const jsonData = JSON.stringify(data);
            localStorage.setItem(this.key, jsonData);
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    load() {
        try {
            const jsonData = localStorage.getItem(this.key);
            return jsonData ? JSON.parse(jsonData) : null;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return null;
        }
    }

    remove() {
        try {
            localStorage.removeItem(this.key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    }
}

export default LocalStorageManager;