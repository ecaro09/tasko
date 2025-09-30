import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from 'lucide-react';

interface InstallPromptProps {
  isVisible: boolean;
  onInstall: () => void;
  onClose: () => void;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ isVisible, onInstall, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
      <Card className="bg-white dark:bg-gray-800 shadow-lg border-green-500 border-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold text-green-600 dark:text-green-400">
            Install Tasko App
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={20} />
          </Button>
        </CardHeader>
        <CardContent className="pt-2">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            Add Tasko to your home screen for quick access and a full app experience.
          </p>
          <Button onClick={onInstall} className="w-full bg-green-600 hover:bg-green-700 text-white">
            Install App
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstallPrompt;