// Feature flag constants following UPPERCASE_WITH_UNDERSCORE naming convention
export const FEATURE_FLAGS = {
  PURCHASE_ORDERS_ENABLED: 'purchase-orders-enabled',
  AI_QUOTE_DRAFTING: 'ai-quote-drafting',
  OFFLINE_CAPTURE: 'offline-capture',
  ADVANCED_SCHEDULING: 'advanced-scheduling',
  SUPPLIER_INTEGRATION: 'supplier-integration',
} as const;

export type FeatureFlagKey = typeof FEATURE_FLAGS[keyof typeof FEATURE_FLAGS];

// Feature flag configuration with default values and descriptions
export const FEATURE_FLAG_CONFIG = {
  [FEATURE_FLAGS.PURCHASE_ORDERS_ENABLED]: {
    name: 'Purchase Orders',
    description: 'Enable purchase order management functionality',
    defaultValue: true,
  },
  [FEATURE_FLAGS.AI_QUOTE_DRAFTING]: {
    name: 'AI Quote Drafting',
    description: 'Enable AI-powered quote line item suggestions',
    defaultValue: false,
  },
  [FEATURE_FLAGS.OFFLINE_CAPTURE]: {
    name: 'Offline Capture',
    description: 'Enable offline photo and data capture',
    defaultValue: true,
  },
  [FEATURE_FLAGS.ADVANCED_SCHEDULING]: {
    name: 'Advanced Scheduling',
    description: 'Enable AI-powered scheduling suggestions',
    defaultValue: false,
  },
  [FEATURE_FLAGS.SUPPLIER_INTEGRATION]: {
    name: 'Supplier Integration',
    description: 'Enable direct supplier catalog integration',
    defaultValue: false,
  },
} as const;
