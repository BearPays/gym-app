import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "outline";
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg"; // Add size prop
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  fullWidth = false,
  size = "md", // Default size
  className = "",
  ...props
}) => {
  let variantClasses = "";
  
  switch (variant) {
    case "primary":
      variantClasses = "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white";
      break;
    case "secondary":
      variantClasses = "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white";
      break;
    case "danger":
      variantClasses = "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white";
      break;
    case "success":
      variantClasses = "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white";
      break;
    case "outline":
      variantClasses = "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white";
      break;
  }

  // Size classes
  let sizeClasses = "";
  switch (size) {
    case "sm":
      sizeClasses = "px-3 py-1 text-sm";
      break;
    case "lg":
      sizeClasses = "px-6 py-3 text-lg";
      break;
    default: // md
      sizeClasses = "px-4 py-2";
      break;
  }
  
  const widthClass = fullWidth ? "w-full" : "";
  
  return (
    <button
      className={`rounded-md transition-colors ${variantClasses} ${sizeClasses} ${widthClass} 
        disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
