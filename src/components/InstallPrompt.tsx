import React from 'react';
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';

interface InstallPromptProps {
  onInstall: () => void;
  onClose: () => void;
  isVisible: boolean;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ onInstall, onClose, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-white rounded-lg shadow-xl p-4 z-50 flex items-center gap-4 animate-slideUp">
      <div className="text-3xl text-green-600">🛠️</div>
      <div className="flex-1">
        <div className="font-semibold text-gray-900">Install Tasko App</div>
        <div className="text-sm text-gray-600">Get the full app experience with offline access</div>
      </div>
      <div className="flex gap-2">
        <Button onClick={onInstall} className="bg-green-600 text-white hover:bg-green-700">Install</Button>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:bg-gray-100">
          <X size={20} />
        </Button>
      </div>
    </div>
  );
};

export default InstallPrompt;