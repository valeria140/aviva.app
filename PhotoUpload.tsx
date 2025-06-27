import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Image, Folder } from "lucide-react";

interface PhotoUploadProps {
  onClose: () => void;
}

export default function PhotoUpload({ onClose }: PhotoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // In a real implementation, you would handle the file upload here
      // For now, we'll just show a success message and close
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  const handleGalleryClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = handleFileSelect;
    input.click();
  };

  const handleFilesClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = handleFileSelect;
    input.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Cambiar foto de perfil
          </h3>
          
          {selectedFile ? (
            <div className="text-center py-4">
              <p className="text-green-600 mb-4">¡Foto seleccionada!</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Procesando imagen...
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={handleGalleryClick}
                variant="outline"
                className="w-full flex items-center space-x-3 p-3 justify-start"
              >
                <Image className="text-blue-500" size={20} />
                <span className="text-gray-700 dark:text-gray-300">Seleccionar de galería</span>
              </Button>
              
              <Button
                onClick={handleFilesClick}
                variant="outline"
                className="w-full flex items-center space-x-3 p-3 justify-start"
              >
                <Folder className="text-green-500" size={20} />
                <span className="text-gray-700 dark:text-gray-300">Seleccionar archivo</span>
              </Button>
            </div>
          )}
          
          <div className="flex space-x-3 mt-6">
            <Button 
              onClick={onClose} 
              variant="outline" 
              className="flex-1"
              disabled={!!selectedFile}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
