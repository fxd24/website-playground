import { PostHog } from 'posthog-node';
import { FEATURE_FLAGS, FEATURE_FLAG_CONFIG, FeatureFlagKey } from './feature-flags';

// Initialize PostHog server-side client
const posthog = new PostHog(
  process.env.NEXT_PUBLIC_POSTHOG_KEY!,
  {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.posthog.com',
  }
);

interface User {
  id: string;
  role: string;
  email: string;
}

export class FeatureFlagService {
  /**
   * Check if a feature flag is enabled for a user
   */
  static async isFeatureEnabled(
    flagKey: FeatureFlagKey,
    user?: User
  ): Promise<boolean> {
    try {
      if (!posthog) {
        console.warn('PostHog not initialized, using default value');
        return FEATURE_FLAG_CONFIG[flagKey]?.defaultValue ?? false;
      }

      const flagValue = await posthog.isFeatureEnabled(flagKey, {
        person_properties: user ? {
          user_id: user.id,
          role: user.role,
          email: user.email,
        } : undefined,
      });

      return flagValue;
    } catch (error) {
      console.error('Error checking feature flag:', error);
      return FEATURE_FLAG_CONFIG[flagKey]?.defaultValue ?? false;
    }
  }

  /**
   * Get all feature flags for a user
   */
  static async getAllFeatureFlags(user?: User): Promise<Record<FeatureFlagKey, boolean>> {
    try {
      if (!posthog) {
        console.warn('PostHog not initialized, using default values');
        return Object.fromEntries(
          Object.entries(FEATURE_FLAG_CONFIG).map(([key, config]) => [key, config.defaultValue])
        ) as Record<FeatureFlagKey, boolean>;
      }

      const flagResults = await Promise.all(
        Object.values(FEATURE_FLAGS).map(async (flagKey) => {
          const isEnabled = await posthog.isFeatureEnabled(flagKey, {
            person_properties: user ? {
              user_id: user.id,
              role: user.role,
              email: user.email,
            } : undefined,
          });
          return [flagKey, isEnabled] as [FeatureFlagKey, boolean];
        })
      );

      return Object.fromEntries(flagResults) as Record<FeatureFlagKey, boolean>;
    } catch (error) {
      console.error('Error checking feature flags:', error);
      return Object.fromEntries(
        Object.entries(FEATURE_FLAG_CONFIG).map(([key, config]) => [key, config.defaultValue])
      ) as Record<FeatureFlagKey, boolean>;
    }
  }

  /**
   * Create or update a feature flag (requires PostHog API key with write permissions)
   */
  static async createOrUpdateFlag(
    flagKey: string,
    data: {
      name: string;
      description?: string;
      filters?: any;
      active?: boolean;
    }
  ): Promise<void> {
    try {
      if (!posthog) {
        throw new Error('PostHog not initialized');
      }

      // This would require PostHog API with write permissions
      // For now, we'll just log the request
      console.log('Feature flag update requested:', { flagKey, data });
      
      // In a real implementation, you would call PostHog's API
      // await posthog.createFeatureFlag({
      //   key: flagKey,
      //   name: data.name,
      //   description: data.description,
      //   filters: data.filters,
      //   active: data.active,
      // });
    } catch (error) {
      console.error('Error creating/updating feature flag:', error);
      throw error;
    }
  }

  /**
   * Delete a feature flag (requires PostHog API key with write permissions)
   */
  static async deleteFlag(flagKey: string): Promise<void> {
    try {
      if (!posthog) {
        throw new Error('PostHog not initialized');
      }

      console.log('Feature flag deletion requested:', flagKey);
      
      // In a real implementation, you would call PostHog's API
      // await posthog.deleteFeatureFlag(flagKey);
    } catch (error) {
      console.error('Error deleting feature flag:', error);
      throw error;
    }
  }

  /**
   * Get feature flag configuration
   */
  static getFlagConfig(flagKey: FeatureFlagKey) {
    return FEATURE_FLAG_CONFIG[flagKey];
  }

  /**
   * Get all feature flag configurations
   */
  static getAllFlagConfigs() {
    return FEATURE_FLAG_CONFIG;
  }
}
