// import React, {useState} from 'react';
// import {Controller, useFormContext} from 'react-hook-form';
// import {DownIcon} from '../../../icons';

// interface Option {
//   value: string;
//   label: string;
// }

// interface GenericDropdownProps {
//   name: string;
//   label: string;
//   options: Option[];
//   defaultOption?: string;
//   required?: boolean;
//   onChange?: (value: string) => void;
// }

// const GenericDropdown: React.FC<GenericDropdownProps> = ({
//   name,
//   label,
//   options,
//   defaultOption = '',
//   required = false,
//   onChange: externalOnChange,
// }) => {
//   const [isOptionSelected, setIsOptionSelected] =
//     useState<boolean>(!!defaultOption);
//   const {
//     control,
//     formState: {errors},
//   } = useFormContext();

//   // Safely access error message using optional chaining
//   const errorMessage = (errors as unknown)?.[name]?.message;

//   return (
//     <Controller
//       name={name}
//       control={control}
//       render={({field: {onChange, onBlur, value, name}}) => (
//         <div className="mb-4">
//           <label className="mb-3 block text-black dark:text-white">
//             {label}
//             <span className="text-lg font-bold text-red-600">
//               {/* &nbsp;{required && '*'} */}
//             </span>
//           </label>

//           <div className="relative z-20 bg-white dark:bg-form-input">
//             <select
//               name={name}
//               value={
//                 typeof value === 'string' || typeof value === 'number'
//                   ? value
//                   : ''
//               }
//               onChange={(e) => {
//                 const selectedValue = e.target.value;
//                 setIsOptionSelected(true);
//                 onChange(selectedValue);
//                 externalOnChange?.(selectedValue);
//               }}
//               onBlur={onBlur}
//               className={`relative z-20 w-full appearance-none rounded border px-3 py-1 outline-none transition ${errorMessage ? 'border-red-500' : 'border-stroke'} dark:border-form-strokedark dark:bg-form-input ${isOptionSelected ? 'text-black dark:text-white' : ''}`}
//             >
//               <option
//                 value=""
//                 disabled
//                 className="text-body dark:text-bodydark"
//               >
//                 {defaultOption || `Select ${label}`}
//               </option>
//               {options.map((option) => (
//                 <option
//                   key={option.value}
//                   value={option.value}
//                   className="text-body dark:text-bodydark"
//                 >
//                   {option.label}
//                 </option>
//               ))}
//             </select>

//             <span className="absolute right-4 top-1/2 z-10 -translate-y-1/2">
//               <DownIcon />
//             </span>
//           </div>

//           {errorMessage && (
//             <p className="mt-1 text-sm text-red-500">{errorMessage}</p>
//           )}
//         </div>
//       )}
//     />
//   );
// };

// export default GenericDropdown;
// components/Forms/DropDown/GenericDropdownField.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronDown } from 'lucide-react';
import get from 'lodash.get';

interface DropdownOption {
  id: string;
  label: string;
  subLabel?: string;
}

interface GenericDropdownFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  options: DropdownOption[];
  disabled?: boolean;
  searchable?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

const GenericDropdown: React.FC<GenericDropdownFieldProps> = ({
  name,
  label,
  required = false,
  placeholder = 'Search or select...',
  options = [],
  disabled = false,
  searchable = true,
  value,
  onChange,
}) => {
  const {
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fieldError = get(errors, name);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (!selectedOption) {
          setSearchTerm('');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedOption]);

  // Handle selection
  const handleSelect = (option: DropdownOption) => {
    setSelectedOption(option);
    setValue(name, option.id);
    clearErrors(name);
    setSearchTerm('');
    setIsOpen(false);
    if (onChange) {
      onChange(option.id);
    }
  };

  // Get display value
  const getDisplayValue = () => {
    if (selectedOption) {
      return `${selectedOption.label} ${selectedOption.subLabel ? `(${selectedOption.subLabel})` : ''}`;
    }
    return '';
  };

  // Filter options based on search term
  const filteredOptions = searchTerm
    ? options.filter(
        (option) =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (option.subLabel &&
            option.subLabel.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : options;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {label && (
        <label className="mb-2.5 block text-black dark:text-white">
          {label}
          <span className="text-lg font-bold text-red-600">
            &nbsp;{required && '*'}
          </span>
        </label>
      )}

      <div className="relative">
        {/* Input field */}
        <div
          className={`flex w-full cursor-pointer items-center rounded border-[1.7px] bg-transparent px-3 py-1 text-black outline-none transition ${
            fieldError ? 'border-red-500' : 'border-stroke'
          } focus-within:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus-within:border-primary`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          {isOpen && searchable ? (
            <input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="flex-1 bg-transparent outline-none dark:text-white"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className={`flex-1 ${selectedOption ? 'text-black dark:text-white' : 'text-gray-400'}`}>
              {getDisplayValue() || placeholder}
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>

        {/* Dropdown options */}
        {isOpen && !disabled && (
          <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-stroke bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:border-strokedark dark:bg-boxdark">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className={`cursor-pointer px-4 py-2 transition-colors hover:bg-orange-50 dark:hover:bg-orange-900/20 ${
                    selectedOption?.id === option.id
                      ? 'bg-orange-50 dark:bg-orange-900/20'
                      : ''
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {option.label}
                  </div>
                  {option.subLabel && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {option.subLabel}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                No options found
              </div>
            )}
          </div>
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

export default GenericDropdown;