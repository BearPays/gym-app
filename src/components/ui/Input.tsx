import React from "react";

interface InputProps {
  id: string;
  label?: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  min,
  max,
  step,
  className = "",
}) => {
  return (
    <div className={`${className}`}>
      {label && (
        <label htmlFor={id} className="block mb-2 text-sm font-medium">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        step={step}
        className="w-full p-2 border border-gray-300 rounded"
      />
    </div>
  );
};

export default Input;
