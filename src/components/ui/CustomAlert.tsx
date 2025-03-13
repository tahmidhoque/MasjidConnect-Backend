import React from 'react';
import { Alert, AlertProps, AlertTitle, styled } from '@mui/material';
import { alertStyles, customColors } from '@/theme/colors';

// Create a styled Alert component with our custom styles
const StyledAlert = styled(Alert)<AlertProps>(({ severity }) => {
  const baseStyles = {
    borderRadius: '4px',
    borderLeft: '4px solid',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    '& .MuiAlert-message': {
      padding: '0',
    },
    '& .MuiAlertTitle-root': {
      marginBottom: '8px',
      fontWeight: 600,
      fontSize: '1rem',
    },
    '& .MuiAlert-icon': {
      padding: '0',
      marginRight: '12px',
      fontSize: '20px',
    },
  };

  if (severity === 'warning') {
    return {
      ...alertStyles.warning,
      ...baseStyles,
      borderLeftColor: customColors.warning.main,
    };
  } else if (severity === 'error') {
    return {
      ...alertStyles.error,
      ...baseStyles,
      borderLeftColor: customColors.error.main,
    };
  } else if (severity === 'info') {
    return {
      ...alertStyles.info,
      ...baseStyles,
      borderLeftColor: customColors.info.main,
    };
  } else if (severity === 'success') {
    return {
      ...alertStyles.success,
      ...baseStyles,
      borderLeftColor: customColors.success.main,
    };
  }
  return baseStyles;
});

export interface CustomAlertProps extends AlertProps {
  title?: string;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ 
  title, 
  children, 
  severity = 'info',
  ...props 
}) => {
  return (
    <StyledAlert severity={severity} {...props}>
      {title && <AlertTitle>{title}</AlertTitle>}
      {children}
    </StyledAlert>
  );
};

export default CustomAlert; 