import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="splash-screen fixed inset-0 bg-primary flex flex-col items-center justify-center z-[9999] text-white transition-opacity duration-500">
      <div className="splash-logo text-6xl mb-4">🛠️</div>
      <h1 className="splash-title text-4xl font-bold mb-4">Tasko</h1>
      <p className="text-lg">Loading your task service...</p>
      <div className="splash-loading w-10 h-10 border-3 border-solid border-white border-opacity-30 rounded-full border-t-white animate-spin mt-4"></div>
    </div>
  );
};

export default SplashScreen;