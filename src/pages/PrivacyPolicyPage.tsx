import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowLeft } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px]">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
          <ArrowLeft size={20} className="mr-2" /> Back
        </Button>
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center flex items-center justify-center gap-3">
          <ShieldCheck size={36} /> Privacy Policy
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-12 text-center">
          Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
        </p>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md prose dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">1. Information We Collect</h2>
          <p>We collect information to provide better services to all our users. This includes:</p>
          <ul>
            <li><strong>Personal Identification Information:</strong> Name, email address, phone number, profile picture, and payment information when you register or use our services.</li>
            <li><strong>Location Information:</strong> To connect you with local taskers and tasks.</li>
            <li><strong>Usage Data:</strong> Information on how you use the app, tasks you post or accept, and interactions with other users.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 mt-8">2. How We Use Your Information</h2>
          <p>We use the information we collect for purposes such as:</p>
          <ul>
            <li>Providing, maintaining, and improving our services.</li>
            <li>Personalizing your experience (e.g., showing relevant tasks or taskers).</li>
            <li>Processing transactions and sending related notifications.</li>
            <li>Communicating with you about updates, security alerts, and support messages.</li>
            <li>Detecting, preventing, and addressing technical issues or fraudulent activities.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 mt-8">3. Sharing Your Information</h2>
          <p>We do not share your personal information with companies, organizations, or individuals outside of Tasko except in the following cases:</p>
          <ul>
            <li><strong>With Your Consent:</strong> We will share personal information with companies, organizations, or individuals outside of Tasko when we have your consent to do so.</li>
            <li><strong>For External Processing:</strong> We provide personal information to our affiliates or other trusted businesses or persons to process it for us, based on our instructions and in compliance with our Privacy Policy and any other appropriate confidentiality and security measures.</li>
            <li><strong>For Legal Reasons:</strong> We will share personal information outside of Tasko if we have a good-faith belief that access, use, preservation, or disclosure of the information is reasonably necessary to meet any applicable law, regulation, legal process, or enforceable governmental request.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 mt-8">4. Security</h2>
          <p>We work hard to protect Tasko and our users from unauthorized access to or unauthorized alteration, disclosure, or destruction of information we hold. We implement various security measures, including encryption and physical security measures, to guard against unauthorized access to systems where we store personal data.</p>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 mt-8">5. Changes to This Privacy Policy</h2>
          <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>

          <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">Last updated: October 26, 2023</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;