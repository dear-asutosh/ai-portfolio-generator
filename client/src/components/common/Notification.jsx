import React from 'react';
import { Flash, IconButton, ThemeProvider } from '@primer/react';
import { X } from 'lucide-react';

const Notification = ({ type = 'info', message, onClose, className = '' }) => {
  if (!message) return null;

  // Map our internal types to Primer Flash variants
  const variantMap = {
    info: 'default',
    success: 'success',
    warning: 'warning',
    error: 'danger'
  };

  const variant = variantMap[type] || 'default';

  return (
    <ThemeProvider colorMode="dark">
      <Flash 
        variant={variant} 
        className={`animate-fade-in-down flex items-center justify-between ${className}`}
        sx={{
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          padding: '12px 16px',
          border: '1px solid',
          // Ensure it doesn't inherit unwanted fonts
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
          // Primer dark mode overrides for consistency with our aesthetic
          backgroundColor: variant === 'danger' ? 'rgba(248, 81, 73, 0.1)' : undefined,
          borderColor: variant === 'danger' ? 'rgba(248, 81, 73, 0.2)' : undefined,
        }}
      >
        <div className="flex items-center gap-2">
          {message}
        </div>
        {onClose && (
          <IconButton 
            icon={X} 
            aria-label="Close" 
            onClick={onClose} 
            variant="invisible" 
            size="small"
            sx={{ color: 'inherit', ml: 2 }}
          />
        )}
      </Flash>
    </ThemeProvider>
  );
};

export default Notification;
