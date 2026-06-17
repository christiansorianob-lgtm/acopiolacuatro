"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";

interface Option {
  id: number;
  label: string;
  subLabel?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SearchableSelect({ options, value, onChange, placeholder = "Seleccionar...", disabled = false }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(
    (opt) => 
      opt.label.toLowerCase().includes(search.toLowerCase()) || 
      (opt.subLabel && opt.subLabel.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 flex items-center justify-between text-left transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-700'}`}
      >
        <span className={`block truncate ${!selectedOption ? 'text-slate-500' : 'text-white'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg shadow-xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-slate-800/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full bg-slate-950 border border-slate-800 rounded-md py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
          
          <ul className="max-h-60 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-sm text-slate-500 text-center">No se encontraron resultados</li>
            ) : (
              filteredOptions.map((opt) => (
                <li
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-slate-800/50 flex items-center justify-between transition-colors ${
                    value === opt.id ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-300'
                  }`}
                >
                  <div>
                    <span className="block font-medium">{opt.label}</span>
                    {opt.subLabel && <span className="block text-xs text-slate-500">{opt.subLabel}</span>}
                  </div>
                  {value === opt.id && <Check className="w-4 h-4 text-cyan-400" />}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
