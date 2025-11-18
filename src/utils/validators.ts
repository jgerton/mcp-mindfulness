export interface NotificationPreferences {
  frequency: 'daily' | 'weekly' | 'monthly' | 'never';
  types: string[];
  enabled: boolean;
}

export function validateNotificationPreferences(preferences: any): preferences is NotificationPreferences {
  if (!preferences || typeof preferences !== 'object') {
    return false;
  }

  // Validate frequency
  if (!preferences.frequency || !['daily', 'weekly', 'monthly', 'never'].includes(preferences.frequency)) {
    return false;
  }

  // Validate types
  if (!Array.isArray(preferences.types) || preferences.types.some((type: unknown) => typeof type !== 'string')) {
    return false;
  }

  // Validate enabled
  if (typeof preferences.enabled !== 'boolean') {
    return false;
  }

  return true;
} 