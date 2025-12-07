import React, { useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';

interface ImageUploadProps {
  selectedFiles: File[];
  onFilesChange: (files: File[]) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ selectedFiles, onFilesChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_IMAGES = 8;
  const MAX_SIZE_MB = 30;
  // Strict list of accepted MIME types
  const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    processFiles(files);
    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFiles = (newFiles: File[]) => {
    const validFiles: File[] = [];
    let errorMsg = '';

    newFiles.forEach(file => {
      // Check MIME type
      let isValidType = ACCEPTED_TYPES.includes(file.type);
      
      // Fallback check on extension if MIME type is missing or generic (like application/octet-stream)
      if (!isValidType) {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext && ['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
          isValidType = true;
        }
      }

      if (!isValidType) {
        errorMsg = `File ${file.name} is not supported. Accepted types: JPG, PNG, WEBP.`;
        return;
      }
      
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        errorMsg = `File ${file.name} is too large. Max size is ${MAX_SIZE_MB}MB.`;
        return;
      }
      validFiles.push(file);
    });

    if (errorMsg) {
      alert(errorMsg);
    }

    if (validFiles.length > 0) {
      const updatedFiles = [...selectedFiles, ...validFiles].slice(0, MAX_IMAGES);
      if (updatedFiles.length === MAX_IMAGES && selectedFiles.length + validFiles.length > MAX_IMAGES) {
        alert(`Maximum ${MAX_IMAGES} images allowed. Only the first ${MAX_IMAGES} were added.`);
      }
      onFilesChange(updatedFiles);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    processFiles(files);
  }, [selectedFiles, onFilesChange]);

  const removeFile = (indexToRemove: number) => {
    const updatedFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
    onFilesChange(updatedFiles);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <ImageIcon size={16} />
          <span>Reference Images (Optional)</span>
        </label>
        <span className="text-xs text-slate-500">
          {selectedFiles.length}/{MAX_IMAGES}
        </span>
      </div>
      
      {selectedFiles.length === 0 ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-indigo-200 rounded-xl p-6 hover:bg-indigo-50/50 hover:border-indigo-400 transition-all cursor-pointer flex flex-col items-center justify-center text-center group bg-white/30"
        >
          <div className="bg-indigo-100 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform text-indigo-600">
            <Upload size={20} />
          </div>
          <p className="text-sm font-medium text-slate-600">Click to upload or drag & drop</p>
          <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP up to {MAX_SIZE_MB}MB</p>
          <p className="text-xs text-slate-400">Support up to {MAX_IMAGES} images</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {selectedFiles.map((file, index) => (
            <div key={`${file.name}-${index}`} className="relative aspect-square rounded-lg overflow-hidden border border-indigo-200 bg-white group">
              <img 
                src={URL.createObjectURL(file)} 
                alt={`Reference ${index + 1}`} 
                className="w-full h-full object-cover" 
              />
              <button 
                onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-red-500 rounded-full text-white transition-colors opacity-0 group-hover:opacity-100"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          
          {selectedFiles.length < MAX_IMAGES && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center text-indigo-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
            >
              <Plus size={24} />
              <span className="text-[10px] font-medium mt-1">Add</span>
            </button>
          )}
        </div>
      )}
      
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
      />
    </div>
  );
};
