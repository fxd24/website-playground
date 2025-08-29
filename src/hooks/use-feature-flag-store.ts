import { useState, useEffect } from 'react';
import { featureFlagStore } from '@/lib/feature-flag-store';
import { FeatureFlagKey } from '@/lib/feature-flags';

export function useFeatureFlagStore() {
  const [flags, setFlags] = useState(() => featureFlagStore.getFlags());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const unsubscribe = featureFlagStore.subscribe((newFlags) => {
      setFlags(newFlags);
    });
    return unsubscribe;
  }, [isClient]);

  return {
    flags,
    setFlag: (key: FeatureFlagKey, value: boolean) => featureFlagStore.setFlag(key, value),
    setFlags: (flags: Partial<Record<FeatureFlagKey, boolean>>) => featureFlagStore.setFlags(flags),
    resetToDefaults: () => featureFlagStore.resetToDefaults(),
  };
}

export function useFeatureFlag(key: FeatureFlagKey) {
  const [value, setValue] = useState(() => featureFlagStore.getFlag(key));
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const unsubscribe = featureFlagStore.subscribe((flags) => {
      setValue(flags[key]);
    });
    return unsubscribe;
  }, [key, isClient]);

  return {
    value,
    setValue: (newValue: boolean) => featureFlagStore.setFlag(key, newValue),
  };
}
