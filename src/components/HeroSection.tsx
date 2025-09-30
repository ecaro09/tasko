import React from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const HeroSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-br from-green-600 to-green-800 text-white py-16 text-center rounded-b-3xl mb-8">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-bold mb-4">🇵🇭 Tasko Philippines</h1>
        <p className="text-xl mb-8 opacity-90">Your Trusted Task Service - From Cleaning to Repairs, We've Got You Covered!</p>
        
        <div className="max-w-2xl mx-auto relative">
          <Input
            type="text"
            placeholder="🔍 What task do you need help with? (e.g., 'house cleaning', 'furniture assembly')"
            className="w-full py-4 pl-12 pr-4 rounded-full border-none text-gray-800 shadow-lg focus:ring-2 focus:ring-green-400"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <Button className="absolute right-1 top-1/2 -translate-y-1/2 bg-orange-500 text-white rounded-full px-6 py-2 font-semibold hover:bg-orange-600">
            Find Help
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;