import React from 'react';

interface MaterialIconProps {
  name: string;
  filled?: boolean;
  className?: string;
  size?: number;
}

export const MaterialIcon: React.FC<MaterialIconProps> = ({
  name,
  filled = false,
  className = '',
  size = 24,
}) => {
  return (
    <span
      className={`material-symbols-outlined select-none ${className}`}
      style={{
        fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
        fontSize: `${size}px`,
      }}
    >
      {name}
    </span>
  );
};
