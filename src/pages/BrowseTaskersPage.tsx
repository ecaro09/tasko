import React from 'react';
import { Button } from "@/components/ui/button";
import { Filter, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BrowseTaskersPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px]">
      <div className="container mx-auto px-4">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
          &larr; Back
        </Button>
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">Browse Skilled Taskers</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-12 text-center max-w-3xl mx-auto">
          Find the perfect professional for your task. Filter by skills, ratings, price, and location.
        </p>

        <div className="flex justify-center gap-4 mb-12">
          <Button variant="outline" className="flex items-center gap-2 border-gray-400 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            <Filter size={20} /> Filters (Coming Soon)
          </Button>
          <Button variant="outline" className="flex items-center gap-2 border-gray-400 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            <Search size={20} /> Search Taskers (Coming Soon)
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600 dark:text-gray-400 text-xl mb-4">
            This section is under construction!
          </p>
          <p className="text-gray-500 dark:text-gray-500">
            Soon you'll be able to browse and connect with a wide range of skilled professionals.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BrowseTaskersPage;