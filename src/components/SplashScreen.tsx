import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-green-600 flex items-center justify-center z-[9999] text-white">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 animate-pulse">Tasko</h1>
        <p className="text-xl">Loading your tasks...</p>
      </div>
    </div>
  );
};

export default SplashScreen;