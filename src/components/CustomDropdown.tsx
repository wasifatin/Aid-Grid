'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

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
  buttonClassName?: string;
  icon?: React.ReactNode;
}

export default function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  className = '',
  buttonClassName = '',
  icon,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Hover open/close handlers with slight debounce for smooth mouse navigation
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

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
    <div
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full text-left ${className}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          backgroundColor: isOpen ? 'rgba(14, 23, 42, 0.95)' : 'rgba(10, 16, 30, 0.92)',
        }}
        className={`w-full px-4 py-2.5 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 text-xs font-semibold backdrop-blur-xl ${
          isOpen
            ? 'border-cyan-400 text-white shadow-lg shadow-cyan-500/20'
            : 'border-cyan-500/25 text-slate-200 hover:border-cyan-400/50 hover:bg-[#0d1629]/90'
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-2.5 truncate">
          {icon ? (
            <span className="text-cyan-400 shrink-0">{icon}</span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-cyan-400/80 shadow-[0_0_8px_#00d1ff] shrink-0"></span>
          )}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-cyan-400 shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-cyan-300' : ''
          }`}
        />
      </button>

      {/* Floating Animated Dropdown Menu (Glassy semi-opaque dark obsidian glass) */}
      {isOpen && (
        <div
          className="glass-dropdown-menu absolute top-full left-0 right-0 mt-2 z-50 p-2 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200 min-w-full overflow-hidden"
          style={{
            backgroundColor: '#0a101f',
            backgroundImage: 'linear-gradient(180deg, rgba(16, 26, 48, 0.98) 0%, rgba(9, 15, 28, 0.99) 100%)',
            border: '1px solid rgba(0, 209, 255, 0.35)',
            boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.95), 0 0 25px rgba(0, 209, 255, 0.16)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
          }}
        >
          <div className="space-y-1 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
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
                  className={`group relative w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all duration-200 flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-cyan-500/15 hover:border hover:border-cyan-400/30 hover:translate-x-1.5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                        isSelected
                          ? 'bg-cyan-400 shadow-[0_0_8px_#00d1ff]'
                          : 'bg-slate-500 group-hover:bg-cyan-400 group-hover:shadow-[0_0_6px_#00d1ff]'
                      }`}
                    />
                    <div className="truncate">
                      <p className="truncate leading-tight">{option.label}</p>
                      {option.sublabel && (
                        <span className="text-[10px] text-slate-400 font-normal block truncate mt-0.5">
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
