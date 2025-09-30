import React from 'react';
import { WifiOff } from 'lucide-react';

interface OfflineIndicatorProps {
  isVisible: boolean;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-[60px] left-0 right-0 bg-orange-500 text-white text-center py-2 z-40 animate-slideDown">
      <WifiOff size={16} className="inline-block mr-2" /> You are currently offline
    </div>
  );
};

export default OfflineIndicator;