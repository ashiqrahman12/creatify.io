import React from 'react';
import { Zap, Star, Crown } from 'lucide-react';
import { QualityLevel } from '../types';

interface QualitySelectorProps {
  selectedQuality: QualityLevel;
  onChange: (quality: QualityLevel) => void;
}

export const QualitySelector: React.FC<QualitySelectorProps> = ({ selectedQuality, onChange }) => {
  const options: { value: QualityLevel; label: string; icon: React.ReactNode }[] = [
    { value: 'basic', label: 'Basic', icon: <Zap size={14} /> },
    { value: 'standard', label: 'Standard', icon: <Star size={14} /> },
    { value: 'hd', label: 'HD', icon: <Crown size={14} /> },
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700">Quality</label>
      <div className="grid grid-cols-3 gap-2 h-[72px]">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all h-full
              ${selectedQuality === option.value
                ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                : 'bg-white border-indigo-100 text-slate-600 hover:border-purple-300 hover:bg-purple-50'
              }
            `}
          >
            <div className="mb-1">{option.icon}</div>
            <span className="text-xs font-bold">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
