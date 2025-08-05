# 🔧 Employee Tracking Feature Flag

## How to Enable/Disable Employee Tracking

The employee tracking system can be easily enabled or disabled using a feature flag located in:

**`src/lib/constants.ts`**

## 🚀 To Enable Tracking:

1. Open `src/lib/constants.ts`
2. Change this line:
   ```typescript
   export const ENABLE_EMPLOYEE_TRACKING = false
   ```
   to:
   ```typescript
   export const ENABLE_EMPLOYEE_TRACKING = true
   ```
3. Save the file
4. The tracking system will now be available for admin users

## 🚫 To Disable Tracking:

1. Open `src/lib/constants.ts`
2. Change this line:
   ```typescript
   export const ENABLE_EMPLOYEE_TRACKING = true
   ```
   to:
   ```typescript
   export const ENABLE_EMPLOYEE_TRACKING = false
   ```
3. Save the file
4. The tracking system will be completely hidden

## 📋 What Happens When Disabled:

- ❌ **Navigation Link**: "Suivi Activités" link disappears from admin navigation
- ❌ **Page Access**: `/dashboard/tracking` redirects to dashboard
- ❌ **API Endpoints**: Tracking API returns 404 error
- ❌ **Activity Logging**: No activities are logged to database
- ✅ **Performance**: No overhead when disabled

## 📋 What Happens When Enabled:

- ✅ **Navigation Link**: "Suivi Activités" appears in admin navigation
- ✅ **Page Access**: Full tracking dashboard available
- ✅ **API Endpoints**: Tracking API works normally
- ✅ **Activity Logging**: All employee actions are logged
- ✅ **Complete Functionality**: All tracking features available

## 🔄 No Restart Required

Changes to the feature flag take effect immediately without restarting the application. Simply refresh the page after changing the constant.

## 🛡️ Security Notes

- When disabled, the tracking system is completely inaccessible
- No performance impact when tracking is disabled
- Database queries for activity logs are skipped when disabled
- Even direct URL access to tracking pages is blocked

---

**Current Status**: `ENABLE_EMPLOYEE_TRACKING = false` (Disabled)

To enable tracking, simply change the constant to `true` in `src/lib/constants.ts`