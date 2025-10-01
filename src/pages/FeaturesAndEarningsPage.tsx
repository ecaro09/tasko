import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, DollarSign, Star, Shield, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '@/components/ModalProvider'; // Import useModal

const FeaturesAndEarningsPage: React.FC = () => {
  const navigate = useNavigate();
  const { openTaskerRegistrationModal } = useModal(); // Get the new modal opener

  const features = [
    {
      icon: DollarSign,
      title: "Competitive Earnings",
      description: "Set your own rates and earn what you deserve for your skills.",
    },
    {
      icon: Star,
      title: "Flexible Schedule",
      description: "Work when you want, where you want. Be your own boss.",
    },
    {
      icon: TrendingUp,
      title: "Grow Your Business",
      description: "Access a wide customer base and expand your service offerings.",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "All payments are processed securely through the platform.",
    },
    {
      icon: CheckCircle,
      title: "Variety of Tasks",
      description: "Choose from a diverse range of tasks that match your expertise.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px]">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-green-600 mb-6 text-center">Become a Tasker with Tasko!</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-12 text-center max-w-3xl mx-auto">
          Join our growing community of skilled taskers and turn your talents into income. Enjoy flexibility, fair pay, and a steady stream of opportunities.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="shadow-lg p-6 text-center">
              <CardHeader className="p-0 mb-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon size={32} className="text-green-600 dark:text-green-200" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Ready to Start Earning?</h2>
          <Button onClick={openTaskerRegistrationModal} className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-4 rounded-full shadow-md hover:shadow-lg transition-all">
            Sign Up as a Tasker
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeaturesAndEarningsPage;