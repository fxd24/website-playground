"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useFeatureFlag } from "@/hooks/use-feature-flag-store";
import { FEATURE_FLAGS, FEATURE_FLAG_CONFIG } from "@/lib/feature-flags";
import { Settings, Eye, EyeOff, Save, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarFeatureTogglesProps {
  isExpanded: boolean;
}

export function SidebarFeatureToggles({ isExpanded }: SidebarFeatureTogglesProps) {
  const [localFlags, setLocalFlags] = useState<Record<string, boolean>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [showToggles, setShowToggles] = useState(false);

  // Get all feature flags
  const purchaseOrdersEnabled = useFeatureFlag(FEATURE_FLAGS.PURCHASE_ORDERS_ENABLED);
  const aiQuoteDrafting = useFeatureFlag(FEATURE_FLAGS.AI_QUOTE_DRAFTING);
  const offlineCapture = useFeatureFlag(FEATURE_FLAGS.OFFLINE_CAPTURE);
  const advancedScheduling = useFeatureFlag(FEATURE_FLAGS.ADVANCED_SCHEDULING);
  const supplierIntegration = useFeatureFlag(FEATURE_FLAGS.SUPPLIER_INTEGRATION);

  const allFlags = {
    [FEATURE_FLAGS.PURCHASE_ORDERS_ENABLED]: purchaseOrdersEnabled,
    [FEATURE_FLAGS.AI_QUOTE_DRAFTING]: aiQuoteDrafting,
    [FEATURE_FLAGS.OFFLINE_CAPTURE]: offlineCapture,
    [FEATURE_FLAGS.ADVANCED_SCHEDULING]: advancedScheduling,
    [FEATURE_FLAGS.SUPPLIER_INTEGRATION]: supplierIntegration,
  };

  // Initialize local flags when feature flags load
  useEffect(() => {
    const flags = Object.fromEntries(
      Object.entries(allFlags).map(([key, hook]) => [key, hook.value])
    );
    setLocalFlags(flags);
  }, [purchaseOrdersEnabled.value, aiQuoteDrafting.value, offlineCapture.value, advancedScheduling.value, supplierIntegration.value]);

  const handleFlagToggle = (flagKey: string) => {
    const newValue = !localFlags[flagKey];
    setLocalFlags(prev => ({
      ...prev,
      [flagKey]: newValue
    }));
    
    // Update the flag
    const flagHook = allFlags[flagKey as keyof typeof allFlags];
    if (flagHook) {
      flagHook.setValue(newValue);
    }
  };

  const handleSaveChanges = async () => {
    setIsUpdating(true);
    try {
      // Save all local changes
      Object.entries(localFlags).forEach(([key, value]) => {
        const flagHook = allFlags[key as keyof typeof allFlags];
        if (flagHook && value !== flagHook.value) {
          flagHook.setValue(value);
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

  const handleReset = () => {
    Object.entries(FEATURE_FLAG_CONFIG).forEach(([key, config]) => {
      const flagHook = allFlags[key as keyof typeof allFlags];
      if (flagHook) {
        flagHook.setValue(config.defaultValue);
      }
    });
  };

  const hasChanges = Object.keys(localFlags).some(
    key => localFlags[key] !== allFlags[key as keyof typeof allFlags]?.value
  );

  if (!isExpanded) {
    return (
      <div className="px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={() => setShowToggles(!showToggles)}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 py-2 space-y-3">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => setShowToggles(!showToggles)}
        >
          <Settings className="h-4 w-4 mr-2" />
          <span className="text-sm">Feature Toggles</span>
        </Button>
      </div>

      <AnimatePresence>
        {showToggles && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-2 overflow-hidden"
          >
            <Separator />
            
            <div className="space-y-2">
              {Object.entries(FEATURE_FLAG_CONFIG).map(([flagKey, config]) => {
                const isEnabled = localFlags[flagKey] ?? false;
                const hasChanged = localFlags[flagKey] !== allFlags[flagKey as keyof typeof allFlags]?.value;
                
                return (
                  <motion.div
                    key={flagKey}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <Label className="text-xs font-medium truncate">
                          {config.name}
                        </Label>
                        {hasChanged && (
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            •
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {config.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {isEnabled ? (
                        <Eye className="h-3 w-3 text-green-600" />
                      ) : (
                        <EyeOff className="h-3 w-3 text-gray-400" />
                      )}
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={() => handleFlagToggle(flagKey)}
                        className="scale-75"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-1 pt-2"
              >
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1 h-7 text-xs"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveChanges}
                  disabled={isUpdating}
                  className="flex-1 h-7 text-xs"
                >
                  {isUpdating ? (
                    <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                  ) : (
                    <>
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
