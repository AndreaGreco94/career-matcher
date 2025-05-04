import React from "react";

interface StepProgressProps {
  currentStep: number;
}

const StepProgress: React.FC<StepProgressProps> = ({ currentStep }) => {
  const steps = [
    { number: 1, label: "Interessi" },
    { number: 2, label: "Preferenze" },
    { number: 3, label: "Esperienza" },
    { number: 4, label: "Risultati" },
  ];

  return (
    <div className="border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <span
              className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium ${
                step.number <= currentStep
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {step.number}
            </span>
            <span
              className={`ml-2 font-medium ${
                step.number <= currentStep ? "text-primary" : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`mx-2 h-0.5 w-6 ${
                  step.number < currentStep ? "bg-primary" : "bg-gray-200"
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepProgress;
