# Feature Flags System

This document describes the feature flag system implemented in the TradePro platform using PostHog.

## Overview

The feature flag system allows you to:
- Toggle features on/off without deploying code
- Roll out features gradually to specific users or roles
- A/B test different feature configurations
- Manage feature access based on user roles and permissions

## Architecture

### Components

1. **Feature Flag Constants** (`src/lib/feature-flags.ts`)
   - Defines all feature flag keys and configurations
   - Follows UPPERCASE_WITH_UNDERSCORE naming convention
   - Includes default values and descriptions

2. **Feature Flag Hooks** (`src/hooks/use-feature-flag.ts`)
   - `useFeatureFlag()` - Check individual feature flags
   - `usePurchaseOrdersEnabled()` - Convenience hook for purchase orders
   - `useFeatureFlags()` - Get all feature flags at once

3. **Feature Flag Service** (`src/lib/feature-flag-service.ts`)
   - Server-side feature flag management
   - Integration with PostHog API
   - Fallback to default values when PostHog is unavailable

4. **Feature Flag Manager** (`src/components/feature-flag-manager.tsx`)
   - UI component for managing feature flags
   - Available in Settings → Features tab

5. **API Routes** (`src/app/api/feature-flags/route.ts`)
   - REST API for feature flag operations
   - GET, POST, DELETE endpoints

## Current Feature Flags

| Flag Key | Name | Description | Default |
|----------|------|-------------|---------|
| `purchase-orders-enabled` | Purchase Orders | Enable purchase order management functionality | `true` |
| `ai-quote-drafting` | AI Quote Drafting | Enable AI-powered quote line item suggestions | `false` |
| `offline-capture` | Offline Capture | Enable offline photo and data capture | `true` |
| `advanced-scheduling` | Advanced Scheduling | Enable AI-powered scheduling suggestions | `false` |
| `supplier-integration` | Supplier Integration | Enable direct supplier catalog integration | `false` |

## Usage

### In Components

```typescript
import { useFeatureFlag } from '@/hooks/use-feature-flag';
import { FEATURE_FLAGS } from '@/lib/feature-flags';

function MyComponent() {
  const { isEnabled, isLoading } = useFeatureFlag(FEATURE_FLAGS.PURCHASE_ORDERS_ENABLED);
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {isEnabled && <PurchaseOrdersSection />}
    </div>
  );
}
```

### In Context

```typescript
import { useApp } from '@/lib/context';

function MyComponent() {
  const { featureFlags } = useApp();
  
  if (featureFlags[FEATURE_FLAGS.PURCHASE_ORDERS_ENABLED]) {
    return <PurchaseOrdersSection />;
  }
  
  return <div>Feature not available</div>;
}
```

### Server-Side

```typescript
import { FeatureFlagService } from '@/lib/feature-flag-service';

export async function serverAction() {
  const isEnabled = await FeatureFlagService.isFeatureEnabled(
    FEATURE_FLAGS.PURCHASE_ORDERS_ENABLED,
    { id: 'user-1', role: 'Manager', email: 'user@example.com' }
  );
  
  if (isEnabled) {
    // Execute feature code
  }
}
```

## Managing Feature Flags

### Via UI (Settings Page)

1. Navigate to **Settings** → **Features**
2. Toggle feature flags on/off
3. Click **Save Changes** to apply

### Via PostHog Dashboard

1. Log into your PostHog dashboard
2. Go to **Feature Flags**
3. Create or edit feature flags
4. Configure targeting rules (users, roles, percentages)

### Via API

```bash
# Get all feature flags for a user
GET /api/feature-flags?userId=user-1&role=Manager&email=user@example.com

# Update a feature flag
POST /api/feature-flags
{
  "flagKey": "purchase-orders-enabled",
  "data": {
    "name": "Purchase Orders",
    "description": "Enable purchase order management",
    "active": true
  }
}

# Delete a feature flag
DELETE /api/feature-flags?flagKey=purchase-orders-enabled
```

## Adding New Feature Flags

1. **Add to constants** (`src/lib/feature-flags.ts`):
   ```typescript
   export const FEATURE_FLAGS = {
     // ... existing flags
     NEW_FEATURE_ENABLED: 'new-feature-enabled',
   } as const;
   
   export const FEATURE_FLAG_CONFIG = {
     // ... existing configs
     [FEATURE_FLAGS.NEW_FEATURE_ENABLED]: {
       name: 'New Feature',
       description: 'Enable the new feature',
       defaultValue: false,
     },
   } as const;
   ```

2. **Use in components**:
   ```typescript
   const { isEnabled } = useFeatureFlag(FEATURE_FLAGS.NEW_FEATURE_ENABLED);
   ```

3. **Create in PostHog** (optional):
   - Use the PostHog dashboard to create the flag
   - Configure targeting rules as needed

## Best Practices

1. **Naming Convention**: Use UPPERCASE_WITH_UNDERSCORE for constants
2. **Default Values**: Always provide sensible defaults
3. **Descriptions**: Include clear descriptions for each flag
4. **Fallbacks**: Handle cases where PostHog is unavailable
5. **User Context**: Pass user information for role-based targeting
6. **Audit Logs**: Log feature flag changes for compliance
7. **Testing**: Test both enabled and disabled states

## Security Considerations

1. **Server-Side Validation**: Always validate feature flags server-side
2. **Role-Based Access**: Use user roles for feature access control
3. **Audit Trails**: Log all feature flag changes
4. **Fallback Security**: Ensure fallback values don't expose sensitive features

## Troubleshooting

### Feature Flag Not Working

1. Check if PostHog is properly initialized
2. Verify the flag key matches between code and PostHog
3. Check user context (role, email) is being passed correctly
4. Look for console errors in browser developer tools

### PostHog Connection Issues

1. Verify environment variables are set correctly
2. Check network connectivity to PostHog
3. Verify API keys have correct permissions
4. Check PostHog service status

### Performance Issues

1. Use `useFeatureFlags()` to batch flag checks
2. Cache flag values appropriately
3. Avoid checking flags in render loops
4. Use server-side checks for critical features
