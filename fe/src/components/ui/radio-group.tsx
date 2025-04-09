import React from 'react';

type RadioGroupProps = {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
};

type RadioGroupItemProps = {
  value: string;
  label: string;
};

export const RadioGroup = ({ value, onValueChange, children, className = '' }: RadioGroupProps) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            checked: child.props.value === value,
            onChange: () => onValueChange(child.props.value),
            name: 'math-operation',
          });
        }
        return child;
      })}
    </div>
  );
};

export const RadioGroupItem = ({
  value,
  label,
  checked,
  onChange,
  name
}: RadioGroupItemProps & {
  checked?: boolean;
  onChange?: () => void;
  name?: string;
}) => {
  return (
    <label
      className={`flex items-center cursor-pointer space-x-3 p-2 border rounded-md transition
        ${checked ? 'border-blue-500' : 'border-gray-300'}
      `}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="form-radio text-blue-600"
      />
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
};
