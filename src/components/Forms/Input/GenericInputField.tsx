import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import get from 'lodash.get';

interface InputProps {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  defaultValue?: string;
  required?: boolean;
  customOnChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  step?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string | number;
  readOnly?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
}

const GenericInputField: React.FC<InputProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  disabled = false,
  defaultValue,
  required = false,
  customOnChange,
  onChange,
  value,
  readOnly = false,
  maxLength,
  minLength,
  pattern,
}) => {
  const {
    register,
    formState: { errors },
    setValue,
    clearErrors,
  } = useFormContext();

  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const fieldError = get(errors, name);

  // Handle input change with custom validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // If there's a custom onChange handler, call it
    if (customOnChange) {
      customOnChange(e);
      return;
    }

    // If there's an onChange prop, call it
    if (onChange) {
      onChange(e);
      return;
    }

    let inputValue = e.target.value;

    // Phone number validation - only digits, max 10
    if (name === 'phoneNumber' || name === 'phone' || name === 'mobile' || name === 'phone1' || name === 'phone2') {
      inputValue = inputValue.replace(/\D/g, '');
      if (inputValue.length <= 10) {
        setValue(name, inputValue);
        clearErrors(name);
      }
      return;
    }

    // Aadhar number validation - only digits, max 12
    if (name === 'aadharCardNumber' || name === 'aadhar' || name === 'aadharCardF') {
      inputValue = inputValue.replace(/\D/g, '');
      if (inputValue.length <= 12) {
        setValue(name, inputValue);
        clearErrors(name);
      }
      return;
    }

    // PAN card validation - auto uppercase, only letters and numbers, max 10
    if (name === 'panCardNumber' || name === 'panCard') {
      inputValue = inputValue.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (inputValue.length <= 10) {
        setValue(name, inputValue);
        clearErrors(name);
      }
      return;
    }

    // Default behavior - let RHF handle it
    setValue(name, inputValue);
    clearErrors(name);
  };

  // Get the appropriate input mode based on field type
  const getInputMode = () => {
    if (name === 'phoneNumber' || name === 'phone' || name === 'mobile' || name === 'phone1' || name === 'phone2') {
      return 'numeric';
    }
    if (name === 'aadharCardNumber' || name === 'aadhar') {
      return 'numeric';
    }
    if (type === 'number') {
      return 'decimal';
    }
    return 'text';
  };

  // Get autoComplete attribute
  const getAutoComplete = () => {
    if (name === 'phoneNumber' || name === 'phone' || name === 'mobile') {
      return 'tel';
    }
    if (name === 'password') {
      return 'new-password';
    }
    if (name === 'fullname' || name === 'name') {
      return 'name';
    }
    if (name === 'email') {
      return 'email';
    }
    return 'off';
  };

  return (
    <div className="relative w-full">
      {label && (
        <label className="mb-2.5 block text-black dark:text-white">
          {label}
          <span className="text-lg font-bold text-red-600">
            &nbsp;{required && '*'}
          </span>
        </label>
      )}

      <div className="relative">
        <input
          type={inputType}
          placeholder={placeholder}
          disabled={disabled}
          defaultValue={defaultValue}
          value={value}
          readOnly={readOnly}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          inputMode={getInputMode()}
          autoComplete={getAutoComplete()}
          step={type === 'number' ? 'any' : undefined}
          className={`w-full rounded border-[1.7px] bg-transparent px-3 py-1 text-black outline-none transition ${
            fieldError ? 'border-red-500' : 'border-stroke'
          } focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${
            isPassword ? 'pr-10' : ''
          }`}
          {...register(name, {
            onChange: handleInputChange,
            // Don't use valueAsNumber for string fields
            ...(type === 'number' ? { valueAsNumber: true } : {}),
          })}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-500 hover:text-gray-700 absolute right-3 top-1/2 -translate-y-1/2 transform focus:outline-none"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {fieldError && (
        <p className="mt-1 text-sm text-red-500">
          {fieldError.message as string}
        </p>
      )}
    </div>
  );
};

export default GenericInputField;