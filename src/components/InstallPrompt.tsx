import React from 'react';
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';

interface InstallPromptProps {
  isVisible: boolean;
  onInstall: () => void;
  onClose: () => void;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ isVisible, onInstall, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-white rounded-lg shadow-xl p-4 z-50 flex items-center gap-4 animate-slideUp md:max-w-md md:mx-auto">
      <div className="text-3xl text-green-600">🛠️</div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-800">Install Tasko App</h3>
        <p className="text-sm text-gray-600">Get the full app experience with offline access</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onInstall} className="bg-green-600 text-white hover:bg-green-700 text-sm px-4 py-2">
          Install
        </Button>
        <Button onClick={onClose} variant="ghost" size="icon" className="text-gray-500 hover:bg-gray-100">
          <X size={20} />
        </Button>
      </div>
    </div>
  );
};

export default InstallPrompt;