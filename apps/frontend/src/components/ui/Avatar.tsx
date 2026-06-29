'use client';

import { useState, type ImgHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Avatar({ className, name = 'User', size = 'md', src, ...props }: AvatarProps): JSX.Element {
  const [error, setError] = useState(false);

  const getInitials = (nameStr: string) => {
    const parts = nameStr.trim().split(' ');
    if (parts.length === 0 || !parts[0]) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return ((parts[0][0] || '') + (parts[parts.length - 1][0] || '')).toUpperCase();
  };

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg'
  }[size];

  const hasImage = src && !error;

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full overflow-hidden select-none bg-gradient-to-br from-primary/30 to-secondary/30 text-primary dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-bold shrink-0',
        sizeClasses,
        className
      )}
    >
      {hasImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={props.alt ?? name}
          className="h-full w-full object-cover animate-fade-in"
          onError={() => setError(true)}
          {...props}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
