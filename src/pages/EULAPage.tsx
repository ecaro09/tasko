import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EULAPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px]">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
          <ArrowLeft size={20} className="mr-2" /> Back
        </Button>
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">End-User License Agreement (EULA)</h1>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md prose dark:prose-invert max-w-none">
          <p>
            This End-User License Agreement ("EULA") is a legal agreement between you and Tasko Philippines.
            By installing or using the Tasko application, you are agreeing to be bound by the terms and conditions of this EULA.
          </p>

          <h2>1. Grant of License</h2>
          <p>
            Tasko Philippines grants you a revocable, non-exclusive, non-transferable, limited license to download,
            install and use the application solely for your personal, non-commercial purposes strictly in accordance
            with the terms of this Agreement.
          </p>

          <h2>2. Restrictions</h2>
          <p>You agree not to, and you will not permit others to:</p>
          <ul>
            <li>License, sell, rent, lease, assign, distribute, transmit, host, outsource, disclose or otherwise commercially exploit the application or make the application available to any third party.</li>
            <li>Modify, make derivative works of, disassemble, decrypt, reverse compile or reverse engineer any part of the application.</li>
            <li>Remove, alter or obscure any proprietary notice (including any notice of copyright or trademark) of Tasko Philippines or its affiliates, partners, suppliers or the licensors of the application.</li>
          </ul>

          <h2>3. Intellectual Property</h2>
          <p>
            The application, including without limitation all copyrights, patents, trademarks, trade secrets and other
            intellectual property rights are, and shall remain, the sole and exclusive property of Tasko Philippines.
          </p>

          <h2>4. Amendments to this Agreement</h2>
          <p>
            Tasko Philippines reserves the right, at its sole discretion, to modify or replace this Agreement at any time.
            If a revision is material we will provide at least 30 days' notice prior to any new terms taking effect.
            What constitutes a material change will be determined at our sole discretion.
          </p>

          <h2>5. Contact Information</h2>
          <p>If you have any questions about this EULA, please contact us at support@tasko.ph.</p>
        </div>
      </div>
    </div>
  );
};

export default EULAPage;