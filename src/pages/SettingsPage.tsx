import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from '@/components/ThemeToggle';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px]">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
          <ArrowLeft size={20} className="mr-2" /> Back
        </Button>
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">App Settings</h1>

        <Card className="shadow-lg p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <SettingsIcon size={24} /> General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-lg text-gray-700 dark:text-gray-300">Theme</p>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;