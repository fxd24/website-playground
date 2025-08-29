import { FEATURE_FLAGS, FEATURE_FLAG_CONFIG, FeatureFlagKey } from './feature-flags';

// Simple in-memory store for feature flags
// In a real app, this would be persisted to localStorage or a database
class FeatureFlagStore {
  private flags: Record<FeatureFlagKey, boolean>;
  private listeners: Set<(flags: Record<FeatureFlagKey, boolean>) => void> = new Set();

  constructor() {
    // Initialize with default values
    this.flags = Object.fromEntries(
      Object.entries(FEATURE_FLAG_CONFIG).map(([key, config]) => [key, config.defaultValue])
    ) as Record<FeatureFlagKey, boolean>;

    // Only load from localStorage on the client side
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  private loadFromStorage() {
    try {
      if (typeof window === 'undefined') return;
      
      const stored = localStorage.getItem('feature-flags');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.flags = { ...this.flags, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load feature flags from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      if (typeof window === 'undefined') return;
      
      localStorage.setItem('feature-flags', JSON.stringify(this.flags));
    } catch (error) {
      console.warn('Failed to save feature flags to storage:', error);
    }
  }

  getFlags(): Record<FeatureFlagKey, boolean> {
    return { ...this.flags };
  }

  getFlag(key: FeatureFlagKey): boolean {
    return this.flags[key] ?? FEATURE_FLAG_CONFIG[key]?.defaultValue ?? false;
  }

  setFlag(key: FeatureFlagKey, value: boolean) {
    this.flags[key] = value;
    this.saveToStorage();
    this.notifyListeners();
  }

  setFlags(flags: Partial<Record<FeatureFlagKey, boolean>>) {
    this.flags = { ...this.flags, ...flags };
    this.saveToStorage();
    this.notifyListeners();
  }

  resetToDefaults() {
    this.flags = Object.fromEntries(
      Object.entries(FEATURE_FLAG_CONFIG).map(([key, config]) => [key, config.defaultValue])
    ) as Record<FeatureFlagKey, boolean>;
    this.saveToStorage();
    this.notifyListeners();
  }

  subscribe(listener: (flags: Record<FeatureFlagKey, boolean>) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getFlags()));
  }
}

// Create a singleton instance
export const featureFlagStore = new FeatureFlagStore();
