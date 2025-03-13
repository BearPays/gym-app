import React, { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
}

const Input: React.FC<InputProps> = ({ id, label, className = "", ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md 
                   shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 
                   dark:bg-gray-800 dark:text-white ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;
