import React from 'react';

const FAQPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px]">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-8">Frequently Asked Questions</h1>
        <p className="text-center text-gray-600 dark:text-gray-300">
          Find answers to common questions here.
        </p>
      </div>
    </div>
  );
};

export default FAQPage;