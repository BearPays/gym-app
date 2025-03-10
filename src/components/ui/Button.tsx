import React from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "success";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: ButtonVariant;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
  fullWidth = false,
}) => {
  const baseClasses = "px-4 py-2 rounded font-medium transition-colors duration-200";
  const widthClasses = fullWidth ? "w-full" : "";
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-300 text-gray-800 hover:bg-gray-400",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700",
  };
  
  const disabledClasses = disabled
    ? "bg-gray-400 text-white cursor-not-allowed"
    : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${widthClasses}
        ${disabledClasses || variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;
