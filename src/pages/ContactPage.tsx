import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, ArrowLeft } from 'lucide-react';

const ContactPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px]">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
          <ArrowLeft size={20} className="mr-2" /> Back
        </Button>
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">Contact Us</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-12 text-center">
          We're here to help! Reach out to us through any of the methods below.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center p-6 shadow-md">
            <CardHeader className="p-0 mb-4">
              <Mail size={48} className="text-green-600 mx-auto mb-3" />
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">Email Us</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-gray-600 dark:text-gray-300">support@tasko.ph</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">We typically respond within 24 hours.</p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 shadow-md">
            <CardHeader className="p-0 mb-4">
              <Phone size={48} className="text-green-600 mx-auto mb-3" />
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">Call Us</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-gray-600 dark:text-gray-300">+63 917 123 4567</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Mon-Fri, 9 AM - 5 PM PHT</p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 shadow-md">
            <CardHeader className="p-0 mb-4">
              <MapPin size={48} className="text-green-600 mx-auto mb-3" />
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">Our Office</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-gray-600 dark:text-gray-300">123 Tasker St., Makati City,</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Metro Manila, Philippines</p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Send us a message</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            For general inquiries or support, please use the form below (coming soon!).
          </p>
          <Button disabled className="bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed">
            Contact Form (Coming Soon)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;