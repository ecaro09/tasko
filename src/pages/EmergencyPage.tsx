import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Siren } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';

const EmergencyPage: React.FC = () => {
  const navigate = useNavigate();

  const handleEmergencyCall = () => {
    // In a real app, this would initiate a call. For web, it opens the dialer.
    window.location.href = 'tel:911';
    toast.info("Attempting to call 911. Please confirm on your device.");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px]">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
          <ArrowLeft size={20} className="mr-2" /> Back
        </Button>
        <h1 className="text-4xl font-bold text-red-600 mb-8 text-center">Emergency Help</h1>

        <Card className="shadow-lg p-8 text-center bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
          <CardHeader className="p-0 mb-6">
            <Siren size={80} className="text-red-600 mx-auto mb-4 animate-pulse" />
            <CardTitle className="text-3xl font-bold text-red-700 dark:text-red-200">In Case of Emergency</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-lg text-red-800 dark:text-red-100 mb-8">
              If you are in immediate danger or require urgent assistance, please use the button below to contact emergency services.
            </p>
            <Button
              onClick={handleEmergencyCall}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-xl px-8 py-5 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
            >
              <Siren size={24} /> Call 911 (Emergency)
            </Button>
            <p className="text-sm text-red-500 dark:text-red-300 mt-4">
              Use this feature responsibly.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmergencyPage;