import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg"; // Add padding options
  shadow?: boolean; // Add shadow toggle
}

const Card: React.FC<CardProps> = ({ children, className = "", padding = "md", shadow = true }) => {
  let paddingClasses = "";
  switch (padding) {
    case "sm":
      paddingClasses = "p-2";
      break;
    case "lg":
      paddingClasses = "p-6";
      break;
    default: // md
      paddingClasses = "p-4";
      break;
  }

  const shadowClass = shadow ? "shadow-md" : "shadow-none";

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg ${shadowClass} ${paddingClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
