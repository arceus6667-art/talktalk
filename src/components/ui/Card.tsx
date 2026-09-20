import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hover' | 'bordered' | 'glass' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  className = '',
  children,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-[#12161f]/80 border border-slate-800/80 shadow-lg shadow-black/20 backdrop-blur-md',
    hover: 'bg-[#12161f]/80 border border-slate-800/80 hover:border-indigo-500/50 hover:shadow-indigo-500/10 hover:shadow-xl transition-all duration-300 backdrop-blur-md',
    bordered: 'bg-transparent border border-slate-800 hover:border-slate-700 transition-colors',
    glass: 'bg-[#12161f]/50 border border-white/5 backdrop-blur-xl shadow-2xl',
    gradient: 'bg-gradient-to-b from-[#181e2b] to-[#12161f] border border-indigo-500/20 shadow-xl'
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3 rounded-lg',
    md: 'p-5 rounded-xl',
    lg: 'p-6 sm:p-8 rounded-2xl'
  };

  return (
    <div
      className={`${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
