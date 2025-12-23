import React from 'react';

interface LoadingProps {
  variant?: 'spinner' | 'fullpage' | 'skeleton' | 'inline';
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  skeletonCount?: number;
}

export function Loading({ 
  variant = 'spinner', 
  text, 
  size = 'md',
  className = '',
  skeletonCount = 9
}: LoadingProps) {
  // Spinner component - 2 vòng tròn: 1 lớn ngoài, 1 nhỏ trong
  const Spinner = ({ spinnerSize = size }: { spinnerSize?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
      sm: 'w-8 h-8 border-2',
      md: 'w-16 h-16 border-4',
      lg: 'w-24 h-24 border-4'
    };

    const innerSizeClasses = {
      sm: 'w-4 h-4 border-2',
      md: 'w-8 h-8 border-2',
      lg: 'w-12 h-12 border-2'
    };

    return (
      <div className="relative">
        <div className={`${sizeClasses[spinnerSize]} border-green-200 border-t-green-600 rounded-full animate-spin`}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className={`${innerSizeClasses[spinnerSize]} border-green-300 border-t-green-600 rounded-full animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '0.5s' }}></div>
        </div>
      </div>
    );
  };

  // Full page loading
  if (variant === 'fullpage') {
    return (
      <div className={`fixed inset-0 w-screen h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center z-50 ${className}`}>
        <Spinner />
      </div>
    );
  }

  // Skeleton loading
  if (variant === 'skeleton') {
    return (
      <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
        {[...Array(skeletonCount)].map((_, i) => (
          <div key={i} className="h-96 bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  // Inline loading
  if (variant === 'inline') {
    return (
      <div className={`flex items-center justify-center py-4 ${className}`}>
        <Spinner spinnerSize="sm" />
      </div>
    );
  }

  // Default spinner
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <Spinner />
    </div>
  );
}

// Export default for backward compatibility
export default Loading;

