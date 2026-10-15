'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';

interface SearchableSelectProps {
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  placeholder?: string;
  searchPlaceholder?: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  disabledHint?: string;
  allowCustom?: boolean;
  className?: string;
  error?: string;
}

export default function SearchableSelect({
  label,
  required = false,
  icon,
  placeholder = 'Select an option',
  searchPlaceholder = 'Type to search...',
  options,
  value,
  onChange,
  disabled = false,
  disabledHint,
  allowCustom = false,
  className = '',
  error,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return options;
    return options.filter((opt) => opt.toLowerCase().includes(query));
  }, [options, searchTerm]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleSelect = (selectedVal: string) => {
    onChange(selectedVal);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <label className="text-xs font-bold text-white/80 uppercase tracking-wider block mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          {icon}
          {label} {required && <span className="text-rose-400">*</span>}
        </span>
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[10px] text-white/40 hover:text-white transition-colors cursor-pointer flex items-center gap-0.5"
          >
            Clear
          </button>
        )}
      </label>

      {/* Main Trigger Button */}
      <div
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        className={`w-full px-4 py-3.5 bg-[#11161D] border rounded-2xl text-sm font-semibold transition-all flex items-center justify-between gap-2 cursor-pointer ${
          disabled
            ? 'opacity-40 border-white/[0.05] cursor-not-allowed bg-[#0d1218]'
            : error
            ? 'border-rose-500/50 hover:border-rose-400 focus-within:ring-1 focus-within:ring-rose-500/30'
            : isOpen
            ? 'border-[#2DD4A0] ring-1 ring-[#2DD4A0]/30 shadow-[0_0_15px_rgba(45,212,160,0.15)]'
            : 'border-white/[0.1] hover:border-white/20'
        }`}
      >
        <span className={`truncate ${value ? 'text-white' : 'text-white/30'}`}>
          {value || (disabled ? disabledHint || placeholder : placeholder)}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-white/40 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#2DD4A0]' : ''
          }`}
        />
      </div>

      {error && <span className="text-[11px] text-rose-400 mt-1 block">{error}</span>}

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 bg-[#161C25] border border-white/[0.12] rounded-2xl shadow-2xl p-2.5 space-y-2 animate-in fade-in duration-150 backdrop-blur-xl">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-[#11161D] border border-white/[0.08] rounded-xl pl-8 pr-8 py-2 text-xs font-medium text-white placeholder-white/30 focus:outline-hidden focus:border-[#2DD4A0] focus:ring-1 focus:ring-[#2DD4A0]/20"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 custom-scrollbar pr-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.toLowerCase() === value.toLowerCase();
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#2DD4A0]/15 text-[#2DD4A0] font-bold'
                        : 'text-white/80 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <span className="truncate">{opt}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#2DD4A0] shrink-0" />}
                  </button>
                );
              })
            ) : allowCustom && searchTerm.trim() ? (
              <button
                type="button"
                onClick={() => handleSelect(searchTerm.trim())}
                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold bg-[#2DD4A0]/10 hover:bg-[#2DD4A0]/20 text-[#2DD4A0] transition-colors cursor-pointer"
              >
                Use custom &quot;{searchTerm.trim()}&quot;
              </button>
            ) : (
              <div className="px-3 py-4 text-center text-xs text-white/40">
                No matching options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
