import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-green-600 flex flex-col items-center justify-center z-[9999] text-white transition-opacity duration-500">
      <div className="text-6xl mb-4 animate-bounce">🛠️</div>
      <h1 className="text-4xl font-bold mb-2">Tasko</h1>
      <p className="text-lg mb-8">Loading your task service...</p>
      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default SplashScreen;