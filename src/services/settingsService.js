/**
 * Settings Service
 * Manages user preferences in localStorage/sessionStorage
 */

class SettingsService {
  constructor() {
    this.STORAGE_KEYS = {
      MOOD: "meshaMood",
      REMEMBER_MOOD: "meshaRememberMood",
    };
  }

  /**
   * Check if storage is available
   */
  isStorageAvailable(type = "localStorage") {
    try {
      const storage = window[type];
      const testKey = "__storage_test__";
      storage.setItem(testKey, testKey);
      storage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get stored mood preference
   * @returns {string|null} mood id or null
   */
  getMood() {
    if (!this.isStorageAvailable()) {
      return null;
    }

    try {
      // Check if user has opted in to remember
      const shouldRemember = localStorage.getItem(
        this.STORAGE_KEYS.REMEMBER_MOOD,
      );

      if (shouldRemember === "true") {
        return localStorage.getItem(this.STORAGE_KEYS.MOOD);
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Save mood preference
   * @param {string} moodId - The mood to save
   * @param {boolean} remember - Whether to persist across sessions
   */
  saveMood(moodId, remember = false) {
    if (!this.isStorageAvailable()) {
      return;
    }

    try {
      if (remember) {
        localStorage.setItem(this.STORAGE_KEYS.MOOD, moodId);
        localStorage.setItem(this.STORAGE_KEYS.REMEMBER_MOOD, "true");
      } else {
        // Clear any previously saved preference
        this.clearMood();
      }
    } catch (error) {
      console.error("Failed to save mood preference:", error);
    }
  }

  /**
   * Clear stored mood preference
   */
  clearMood() {
    if (!this.isStorageAvailable()) {
      return;
    }

    try {
      localStorage.removeItem(this.STORAGE_KEYS.MOOD);
      localStorage.removeItem(this.STORAGE_KEYS.REMEMBER_MOOD);
    } catch (error) {
      console.error("Failed to clear mood preference:", error);
    }
  }

  /**
   * Check if user has opted in to remember their choice
   */
  shouldRememberMood() {
    if (!this.isStorageAvailable()) {
      return false;
    }

    try {
      return localStorage.getItem(this.STORAGE_KEYS.REMEMBER_MOOD) === "true";
    } catch {
      return false;
    }
  }
}

// Export singleton instance
const settingsService = new SettingsService();
export default settingsService;
