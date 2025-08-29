import { useCallback, useEffect, useState, useRef } from 'react';
import posthog from 'posthog-js';
import { FEATURE_FLAGS, FEATURE_FLAG_CONFIG, FeatureFlagKey } from '@/lib/feature-flags';

interface UseFeatureFlagOptions {
  defaultValue?: boolean;
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

export function useFeatureFlag(
  flagKey: FeatureFlagKey,
  options: UseFeatureFlagOptions = {}
) {
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    // Use provided default or fallback to config default
    return options.defaultValue ?? FEATURE_FLAG_CONFIG[flagKey]?.defaultValue ?? false;
  });
  const [isLoading, setIsLoading] = useState(true);

  const checkFlag = useCallback(async () => {
    try {
      // Check if PostHog is initialized
      if (!posthog.isFeatureEnabled) {
        console.warn('PostHog not initialized, using default value');
        setIsEnabled(options.defaultValue ?? FEATURE_FLAG_CONFIG[flagKey]?.defaultValue ?? false);
        return;
      }

      // Check feature flag with user context if provided
      const flagValue = posthog.isFeatureEnabled(flagKey, {
        person_properties: options.user ? {
          user_id: options.user.id,
          role: options.user.role,
          email: options.user.email,
        } : undefined,
      });

      setIsEnabled(flagValue);
    } catch (error) {
      console.error('Error checking feature flag:', error);
      // Fallback to default value on error
      setIsEnabled(options.defaultValue ?? FEATURE_FLAG_CONFIG[flagKey]?.defaultValue ?? false);
    } finally {
      setIsLoading(false);
    }
  }, [flagKey, options.defaultValue, options.user?.id, options.user?.role, options.user?.email]);

  useEffect(() => {
    checkFlag();
  }, [checkFlag]);

  // Listen for PostHog flag changes
  useEffect(() => {
    const handleFlagChange = (flag: string, value: boolean) => {
      if (flag === flagKey) {
        setIsEnabled(value);
      }
    };

    // PostHog doesn't have a direct event listener for flag changes
    // We'll rely on the initial check and manual refresh
    return () => {
      // Cleanup if needed
    };
  }, [flagKey]);

  const refresh = useCallback(() => {
    checkFlag();
  }, [checkFlag]);

  return {
    isEnabled,
    isLoading,
    refresh,
  };
}

// Convenience hook for purchase orders specifically
export function usePurchaseOrdersEnabled(user?: { id: string; role: string; email: string }) {
  return useFeatureFlag(FEATURE_FLAGS.PURCHASE_ORDERS_ENABLED, { user });
}

// Hook to get all feature flags at once
export function useFeatureFlags(user?: { id: string; role: string; email: string }) {
  const [flags, setFlags] = useState<Record<FeatureFlagKey, boolean>>(() => {
    // Initialize with default values immediately
    return Object.fromEntries(
      Object.entries(FEATURE_FLAG_CONFIG).map(([key, config]) => [key, config.defaultValue])
    ) as Record<FeatureFlagKey, boolean>;
  });
  const [isLoading, setIsLoading] = useState(true);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple checks
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    let isMounted = true;

    const checkAllFlags = async () => {
      try {
        if (!posthog.isFeatureEnabled) {
          console.warn('PostHog not initialized, using default values');
          if (isMounted) {
            setIsLoading(false);
          }
          return;
        }

        const flagResults = await Promise.all(
          Object.values(FEATURE_FLAGS).map(async (flagKey) => {
            const isEnabled = posthog.isFeatureEnabled(flagKey, {
              person_properties: user ? {
                user_id: user.id,
                role: user.role,
                email: user.email,
              } : undefined,
            });
            return [flagKey, isEnabled] as [FeatureFlagKey, boolean];
          })
        );

        if (isMounted) {
          const flagsObject = Object.fromEntries(flagResults) as Record<FeatureFlagKey, boolean>;
          setFlags(flagsObject);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking feature flags:', error);
        // Keep default values on error
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkAllFlags();

    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.role, user?.email]);

  return { flags, isLoading };
}
