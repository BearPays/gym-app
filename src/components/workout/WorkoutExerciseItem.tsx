import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import Button from "@/components/ui/Button";
import SetItem from "./WorkoutSetItem";
import ExerciseInfoButton from "@/components/exercise/ExerciseInfoButton";
import { WorkoutExercise, WorkoutSet } from "@/contexts/WorkoutContext";

interface WorkoutExerciseItemProps {
  exercise: WorkoutExercise;
  exerciseIndex: number; // Added this prop
  onAddSet: () => void;
  onRemoveExercise: () => void;
  onRemoveSet: (setIndex: number) => void;
  onUpdateSet: (setIndex: number, field: keyof WorkoutSet, value: number | boolean) => void;
}

const WorkoutExerciseItem: React.FC<WorkoutExerciseItemProps> = ({
  exercise,
  onAddSet,
  onRemoveExercise,
  onRemoveSet,
  onUpdateSet,
}) => {
  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold">{exercise.name}</h3>
          <ExerciseInfoButton exerciseId={exercise.exerciseId} className="ml-2" />
        </div>
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-2 py-1 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zm0 5.25a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zm0 5.25a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5z"
                />
              </svg>
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={onRemoveExercise}
                      className={`${
                        active ? "bg-gray-100 dark:bg-gray-700" : ""
                      } group flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                    >
                      Remove Exercise
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => alert("Replace Exercise clicked")}
                      className={`${
                        active ? "bg-gray-100 dark:bg-gray-700" : ""
                      } group flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                    >
                      Replace Exercise
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

      <div className="mb-4">
        <div className="grid grid-cols-4 gap-4 font-medium text-sm border-b pb-2 mb-2 text-center"> {/* Fixing header alignment */}
          <div>Set</div>
          <div>Weight (kg)</div>
          <div>Reps</div>
          <div></div> {/* Empty column for checkbox */}
        </div>

        {exercise.sets.map((set, setIndex) => (
          <div key={set.id} className="mb-2"> {/* Add margin between sets */}
            <SetItem
              setNumber={setIndex + 1}
              reps={set.reps}
              weight={set.weight}
              isCompleted={set.completed}
              onRepsChange={(value) => onUpdateSet(setIndex, "reps", value)}
              onWeightChange={(value) => onUpdateSet(setIndex, "weight", value)}
              onCompletionChange={(completed) => onUpdateSet(setIndex, "completed", completed)}
              onDelete={() => onRemoveSet(setIndex)}
            />
          </div>
        ))}
      </div>

      <Button 
        variant="secondary" 
        onClick={onAddSet} 
        className="w-full"
      >
        + Add Set
      </Button>
    </div>
  );
};

export default WorkoutExerciseItem;
