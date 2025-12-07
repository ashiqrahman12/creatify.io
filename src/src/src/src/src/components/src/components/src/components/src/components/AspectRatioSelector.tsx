import React from 'react';
import { Monitor, Smartphone, Square } from 'lucide-react';
import { AspectRatio } from '../types';

interface AspectRatioSelectorProps {
  selectedRatio: AspectRatio;
  onChange: (ratio: AspectRatio) => void;
}

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ selectedRatio, onChange }) => {
  const ratios: { value: AspectRatio; label: string; icon: React.ReactNode; desc: string }[] = [
    { value: '1:1', label: 'Square', icon: <Square size={16} />, desc: '1024x1024' },
    { value: '3:4', label: 'Portrait', icon: <Smartphone size={16} />, desc: '768x1024' },
    { value: '16:9', label: 'Landscape', icon: <Monitor size={16} />, desc: '1792x1024' },
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700">Aspect Ratio</label>
      <div className="grid grid-cols-3 gap-2">
        {ratios.map((ratio) => (
          <button
            key={ratio.value}
            onClick={() => onChange(ratio.value)}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200
              ${selectedRatio === ratio.value
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105'
                : 'bg-white border-indigo-100 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50'
              }
            `}
          >
            <div className="mb-1">{ratio.icon}</div>
            <span className="text-xs font-bold">{ratio.label}</span>
            <span className={`text-[10px] ${selectedRatio === ratio.value ? 'text-indigo-200' : 'text-slate-400'}`}>
              {ratio.value}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
