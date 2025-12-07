import React from 'react';
import { Download, Share2, ImageIcon, ZoomIn } from 'lucide-react';
import { GenerationResult } from '../types';

interface ImagePreviewProps {
  result: GenerationResult | null;
  isGenerating: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ result, isGenerating }) => {
  const handleDownload = () => {
    if (!result?.imageUrl) return;
    const link = document.createElement('a');
    link.href = result.imageUrl;
    link.download = `creatify-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full min-h-[500px] flex flex-col">
      <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-2 h-full flex flex-col relative overflow-hidden group">
        
        {/* Main Content Area */}
        <div className="flex-1 rounded-xl bg-slate-100/50 overflow-hidden relative flex items-center justify-center border border-indigo-50">
          
          {isGenerating ? (
             <div className="flex flex-col items-center gap-4 p-8 text-center animate-pulse">
               <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center">
                 <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
               </div>
               <div>
                 <p className="text-lg font-bold text-indigo-900">Dreaming up your image...</p>
                 <p className="text-sm text-indigo-600">This usually takes 10-20 seconds</p>
               </div>
             </div>
          ) : result ? (
            <div className="relative w-full h-full flex items-center justify-center bg-checkered">
              <img 
                src={result.imageUrl} 
                alt={result.prompt} 
                className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
            </div>
          ) : (
            <div className="text-center p-12 text-slate-400 flex flex-col items-center">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                <ImageIcon size={40} className="text-indigo-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-600 mb-2">Ready to Create</h3>
              <p className="max-w-xs mx-auto text-sm">
                Enter a prompt, adjust the settings, and watch your imagination come to life.
              </p>
            </div>
          )}
        </div>

        {/* Actions Bar - Only visible if there is a result */}
        {result && !isGenerating && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-2 py-2 bg-white/90 backdrop-blur shadow-lg rounded-full border border-indigo-100 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            <button 
              onClick={handleDownload}
              className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 hover:scale-105 transition-all shadow-md"
              title="Download Image"
            >
              <Download size={20} />
            </button>
            <button 
              className="p-3 bg-white text-slate-600 rounded-full hover:bg-slate-50 border border-slate-200 hover:scale-105 transition-all"
              title="View Fullscreen"
              onClick={() => window.open(result.imageUrl, '_blank')}
            >
              <ZoomIn size={20} />
            </button>
          </div>
        )}
      </div>
      
      {/* Generated Prompt Display */}
      {result && !isGenerating && (
        <div className="mt-4 p-4 bg-white/60 backdrop-blur rounded-xl border border-white/50 shadow-sm">
          <p className="text-xs font-bold text-indigo-500 mb-1">GENERATED FROM</p>
          <p className="text-sm text-slate-700 italic">"{result.prompt}"</p>
        </div>
      )}
    </div>
  );
};
