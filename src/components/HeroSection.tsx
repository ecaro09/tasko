import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-r from-green-500 to-green-700 text-white py-20 md:py-32 overflow-hidden mt-[60px]">
      <div className="absolute inset-0 z-0 opacity-20">
        <img src="/hero-bg.jpg" alt="Background" className="w-full h-full object-cover" />
      </div>
      <div className="container mx-auto px-4 relative z-10 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 drop-shadow-lg">
          Your Everyday Tasks, Simplified.
        </h2>
        <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto drop-shadow-md">
          Connect with trusted local taskers for home services, errands, and more.
        </p>
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-20" size={20} />
          <Input
            type="text"
            placeholder="🔍 What task do you need help with? (e.g., 'house cleaning', 'furniture assembly')"
            className="w-full py-4 pl-12 pr-4 rounded-full border border-gray-300 bg-white text-gray-800 shadow-lg focus:ring-2 focus:ring-green-400"
          />
          <Button className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-2 h-auto">
            Search
          </Button>
        </div>
        <p className="mt-6 text-sm md:text-base drop-shadow-md">
          Popular: <a href="#" className="underline hover:text-green-200">Cleaning</a>, <a href="#" className="underline hover:text-green-200">Handyman</a>, <a href="#" className="underline hover:text-green-200">Moving</a>, <a href="#" className="underline hover:text-green-200">Delivery</a>
        </p>
      </div>
    </section>
  );
};

export default HeroSection;