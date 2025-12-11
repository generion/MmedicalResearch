import React, { useRef, useState } from 'react';
import { Upload, FileType, X } from 'lucide-react';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  disabled: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndPassFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndPassFiles(Array.from(e.target.files));
    }
    // Reset input value to allow selecting the same file again if needed
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const validateAndPassFiles = (files: File[]) => {
    const validFiles = files.filter(
      (file) => file.type === 'application/pdf' || file.type.startsWith('image/')
    );
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    } else {
      alert("Lütfen sadece PDF veya resim (JPEG/PNG) dosyaları yükleyiniz.");
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ease-in-out
        ${isDragging ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-teal-400 bg-white'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        accept=".pdf,image/jpeg,image/png,image/jpg"
        multiple
        className="hidden"
        disabled={disabled}
      />
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={`p-4 rounded-full ${isDragging ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-500'}`}>
          <Upload className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">Dosyaları buraya sürükleyin</h3>
          <p className="text-sm text-gray-500 mt-1">veya seçmek için tıklayın</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="bg-gray-100 px-2 py-1 rounded">PDF</span>
          <span className="bg-gray-100 px-2 py-1 rounded">JPG</span>
          <span className="bg-gray-100 px-2 py-1 rounded">PNG</span>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;