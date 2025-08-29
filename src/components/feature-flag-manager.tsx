"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/lib/context";
import { FEATURE_FLAGS, FEATURE_FLAG_CONFIG } from "@/lib/feature-flags";
import { Settings, RefreshCw, Eye, EyeOff } from "lucide-react";

export function FeatureFlagManager() {
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
    setLocalFlags(prev => ({
      ...prev,
      [flagKey]: !prev[flagKey]
    }));
  };

  const handleSaveChanges = async () => {
    setIsUpdating(true);
    try {
      // In a real implementation, you would call PostHog API to update flags
      // For now, we'll just simulate the update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh the page to see changes
      window.location.reload();
    } catch (error) {
      console.error('Error updating feature flags:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = () => {
    setLocalFlags(featureFlags);
  };

  const hasChanges = Object.keys(localFlags).some(
    key => localFlags[key] !== featureFlags[key]
  );

  if (isFeatureFlagsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Feature Flags
          </CardTitle>
          <CardDescription>
            Loading feature flags...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(FEATURE_FLAG_CONFIG).map(([key, config]) => (
              <div key={key} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="h-6 w-11 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Feature Flags
        </CardTitle>
        <CardDescription>
          Manage feature flags for {currentUser.name} ({currentUser.role})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(FEATURE_FLAG_CONFIG).map(([flagKey, config]) => {
            const isEnabled = localFlags[flagKey] ?? false;
            const hasChanged = localFlags[flagKey] !== featureFlags[flagKey];
            
            return (
              <div key={flagKey} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={flagKey} className="text-base font-medium">
                        {config.name}
                      </Label>
                      {hasChanged && (
                        <Badge variant="secondary" className="text-xs">
                          Modified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {config.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Flag key: {flagKey}</span>
                      <span>•</span>
                      <span>Default: {config.defaultValue ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
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
                <Separator />
              </div>
            );
          })}
          
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              {hasChanges ? (
                <span className="text-orange-600">
                  You have unsaved changes
                </span>
              ) : (
                <span>All changes saved</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={!hasChanges}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleSaveChanges}
                disabled={!hasChanges || isUpdating}
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
