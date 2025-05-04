import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface CheckboxOption {
  value: string;
  title: string;
  description: string;
}

interface CheckboxQuestionProps {
  label: string;
  name: string;
  options: CheckboxOption[];
  value: string[];
  onChange: (value: string[]) => void;
  layout?: "stack" | "grid";
}

const CheckboxQuestion: React.FC<CheckboxQuestionProps> = ({
  label,
  name,
  options,
  value,
  onChange,
  layout = "stack",
}) => {
  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange([...value, optionValue]);
    } else {
      onChange(value.filter((v) => v !== optionValue));
    }
  };

  return (
    <div className="mb-6">
      <Label className="block text-sm font-medium text-gray-700 mb-2">{label}</Label>
      <div className={layout === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-2" : "space-y-2"}>
        {options.map((option) => (
          <div
            key={option.value}
            className={`flex items-${layout === "grid" ? "center" : "start"} p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer`}
            onClick={() => handleCheckboxChange(option.value, !value.includes(option.value))}
          >
            <Checkbox
              id={`${name}-${option.value}`}
              checked={value.includes(option.value)}
              onCheckedChange={(checked) => 
                handleCheckboxChange(option.value, checked as boolean)
              }
              className="h-4 w-4 text-primary mt-0.5"
            />
            <span className="ml-3">
              <span className="text-sm font-medium text-gray-900">
                {option.title}
              </span>
              {option.description && layout !== "grid" && (
                <span className="block text-sm text-gray-500">
                  {option.description}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckboxQuestion;
