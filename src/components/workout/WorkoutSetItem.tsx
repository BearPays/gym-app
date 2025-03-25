import React from "react";
import { useSwipeable } from "react-swipeable";

interface SetItemProps {
  setNumber: number;
  reps: number;
  weight: number;
  isCompleted: boolean;
  onRepsChange: (value: number) => void;
  onWeightChange: (value: number) => void;
  onCompletionChange: (completed: boolean) => void;
  onDelete: () => void;
}

const SetItem: React.FC<SetItemProps> = ({ setNumber, reps, weight, isCompleted, onRepsChange, onWeightChange, onCompletionChange, onDelete }) => {
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select(); // Select all text when the field is focused
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: onDelete,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  return (
    <div {...swipeHandlers} className="flex items-center gap-4 bg-white dark:bg-gray-800 p-3 rounded-md shadow-md">
      <div className="w-12 text-center font-medium text-gray-700 dark:text-gray-300">
        {setNumber}
      </div>
      <div className="flex-1">
        <input
          type="number"
          inputMode="numeric"
          value={weight}
          onChange={(e) => onWeightChange(Number(e.target.value))}
          onFocus={handleFocus}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:hidden [&::-webkit-inner-spin-button]:hidden"
        />
      </div>
      <div className="flex-1">
        <input
          type="number"
          inputMode="numeric"
          value={reps}
          onChange={(e) => onRepsChange(Number(e.target.value))}
          onFocus={handleFocus}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:hidden [&::-webkit-inner-spin-button]:hidden"
        />
      </div>
      <div>
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={(e) => onCompletionChange(e.target.checked)}
          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      </div>
    </div>
  );
};

export default SetItem;
