import React, { useState, useRef } from 'react';
import { Button } from '@/app/components/ui/base';
import { Upload, Camera, X } from 'lucide-react';

interface PhotoUploadFormProps {
  currentPhotoUrl?: string;
  onPhotoChange: (file: File | null) => void;
  error?: string;
}

export function PhotoUploadForm({
  currentPhotoUrl,
  onPhotoChange,
  error,
}: PhotoUploadFormProps) {
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      onPhotoChange(file);
    }
  };

  const handleRemovePhoto = () => {
    setPreview(null);
    onPhotoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Camera className="w-5 h-5 text-primary dark:text-primary-light" />
        <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">
          Fotografía
        </h3>
      </div>

      <div className="flex flex-col items-center gap-4">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-40 h-40 rounded-full object-cover border-4 border-surface dark:border-surface-dark shadow-lg"
            />
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="absolute -top-2 -right-2 p-2 bg-danger text-white rounded-full shadow-lg hover:bg-danger-dark transition-colors"
              aria-label="Eliminar foto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="w-40 h-40 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-surface dark:border-surface-dark shadow-lg">
            <Camera className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <Button
          type="button"
          variant="outline"
          onClick={handleButtonClick}
          icon={<Upload className="w-4 h-4" />}
        >
          {preview ? 'Cambiar Foto' : 'Subir Foto'}
        </Button>

        <p className="text-xs text-text-secondary dark:text-text-secondary-dark text-center">
          Formatos: JPG, PNG, GIF (máx. 5MB)
        </p>

        {error && (
          <p className="text-sm text-danger">{error}</p>
        )}
      </div>
    </div>
  );
}
