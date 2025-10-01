import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft } from 'lucide-react';

const TermsOfServicePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px]">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
          <ArrowLeft size={20} className="mr-2" /> Back
        </Button>
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center flex items-center justify-center gap-3">
          <FileText size={36} /> Terms of Service
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-12 text-center">
          Please read these terms carefully before using the Tasko platform.
        </p>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md prose dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">1. Acceptance of Terms</h2>
          <p>By accessing or using the Tasko platform, you agree to be bound by these Terms of Service and all terms incorporated by reference. If you do not agree to these Terms, you may not access or use the platform.</p>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 mt-8">2. Services Description</h2>
          <p>Tasko provides an online platform that connects individuals seeking to outsource tasks ("Clients") with individuals or businesses offering to perform such tasks ("Taskers"). Tasko does not directly provide task services and is not responsible for the performance of tasks by Taskers.</p>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 mt-8">3. User Accounts</h2>
          <p>To access certain features of the platform, you must register for an account. You agree to:</p>
          <ul>
            <li>Provide accurate, current, and complete information during the registration process.</li>
            <li>Maintain and promptly update your account information.</li>
            <li>Maintain the security of your password and accept all risks of unauthorized access to your account.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 mt-8">4. Payments and Fees</h2>
          <p>Clients agree to pay for services rendered by Taskers through the platform. Tasko may charge a service fee for facilitating these connections. All payments are processed securely, and details are outlined in our Payment Policy.</p>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 mt-8">5. User Conduct</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the platform for any illegal or unauthorized purpose.</li>
            <li>Impersonate any person or entity.</li>
            <li>Interfere with or disrupt the integrity or performance of the platform.</li>
            <li>Post false, misleading, or defamatory content.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 mt-8">6. Disclaimer of Warranties</h2>
          <p>The platform is provided "as is" and "as available" without warranties of any kind, either express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 mt-8">7. Limitation of Liability</h2>
          <p>In no event shall Tasko be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from (a) your access to or use of or inability to access or use the platform; (b) any conduct or content of any third party on the platform.</p>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 mt-8">8. Changes to Terms</h2>
          <p>Tasko reserves the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>

          <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">Last updated: October 26, 2023</p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;