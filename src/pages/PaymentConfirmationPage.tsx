import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PaymentConfirmationPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 pt-[60px] px-4">
      <Card className="w-full max-w-md text-center shadow-lg p-8">
        <CardHeader className="p-0 mb-6">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-green-600">Payment Confirmed!</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
            Thank you for your payment. Our team will verify it shortly.
          </p>
          <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-4 rounded-full">
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentConfirmationPage;