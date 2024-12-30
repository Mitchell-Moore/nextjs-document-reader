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
      <input
        className="flex h-10 items-center justify-between rounded-md border bg-background px-3 py-2 text-sm  placeholder:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50 w-[180px] cursor-pointer"
        type="text"
        readOnly
        value={currentValue.label}
        onFocus={() => {
          setIsOpen(true);
        }}
      />
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
