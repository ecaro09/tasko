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
    <div className="fixed bottom-20 left-4 right-4 bg-white rounded-lg shadow-xl p-4 z-50 flex flex-col md:flex-row items-center gap-4 animate-slideUp md:max-w-md md:mx-auto">
      <div className="text-3xl text-[hsl(var(--primary-color))]">🛠️</div>
      <div className="flex-1 text-center md:text-left">
        <h3 className="font-semibold text-[hsl(var(--text-dark))]">Install Tasko App</h3>
        <p className="text-sm text-[hsl(var(--text-light))]">Get the full app experience with offline access</p>
      </div>
      <div className="flex gap-2 w-full md:w-auto justify-center">
        <Button onClick={onInstall} className="bg-[hsl(var(--primary-color))] text-white hover:bg-[hsl(var(--primary-color))] text-sm px-4 py-2">
          Install
        </Button>
        <Button onClick={onClose} variant="ghost" size="icon" className="text-[hsl(var(--text-light))] hover:bg-gray-100">
          <X size={20} />
        </Button>
      </div>
    </div>
  );
};

export default InstallPrompt;