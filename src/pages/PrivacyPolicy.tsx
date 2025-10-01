"use client";

import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="container mx-auto p-4 max-w-3xl font-sans text-gray-800 dark:text-gray-200">
      <h1 className="text-4xl font-bold mb-4 text-center">Privacy Policy for DYAD</h1>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-8"><em>Last updated: October 1, 2025</em></p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">1. Information We Collect</h2>
      <ul className="list-disc list-inside space-y-2 mb-4">
        <li>Personal Information (name, email, phone)</li>
        <li>Usage Data (logs, interactions, device info)</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-3">2. How We Use Information</h2>
      <p className="mb-4 leading-relaxed">We use data to provide services, improve DYAD, and send updates.</p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">3. Contact Us</h2>
      <p className="mb-4 leading-relaxed">If you have any questions, email us at <a href="mailto:your-email@example.com" className="text-blue-600 hover:underline dark:text-blue-400">your-email@example.com</a>.</p>
    </div>
  );
}

export default PrivacyPolicy;