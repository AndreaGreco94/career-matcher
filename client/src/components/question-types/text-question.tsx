import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TextQuestionProps {
  label: string;
  name: string;
  placeholder?: string;
  helperText?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}

const TextQuestion: React.FC<TextQuestionProps> = ({
  label,
  name,
  placeholder,
  helperText,
  value,
  onChange,
  rows = 4,
}) => {
  return (
    <div className="mb-6">
      <Label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </Label>
      <Textarea
        id={name}
        name={name}
        rows={rows}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {helperText && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default TextQuestion;
