'use client';

import * as React from 'react';

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface DropdownMenuSeparatorProps {
  className?: string;
}

const DropdownMenu = ({ children }: DropdownMenuProps) => {
  return <div className="relative inline-block text-left">{children}</div>;
};

const DropdownMenuTrigger = ({ children }: DropdownMenuTriggerProps) => {
  return <div>{children}</div>;
};

const DropdownMenuContent = ({ children, className = '' }: DropdownMenuContentProps) => {
  return (
    <div className={`absolute right-0 mt-2 w-56 bg-card border border-border rounded-md shadow-lg z-10 ${className}`}>
      <div className="py-1" role="menu">
        {children}
      </div>
    </div>
  );
};

const DropdownMenuItem = ({ children, className = '', onClick }: DropdownMenuItemProps) => {
  return (
    <button
      className={`w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors ${className}`}
      role="menuitem"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const DropdownMenuSeparator = ({ className = '' }: DropdownMenuSeparatorProps) => {
  return <hr className={`my-1 border-border ${className}`} />;
};

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
};