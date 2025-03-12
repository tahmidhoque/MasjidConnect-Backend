# Known Issues

## UI/UX Issues

### Dashboard Layout
1. **User Profile Section Flicker** *(High Priority)*
   - **Issue**: User profile section in the drawer (name and mosque) shows loading animation briefly when navigating between pages
   - **Current Status**: Attempted fix with React.memo and useMemo optimizations didn't resolve the issue
   - **Potential Causes**:
     - UserContext might be re-initializing on page changes
     - ClientOnly wrapper forcing re-renders
     - Hydration issues with Next.js
   - **Next Steps**:
     - Investigate UserContext implementation
     - Consider moving user data to global state management
     - Profile performance with React DevTools
   - **Impact**: Affects user experience with visible loading states during navigation

### Page Transitions
1. **Smooth Page Transitions**
   - **Status**: Implemented but needs refinement
   - **Current Behavior**: Only affects main content area
   - **Future Improvements**:
     - Consider adding route-specific transitions
     - Optimize animation performance

## Content Schedule Management

### Set Default Schedule Functionality
- **Status**: Temporarily Disabled
- **Issue**: Unique constraint violation when attempting to set a schedule as default
- **Details**: When trying to set a content schedule as default, the operation fails due to a database unique constraint violation on the `ContentSchedule` table for the fields (`masjidId`, `isDefault`).
- **Impact**: Users cannot change which schedule is set as default
- **Workaround**: The "Set as Default" functionality has been temporarily disabled until a proper fix can be implemented
- **Technical Notes**: The issue appears to be related to race conditions and transaction handling when updating the default status of schedules

---
*Last Updated: [Current Date]*

Note: This document will be updated as new issues are discovered or existing ones are resolved. 