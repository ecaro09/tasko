import React from 'react';
import { WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OfflineIndicatorProps {
  isVisible: boolean;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ isVisible }) => {
  return (
    <div
      className={cn(
        "fixed top-[60px] left-0 right-0 bg-red-500 text-white text-center py-2 z-40 transition-transform duration-300 ease-out",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      )}
    >
      <div className="flex items-center justify-center gap-2">
        <WifiOff size={18} />
        <span>You are currently offline</span>
      </div>
    </div>
  );
};

export default OfflineIndicator;