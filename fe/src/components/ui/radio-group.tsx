import React from 'react';

export const RadioGroup = ({ value, onValueChange, children }) => {
  return (
    <div onChange={(e) => onValueChange(e.target.value)}>
      {React.Children.map(children, child =>
        React.cloneElement(child, {
          checked: child.props.value === value,
          name: 'radio-group',
        })
      )}
    </div>
  );
};

export const RadioGroupItem = ({ value, label, checked, name }) => {
  return (
    <label className="flex items-center space-x-2">
      <input
        type="radio"
        value={value}
        name={name}
        defaultChecked={checked}
      />
      <span>{label}</span>
    </label>
  );
};
