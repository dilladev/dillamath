import React from 'react';

type SmallSwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export const SmallSwitch = ({ checked, onCheckedChange }: SmallSwitchProps) => {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`relative w-8 h-4 transition-colors rounded-full mr-1
        ${checked ? 'bg-blue-500' : 'bg-gray-500'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-3 h-3 transition-transform rounded-full bg-white transform
          ${checked ? 'translate-x-4' : 'translate-x-0'}`}
      />
    </button>
  );
};
