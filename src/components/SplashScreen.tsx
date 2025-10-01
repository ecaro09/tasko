import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-[hsl(var(--primary-color))] flex flex-col items-center justify-center z-[9999] text-white transition-opacity duration-500">
      <div className="text-6xl mb-4">🛠️</div>
      <h1 className="text-4xl font-bold mb-4">Tasko</h1>
      <p>Loading your task service...</p>
      <div className="w-10 h-10 border-3 border-solid border-[rgba(255,255,255,0.3)] border-t-white rounded-full animate-spin"></div>
    </div>
  );
};

export default SplashScreen;