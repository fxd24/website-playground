"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/context";
import { FEATURE_FLAGS, FEATURE_FLAG_CONFIG } from "@/lib/feature-flags";
import { featureFlagStore } from "@/lib/feature-flag-store";
import { Settings, Eye, EyeOff } from "lucide-react";

export function QuickFeatureToggle() {
  const { featureFlags, isFeatureFlagsLoading, currentUser } = useApp();
  const [localFlags, setLocalFlags] = useState<Record<string, boolean>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  // Initialize local flags when feature flags load
  useEffect(() => {
    if (!isFeatureFlagsLoading && Object.keys(featureFlags).length > 0) {
      setLocalFlags(featureFlags);
    }
  }, [featureFlags, isFeatureFlagsLoading]);

  const handleFlagToggle = (flagKey: string) => {
    const newValue = !localFlags[flagKey];
    setLocalFlags(prev => ({
      ...prev,
      [flagKey]: newValue
    }));
    
    // Immediately save to store
    featureFlagStore.setFlag(flagKey as any, newValue);
  };

  const handleSaveChanges = async () => {
    setIsUpdating(true);
    try {
      // Save all local changes to the store
      Object.entries(localFlags).forEach(([key, value]) => {
        if (value !== featureFlags[key]) {
          featureFlagStore.setFlag(key as any, value);
        }
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error updating feature flags:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const hasChanges = Object.keys(localFlags).some(
    key => localFlags[key] !== featureFlags[key]
  );

  if (isFeatureFlagsLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Feature Toggles
          </CardTitle>
          <CardDescription>
            Loading...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Feature Toggles
        </CardTitle>
        <CardDescription>
          Quick access to feature flags
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(FEATURE_FLAG_CONFIG).map(([flagKey, config]) => {
          const isEnabled = localFlags[flagKey] ?? featureFlags[flagKey] ?? false;
          const hasChanged = localFlags[flagKey] !== featureFlags[flagKey];
          
          return (
            <div key={flagKey} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor={flagKey} className="text-sm font-medium">
                    {config.name}
                  </Label>
                  {hasChanged && (
                    <Badge variant="secondary" className="text-xs">
                      Modified
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {config.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isEnabled ? (
                  <Eye className="h-4 w-4 text-green-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                )}
                <Switch
                  id={flagKey}
                  checked={isEnabled}
                  onCheckedChange={() => handleFlagToggle(flagKey)}
                />
              </div>
            </div>
          );
        })}
        
        {hasChanges && (
          <Button 
            onClick={handleSaveChanges} 
            disabled={isUpdating}
            className="w-full"
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
