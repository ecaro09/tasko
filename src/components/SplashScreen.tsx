import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="splash-screen">
      <div className="splash-logo">🛠️</div>
      <h1 className="splash-title">Tasko</h1>
      <p>Loading your task service...</p>
      <div className="splash-loading"></div>
    </div>
  );
};

export default SplashScreen;