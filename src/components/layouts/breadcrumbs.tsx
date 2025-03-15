'use client';

import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Typography, Box } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import HomeIcon from '@mui/icons-material/Home';

// Define the structure for a breadcrumb item
export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
  sx?: React.CSSProperties;
}

// Map of path segments to readable names
const pathMap: Record<string, string> = {
  'screens': 'Screens',
  'dashboard': 'Dashboard',
  'content': 'Content',
  'verse_hadith': 'Verses & Hadiths',
  'announcement': 'Announcements',
  'event': 'Events',
  'custom': 'Custom Content',
  'asma_al_husna': '99 Names of Allah',
  'create': 'Create',
  'edit': 'Edit',
  'settings': 'Settings',
  'users': 'Users',
  'masjid': 'Masjid',
  'prayer_times': 'Prayer Times',
};

// Function to get a readable name for a path segment
const getReadableName = (segment: string): string => {
  // Check if it's an ID (starts with 'cm' followed by alphanumeric characters)
  if (/^cm[a-z0-9]+$/.test(segment)) {
    return 'Details';
  }
  
  return pathMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/_/g, ' ');
};

export default function Breadcrumbs({ items, showHome = true, sx }: BreadcrumbsProps) {
  const pathname = usePathname();
  
  // Generate breadcrumbs from the current path if not provided
  const breadcrumbs = items || generateBreadcrumbs(pathname, showHome);
  
  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs if there's only one item or none
  }
  
  return (
    <Box sx={{ mb: 2, ...sx }}>
      <MuiBreadcrumbs aria-label="breadcrumb">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          if (isLast || !item.href) {
            return (
              <Typography 
                key={index} 
                color="text.primary" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  fontWeight: isLast ? 'medium' : 'normal'
                }}
              >
                {item.icon && <Box component="span" sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>{item.icon}</Box>}
                {item.label}
              </Typography>
            );
          }
          
          return (
            <Link key={index} href={item.href} passHref>
              <Typography 
                color="inherit" 
                sx={{ 
                  textDecoration: 'none', 
                  '&:hover': { textDecoration: 'underline' }, 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {item.icon && <Box component="span" sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>{item.icon}</Box>}
                {item.label}
              </Typography>
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
}

// Function to generate breadcrumbs from a pathname
export function generateBreadcrumbs(pathname: string, showHome = true): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // Add home breadcrumb if requested
  if (showHome) {
    breadcrumbs.push({
      label: 'Home',
      href: '/',
      icon: <HomeIcon fontSize="small" />
    });
  }
  
  // Build up the breadcrumbs based on path segments
  let currentPath = '';
  
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Skip the 'screens' segment in the breadcrumb display but keep it in the path
    if (segment === 'screens') {
      return;
    }
    
    breadcrumbs.push({
      label: getReadableName(segment),
      href: index === segments.length - 1 ? undefined : currentPath
    });
  });
  
  return breadcrumbs;
} 