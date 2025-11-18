"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateNotificationPreferences = validateNotificationPreferences;
function validateNotificationPreferences(preferences) {
    if (!preferences || typeof preferences !== 'object') {
        return false;
    }
    // Validate frequency
    if (!preferences.frequency || !['daily', 'weekly', 'monthly', 'never'].includes(preferences.frequency)) {
        return false;
    }
    // Validate types
    if (!Array.isArray(preferences.types) || preferences.types.some((type) => typeof type !== 'string')) {
        return false;
    }
    // Validate enabled
    if (typeof preferences.enabled !== 'boolean') {
        return false;
    }
    return true;
}
