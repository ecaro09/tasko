import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ContactPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px] pb-[calc(var(--bottom-navigation-height)+var(--safe-area-bottom))] md:pb-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
          <ArrowLeft size={20} className="mr-2" /> Back
        </Button>
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">Contact Us</h1>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            Have questions, feedback, or need support? Reach out to us!
          </p>

          <div className="space-y-6 mb-8">
            <div className="flex items-center justify-center gap-4 text-gray-800 dark:text-gray-100">
              <Mail size={24} className="text-green-600" />
              <p className="text-xl font-medium">support@tasko.ph</p>
            </div>
            <div className="flex items-center justify-center gap-4 text-gray-800 dark:text-gray-100">
              <Phone size={24} className="text-green-600" />
              <p className="text-xl font-medium">+63 917 123 4567</p>
            </div>
            <div className="flex items-center justify-center gap-4 text-gray-800 dark:text-gray-100">
              <MapPin size={24} className="text-green-600" />
              <p className="text-xl font-medium">Makati City, Metro Manila, Philippines</p>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Our support team is available Monday to Friday, 9 AM - 5 PM (PST).
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;