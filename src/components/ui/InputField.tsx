import React, { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface InputFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  icon?: ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  error,
  icon
}) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`block w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2 border ${
            error ? 'border-red-500' : 'border-gray-300'
          } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
        />
      </div>
      {error && (
        <div className="mt-1 flex items-center text-sm text-red-600">
          <AlertCircle size={14} className="mr-1" />
          {error}
        </div>
      )}
    </div>
  );
};

export default InputField;