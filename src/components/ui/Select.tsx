import React from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  required = false,
  className = "",
}) => {
  return (
    <div className={`${className}`}>
      {label && (
        <label htmlFor={id} className="block mb-2 text-sm font-medium">
          {label}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full p-2 border border-gray-300 rounded"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
