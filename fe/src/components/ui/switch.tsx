import React from 'react';

type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export const Switch = ({ checked, onCheckedChange }: SwitchProps) => {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`relative w-12 h-6 transition-colors rounded-full   mr-2
        ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 transition-transform rounded-full bg-white transform
          ${checked ? 'translate-x-6' : 'translate-x-0'}`}
      />
    </button>
  );
};
