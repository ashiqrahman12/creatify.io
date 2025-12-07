import React, { useState } from 'react';
import { Header } from './components/Header';
import { PromptInput } from './components/PromptInput';
import { AspectRatioSelector } from './components/AspectRatioSelector';
import { QualitySelector } from './components/QualitySelector';
import { ImageUpload } from './components/ImageUpload';
import { ImagePreview } from './components/ImagePreview';
import { AspectRatio, QualityLevel, GenerationResult } from './types';
import { generateImage, enhancePrompt } from './services/geminiService';
import { Wand2 } from 'lucide-react';

export default function App() {
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [quality, setQuality] = useState<QualityLevel>('basic');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    setError(null);
    try {
      const enhanced = await enhancePrompt(prompt);
      setPrompt(enhanced);
    } catch (err: any) {
      setError(err.message || 'Failed to enhance prompt');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && uploadedImages.length === 0) {
      setError('Please enter a prompt or upload an image.');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const imageUrl = await generateImage({
        prompt,
        aspectRatio,
        quality,
        images: uploadedImages
      });
      setResult({ imageUrl, prompt });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/50 space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  Create Your Vision
                </h2>
                
                <PromptInput 
                  prompt={prompt} 
                  setPrompt={setPrompt} 
                  isEnhancing={isEnhancing}
                  onEnhance={handleEnhancePrompt}
                />
              </div>

              <div className="border-t border-slate-200/60 pt-6">
                <ImageUpload 
                  selectedFiles={uploadedImages} 
                  onFilesChange={setUploadedImages} 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <AspectRatioSelector 
                   selectedRatio={aspectRatio} 
                   onChange={setAspectRatio} 
                 />
                 <QualitySelector 
                   selectedQuality={quality} 
                   onChange={setQuality} 
                 />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || (!prompt && uploadedImages.length === 0)}
                className={`w-full relative group overflow-hidden rounded-xl py-4 px-6 font-bold text-white shadow-lg transition-all duration-300
                  ${isGenerating || (!prompt && uploadedImages.length === 0)
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:shadow-indigo-500/30 hover:scale-[1.02]'
                  }
                `}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <div className="relative flex items-center justify-center gap-2">
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Generating Magic...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      <span>Generate Image</span>
                    </>
                  )}
                </div>
              </button>
              
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                  <p className="font-medium">Error</p>
                  <p>{error}</p>
                </div>
              )}
            </div>
            
            {/* Pro Tips */}
            <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl p-6 border border-indigo-100">
              <h3 className="font-semibold text-indigo-900 mb-2">Pro Tips</h3>
              <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4">
                <li>Use specific details about lighting (e.g., "cinematic lighting", "golden hour").</li>
                <li>Mention art styles (e.g., "cyberpunk", "oil painting", "photorealistic").</li>
                <li>Try the "Enhance Prompt" button to add creative flair automatically.</li>
                <li>Upload up to 8 images to guide the generation (image-to-image).</li>
              </ul>
            </div>

          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-7">
            <ImagePreview 
              result={result} 
              isGenerating={isGenerating} 
            />
          </div>

        </div>
      </main>
    </div>
  );
}
