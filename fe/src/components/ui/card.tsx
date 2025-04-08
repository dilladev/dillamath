import React from 'react';

export const Card = ({ children }) => (
  <div className="gradient shadow rounded">{children}</div>
);

export const CardContent = ({ children, className }) => (
  <div className={className}>{children}</div>
);
