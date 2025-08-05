// Feature flags and application constants

// ========================================
// FEATURE FLAGS
// ========================================

/**
 * Employee Activity Tracking System
 * Set to true to enable the tracking system for admins
 * Set to false to completely hide the tracking functionality
 */
export const ENABLE_EMPLOYEE_TRACKING = false

/**
 * Other feature flags can be added here
 */
export const ENABLE_ADVANCED_REPORTS = false
export const ENABLE_EXPORT_FEATURES = false

// ========================================
// APPLICATION CONSTANTS
// ========================================

export const APP_NAME = 'GestionStore'
export const VERSION = '1.0.0'

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// Activity tracking constants
export const TRACKING_PAGE_SIZE = 20
export const MAX_ACTIVITY_LOGS_PER_REQUEST = 100