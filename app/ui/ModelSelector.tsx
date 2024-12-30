'use client';

import { useEffect, useRef, useState } from 'react';

export default function ModelSelector(props: {
  models: { model: string; label: string }[];
  selectedModel: { model: string; label: string };
  onSelect: (model: { model: string; label: string }) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState(props.selectedModel);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentValue(props.selectedModel);
  }, [props.selectedModel]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        role="combobox"
        aria-controls="radix-:r2:"
        aria-expanded="false"
        aria-autocomplete="none"
        dir="ltr"
        data-state="closed"
        className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm  placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 [&amp;>span]:line-clamp-1 w-[180px]"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        <span>{currentValue.label}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-chevron-down h-4 w-4 opacity-50"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6"></path>
        </svg>
      </button>
      {isOpen && (
        <div className="absolute top-full mt-1 left-0 right-0 w-full bg-white border border-gray-300 rounded-md shadow-md z-10">
          {props.models.map((model) => (
            <div
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              role="option"
              aria-selected="false"
              onClick={() => {
                props.onSelect(model);
                setIsOpen(false);
              }}
              key={model.label}
            >
              <span className="text-gray-800 text-sm">{model.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
