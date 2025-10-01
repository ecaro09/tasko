import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsOfServicePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px]">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
          <ArrowLeft size={20} className="mr-2" /> Back
        </Button>
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">Terms of Service</h1>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md prose dark:prose-invert max-w-none">
          <p>
            Welcome to Tasko! These Terms of Service ("Terms") govern your access to and use of the Tasko website, mobile applications, and services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms.
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By creating an account, posting a task, offering services, or otherwise using the Service, you signify your agreement to these Terms. If you do not agree to these Terms, you may not access or use the Service.
          </p>

          <h2>2. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page. Your continued use of the Service after such modifications constitutes your acceptance of the revised Terms.
          </p>

          <h2>3. User Accounts</h2>
          <ul>
            <li>You must be at least 18 years old to use the Service.</li>
            <li>You are responsible for maintaining the confidentiality of your account login information.</li>
            <li>You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.</li>
          </ul>

          <h2>4. Service Description</h2>
          <p>
            Tasko is a platform that connects individuals ("Clients") seeking assistance with various tasks with individuals or businesses ("Taskers") offering to perform those tasks. Tasko facilitates the connection but does not directly employ Taskers or guarantee the quality of their work.
          </p>

          <h2>5. Tasker Responsibilities</h2>
          <ul>
            <li>Taskers agree to perform tasks with reasonable care and skill.</li>
            <li>Taskers are independent contractors and not employees of Tasko.</li>
            <li>Taskers are responsible for their own taxes, insurance, and compliance with all applicable laws and regulations.</li>
          </ul>

          <h2>6. Client Responsibilities</h2>
          <ul>
            <li>Clients agree to provide clear and accurate descriptions of tasks.</li>
            <li>Clients agree to pay Taskers for completed tasks as per the agreed-upon budget.</li>
            <li>Clients are responsible for ensuring a safe working environment for Taskers.</li>
          </ul>

          <h2>7. Payments and Fees</h2>
          <ul>
            <li>Tasko may charge fees for its services, which will be clearly disclosed.</li>
            <li>Payments for tasks are processed securely through the platform.</li>
            <li>Tasko reserves the right to withhold or cancel payments if fraud or a violation of these Terms is suspected.</li>
          </ul>

          <h2>8. Prohibited Conduct</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any illegal or unauthorized purpose.</li>
            <li>Harass, abuse, or harm another person or group.</li>
            <li>Impersonate any person or entity.</li>
            <li>Interfere with or disrupt the Service or servers or networks connected to the Service.</li>
          </ul>

          <h2>9. Intellectual Property</h2>
          <p>
            All content on the Service, including text, graphics, logos, and software, is the property of Tasko or its licensors and is protected by intellectual property laws.
          </p>

          <h2>10. Disclaimers and Limitation of Liability</h2>
          <p>
            The Service is provided "as is" without warranties of any kind. Tasko is not liable for any damages arising from your use of the Service or from tasks performed by Taskers.
          </p>

          <h2>11. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the Philippines.
          </p>

          <h2>12. Contact Information</h2>
          <p>If you have any questions about these Terms, please contact us at support@tasko.ph.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;