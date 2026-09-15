import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md' }) => {
  const titleSizes = {
    sm: 'text-base tracking-[0.2em]',
    md: 'text-xl tracking-[0.25em]',
    lg: 'text-3xl tracking-[0.3em]',
  };

  return (
    <div className="flex items-center gap-3 select-none">
      <div className="flex flex-col">
        <span
          className={`font-cinzel font-bold uppercase gold-gradient-text leading-tight ${titleSizes[size]}`}
        >
          Yash Creations Demo
        </span>
      </div>
    </div>
  );
};
