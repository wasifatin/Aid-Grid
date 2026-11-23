'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, MapPin } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
}

export default function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  className = '',
  icon,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative w-full text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 text-xs font-semibold backdrop-blur-xl ${
          isOpen
            ? 'bg-black/50 border-cyan-400 text-white shadow-lg shadow-cyan-500/20'
            : 'bg-black/30 border-white/10 text-slate-200 hover:border-cyan-500/40 hover:bg-black/40'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          {icon ? (
            <span className="text-cyan-400 shrink-0">{icon}</span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0"></span>
          )}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-cyan-400 shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-cyan-300' : ''
          }`}
        />
      </button>

      {/* Floating Animated Dropdown Menu (quick-panther-98 hover style) */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 glass-pane-chrome glass-rim p-1.5 rounded-2xl shadow-2xl border border-cyan-500/40 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`group relative w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all duration-200 flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 hover:translate-x-1.5 hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        isSelected ? 'bg-cyan-400 shadow-sm shadow-cyan-400/80' : 'bg-slate-500 group-hover:bg-cyan-400'
                      }`}
                    />
                    <div className="truncate">
                      <p className="truncate leading-tight">{option.label}</p>
                      {option.sublabel && (
                        <span className="text-[10px] text-slate-400 font-normal block truncate">
                          {option.sublabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
