import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';

const PaymentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("uniondigital");

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Mobile number copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px]">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
          <ArrowLeft size={20} className="mr-2" /> Back
        </Button>
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">Pay for Your Task</h1>

        <Card className="shadow-lg p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">Select Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="uniondigital">UnionDigital Bank</TabsTrigger>
                <TabsTrigger value="gcash">GCash</TabsTrigger>
              </TabsList>
              <TabsContent value="uniondigital" className="mt-6">
                <div className="space-y-4 text-center">
                  <img src="/placeholder.svg" alt="UnionDigital QR Code" className="mx-auto w-48 h-48 object-contain border rounded-lg p-2 dark:bg-gray-700" />
                  <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">Account Name: TASKO</p>
                  <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">Mobile No: +6391 **** 9188</p>
                  <Button onClick={() => handleCopy("+6391****9188")} variant="outline" className="w-full max-w-xs mx-auto border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                    Copy Mobile No
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="gcash" className="mt-6">
                <div className="space-y-4 text-center">
                  <img src="/placeholder.svg" alt="GCash QR Code" className="mx-auto w-48 h-48 object-contain border rounded-lg p-2 dark:bg-gray-700" />
                  <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">Account Name: TASKO</p>
                  <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">Mobile No: +63 992 492 ****</p>
                  <Button onClick={() => handleCopy("+63992492****")} variant="outline" className="w-full max-w-xs mx-auto border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                    Copy Mobile No
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            <Button onClick={() => navigate('/payment-confirmation')} className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-3 mt-8">
              ✅ I Have Paid
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentsPage;