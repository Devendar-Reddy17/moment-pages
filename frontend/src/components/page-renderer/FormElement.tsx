'use client';

import type { CanvasElement, FormElementContent } from '@/types/editor';

interface FormElementProps {
  element: CanvasElement;
  value: unknown;
  onChange: (fieldId: string, value: unknown) => void;
}

export function FormElement({ element, value, onChange }: FormElementProps) {
  const content = element.content as FormElementContent;

  const handleChange = (newValue: unknown) => {
    onChange(content.fieldId, newValue);
  };

  switch (content.fieldType) {
    case 'button-group':
      return (
        <div className="w-full h-full flex flex-col gap-1">
          {content.label && (
            <label className="text-sm font-medium text-gray-700">
              {content.label}
              {content.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          <div className="flex gap-2">
            {content.options?.map((option) => (
              <button
                key={option}
                onClick={() => handleChange(option)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
                  value === option
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      );

    case 'text-input':
      return (
        <div className="w-full h-full flex flex-col gap-1">
          {content.label && (
            <label className="text-sm font-medium text-gray-700">
              {content.label}
              {content.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          <input
            type="text"
            placeholder={content.placeholder || ''}
            value={(value as string) || ''}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      );

    case 'textarea':
      return (
        <div className="w-full h-full flex flex-col gap-1">
          {content.label && (
            <label className="text-sm font-medium text-gray-700">
              {content.label}
              {content.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          <textarea
            placeholder={content.placeholder || ''}
            value={(value as string) || ''}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
          />
        </div>
      );

    case 'date-picker':
      return (
        <div className="w-full h-full flex flex-col gap-1">
          {content.label && (
            <label className="text-sm font-medium text-gray-700">
              {content.label}
              {content.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          <input
            type="date"
            min={content.minDate}
            max={content.maxDate}
            value={(value as string) || ''}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      );

    case 'time-picker':
      return (
        <div className="w-full h-full flex flex-col gap-1">
          {content.label && (
            <label className="text-sm font-medium text-gray-700">
              {content.label}
              {content.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          <input
            type="time"
            value={(value as string) || ''}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      );

    case 'dropdown':
      return (
        <div className="w-full h-full flex flex-col gap-1">
          {content.label && (
            <label className="text-sm font-medium text-gray-700">
              {content.label}
              {content.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          <select
            value={(value as string) || ''}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">{content.placeholder || 'Select an option'}</option>
            {content.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      );

    case 'radio-group':
      return (
        <div className="w-full h-full flex flex-col gap-1">
          {content.label && (
            <label className="text-sm font-medium text-gray-700">
              {content.label}
              {content.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          <div className="flex flex-col gap-1">
            {content.options?.map((option) => (
              <label key={option} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={content.fieldId}
                  value={option}
                  checked={value === option}
                  onChange={() => handleChange(option)}
                  className="text-rose-500"
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      );

    case 'checkbox-group':
      return (
        <div className="w-full h-full flex flex-col gap-1">
          {content.label && (
            <label className="text-sm font-medium text-gray-700">
              {content.label}
              {content.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          <div className="flex flex-col gap-1">
            {content.options?.map((option) => (
              <label key={option} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const current = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      handleChange([...current, option]);
                    } else {
                      handleChange(current.filter((v: string) => v !== option));
                    }
                  }}
                  className="text-rose-500"
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      );

    case 'number-input':
      return (
        <div className="w-full h-full flex flex-col gap-1">
          {content.label && (
            <label className="text-sm font-medium text-gray-700">
              {content.label}
              {content.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          <input
            type="number"
            min={content.min}
            max={content.max}
            placeholder={content.placeholder || ''}
            value={(value as number) ?? ''}
            onChange={(e) => handleChange(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      );

    default:
      return null;
  }
}
