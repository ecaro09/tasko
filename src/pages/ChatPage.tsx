import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px]">
      <div className="container mx-auto px-4">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
          <ArrowLeft size={20} className="mr-2" /> Back
        </Button>
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">Chat & Messaging</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-12 text-center max-w-3xl mx-auto">
          Real-time communication with taskers and clients.
        </p>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
          <MessageSquare size={64} className="text-green-500 mx-auto mb-6" />
          <p className="text-gray-600 dark:text-gray-400 text-xl mb-4">
            Your conversations will appear here!
          </p>
          <p className="text-gray-500 dark:text-gray-500">
            This feature is not yet implemented.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;