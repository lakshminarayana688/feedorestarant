import React from 'react';

export const VegIndicator: React.FC<{ isVeg: boolean; size?: 'sm' | 'md' }> = ({ isVeg, size = 'md' }) => {
  const boxClass = size === 'sm' ? 'w-3.5 h-3.5 border' : 'w-4.5 h-4.5 border-2';
  const dotClass = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  if (isVeg) {
    return (
      <span className={`inline-flex items-center justify-center rounded-sm border-emerald-600 bg-white p-0.5 shadow-xs ${boxClass}`} title="Vegetarian">
        <span className={`rounded-full bg-emerald-600 ${dotClass}`} />
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center justify-center rounded-sm border-rose-600 bg-white p-0.5 shadow-xs ${boxClass}`} title="Non-Vegetarian">
      <span className={`rounded-full bg-rose-600 ${dotClass}`} />
    </span>
  );
};
