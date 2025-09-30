import React from 'react';
import { WifiOff } from 'lucide-react';

interface OfflineIndicatorProps {
  isVisible: boolean;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-2 text-center text-sm z-[9998] flex items-center justify-center gap-2">
      <WifiOff size={18} />
      <span>You are currently offline. Some features may not be available.</span>
    </div>
  );
};

export default OfflineIndicator;