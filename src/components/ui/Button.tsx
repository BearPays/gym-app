import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "outline" | "ghost";
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  fullWidth = false,
  size = "md",
  className = "",
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  ...props
}) => {
  let variantClasses = "";
  
  switch (variant) {
    case "primary":
      variantClasses = "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600 dark:active:bg-blue-700 text-white shadow-sm";
      break;
    case "secondary":
      variantClasses = "bg-gray-200 hover:bg-gray-300 active:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 dark:active:bg-gray-500 text-gray-800 dark:text-white shadow-sm";
      break;
    case "danger":
      variantClasses = "bg-red-600 hover:bg-red-700 active:bg-red-800 dark:bg-red-500 dark:hover:bg-red-600 dark:active:bg-red-700 text-white shadow-sm";
      break;
    case "success":
      variantClasses = "bg-green-600 hover:bg-green-700 active:bg-green-800 dark:bg-green-500 dark:hover:bg-green-600 dark:active:bg-green-700 text-white shadow-sm";
      break;
    case "outline":
      variantClasses = "bg-transparent hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-gray-700 dark:active:bg-gray-600 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white";
      break;
    case "ghost":
      variantClasses = "bg-transparent hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-gray-800 dark:active:bg-gray-700 text-gray-700 dark:text-gray-300";
      break;
  }

  // Size classes
  let sizeClasses = "";
  switch (size) {
    case "sm":
      sizeClasses = "px-3 py-1.5 text-sm rounded-md";
      break;
    case "lg":
      sizeClasses = "px-6 py-3.5 text-base rounded-lg";
      break;
    case "icon":
      sizeClasses = "p-2 rounded-full";
      break;
    default: // md
      sizeClasses = "px-4 py-2.5 text-sm rounded-md";
      break;
  }
  
  const widthClass = fullWidth ? "w-full" : "";
  
  return (
    <button
      className={`font-medium transition-all duration-200 flex items-center justify-center gap-2
        ${variantClasses} ${sizeClasses} ${widthClass} 
        disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none
        focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-1
        ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && leftIcon && <span>{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span>{rightIcon}</span>}
    </button>
  );
};

export default Button;
