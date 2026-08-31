import React from 'react';
import * as LucideIcons from 'lucide-react';

// Converts kebab-case like 'heart-pulse' to PascalCase 'HeartPulse'
const toPascalCase = (str) => {
  if (!str) return 'HelpCircle';
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

export default function Icon({ name = 'help-circle', size = 18, strokeWidth = 2, className = '', ...props }) {
  const iconName = toPascalCase(name);
  const IconComponent = LucideIcons[iconName] || LucideIcons[name] || LucideIcons.HelpCircle;

  return (
    <IconComponent
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden="true"
      {...props}
    />
  );
}
