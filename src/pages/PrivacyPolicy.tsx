"use client";

import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="container mx-auto p-4 max-w-3xl font-sans text-gray-800 dark:text-gray-200">
      <h1 className="text-4xl font-bold mb-4 text-center">Privacy Policy for DYAD</h1>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-8"><em>Last updated: October 1, 2025</em></p>

      <p className="mb-4 leading-relaxed">
        DYAD (“we,” “our,” or “us”) values your privacy. This Privacy Policy explains how we
        collect, use, and protect your information when you use our mobile and web applications.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">1. Information We Collect</h2>
      <ul className="list-disc list-inside space-y-2 mb-4">
        <li><strong>Personal Information:</strong> Name, email, and phone number if you provide them.</li>
        <li><strong>Usage Data:</strong> App interactions, device info, and logs.</li>
        <li><strong>Optional Data:</strong> Content you upload or share in DYAD.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-3">2. How We Use Information</h2>
      <ul className="list-disc list-inside space-y-2 mb-4">
        <li>To provide and improve DYAD services.</li>
        <li>To connect users with app features and communities.</li>
        <li>To send important updates, confirmations, and notifications.</li>
        <li>To comply with legal requirements.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-3">3. Sharing of Information</h2>
      <p className="mb-4 leading-relaxed">
        We do not sell your data. We may share limited information only with trusted
        service providers (hosting, analytics) or when legally required.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">4. Data Retention & Security</h2>
      <p className="mb-4 leading-relaxed">
        We retain your information only as long as necessary and protect it using
        industry-standard security measures.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">5. Children’s Privacy</h2>
      <p className="mb-4 leading-relaxed">
        DYAD is <strong className="font-bold">not intended for children under 13</strong>. We do not knowingly
        collect data from children.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">6. Your Rights</h2>
      <p className="mb-4 leading-relaxed">
        You may request access, correction, or deletion of your data by contacting us at{" "}
        <a href="mailto:your-email@example.com" className="text-blue-600 hover:underline dark:text-blue-400">your-email@example.com</a>.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">7. Changes to This Policy</h2>
      <p className="mb-4 leading-relaxed">
        We may update this Privacy Policy from time to time. Updates will be posted here
        and inside the app.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">8. Contact Us</h2>
      <p className="mb-4 leading-relaxed">
        If you have any questions, please contact us at{" "}
        <a href="mailto:your-email@example.com" className="text-blue-600 hover:underline dark:text-blue-400">your-email@example.com</a>.
      </p>
    </div>
  );
}

export default PrivacyPolicy;