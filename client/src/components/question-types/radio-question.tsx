import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface RadioOption {
  value: string;
  title: string;
  description: string;
}

interface RadioQuestionProps {
  label: string;
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
}

const RadioQuestion: React.FC<RadioQuestionProps> = ({
  label,
  name,
  options,
  value,
  onChange,
}) => {
  return (
    <div className="mb-6">
      <Label className="block text-sm font-medium text-gray-700 mb-2">{label}</Label>
      <RadioGroup
        className="space-y-2"
        value={value}
        onValueChange={onChange}
        name={name}
      >
        {options.map((option) => (
          <div
            key={option.value}
            className="flex items-start p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
            onClick={() => onChange(option.value)}
          >
            <RadioGroupItem
              value={option.value}
              id={`${name}-${option.value}`}
              className="h-4 w-4 text-primary mt-0.5"
            />
            <span className="ml-3">
              <span className="block text-sm font-medium text-gray-900">
                {option.title}
              </span>
              {option.description && (
                <span className="block text-sm text-gray-500">
                  {option.description}
                </span>
              )}
            </span>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default RadioQuestion;
