// Custom color palette for the application
export const customColors = {
  warning: {
    main: '#E76F51', // Burnt Orange
    light: '#F09875', // Soft Coral
    dark: '#C55C44', // Deep Rust
    contrastText: '#FFFFFF', // White
  },
  error: {
    main: '#D62828', // Crimson Red
    light: '#F04C4C', // Vivid Red
    dark: '#A31F1F', // Deep Maroon
    contrastText: '#FFFFFF', // White
  },
  info: {
    main: '#219EBC', // Deep Sky Blue
    light: '#4FB6D6', // Light Azure
    dark: '#176F8A', // Steely Blue
    contrastText: '#FFFFFF', // White
  },
  success: {
    main: '#2A9D8F', // Emerald Green
    light: '#3DBEB0', // Soft Aqua
    dark: '#1E7268', // Deep Teal
    contrastText: '#FFFFFF', // White
  },
};

// Alert styles using the custom colors with improved readability
export const alertStyles = {
  warning: {
    backgroundColor: 'rgba(231, 111, 81, 0.08)', // Very light orange background
    color: '#000000', // Black text for better readability
    '& .MuiAlert-icon': {
      color: customColors.warning.main,
    },
  },
  error: {
    backgroundColor: 'rgba(214, 40, 40, 0.08)', // Very light red background
    color: '#000000', // Black text for better readability
    '& .MuiAlert-icon': {
      color: customColors.error.main,
    },
  },
  info: {
    backgroundColor: 'rgba(33, 158, 188, 0.08)', // Very light blue background
    color: '#000000', // Black text for better readability
    '& .MuiAlert-icon': {
      color: customColors.info.main,
    },
  },
  success: {
    backgroundColor: 'rgba(42, 157, 143, 0.08)', // Very light green background
    color: '#000000', // Black text for better readability
    '& .MuiAlert-icon': {
      color: customColors.success.main,
    },
  },
}; 