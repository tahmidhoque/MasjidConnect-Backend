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

---
*Last Updated: [Current Date]*

Note: This document will be updated as new issues are discovered or existing ones are resolved. 