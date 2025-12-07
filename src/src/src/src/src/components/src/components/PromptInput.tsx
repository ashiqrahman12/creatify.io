import React from 'react';
import { Sparkles, Type } from 'lucide-react';

interface PromptInputProps {
  prompt: string;
  setPrompt: (value: string) => void;
  isEnhancing: boolean;
  onEnhance: () => void;
}

export const PromptInput: React.FC<PromptInputProps> = ({ 
  prompt, 
  setPrompt, 
  isEnhancing, 
  onEnhance 
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Type size={16} />
          <span>Describe your vision</span>
        </label>
        <button
          onClick={onEnhance}
          disabled={isEnhancing || !prompt}
          className="text-xs flex items-center gap-1.5 text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50 transition-colors"
        >
          <Sparkles size={12} />
          {isEnhancing ? 'Enhancing...' : 'Enhance Prompt'}
        </button>
      </div>
      
      <div className="relative group">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A futuristic cityscape with flying cars at sunset, cyberpunk style, neon lights, 8k, highly detailed..."
          className="w-full min-h-[120px] p-4 rounded-xl border-2 border-indigo-100 bg-white/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 resize-y text-slate-700 placeholder:text-slate-400 text-sm leading-relaxed"
        />
        <div className="absolute bottom-3 right-3 text-xs text-slate-400 pointer-events-none">
          {prompt.length} chars
        </div>
      </div>
    </div>
  );
};
