import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

function PageHeader({ title, subtitle }: PageHeaderProps) {
  // This component is just a marker for the title
  // It won't render anything as the DashboardLayout
  // will extract the title and render it directly
  return null;
}

// Set displayName for easier component identification
PageHeader.displayName = 'PageHeader';

export default PageHeader; 