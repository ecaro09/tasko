import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

interface HeroSectionProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onSearchSubmit: () => void;
  onPopularCategoryClick: (category: string) => void; // New prop
}

const HeroSection: React.FC<HeroSectionProps> = ({ searchTerm, onSearchTermChange, onSearchSubmit, onPopularCategoryClick }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  return (
    <section className="relative bg-gradient-to-r from-[hsl(var(--primary-color))] to-[#008a25] text-white py-20 md:py-32 overflow-hidden mt-[60px] rounded-b-[20px] mb-6">
      <div className="absolute inset-0 z-0 opacity-20">
        <img src="/hero-bg.jpg" alt="Background" className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="container mx-auto px-4 relative z-10 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 drop-shadow-lg">
          Your Everyday Tasks, Simplified.
        </h2>
        <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto drop-shadow-md opacity-90">
          Connect with trusted local taskers for home services, errands, and more.
        </p>
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-20" size={20} />
          <Input
            type="text"
            placeholder="🔍 What task do you need help with? (e.g., 'house cleaning', 'furniture assembly')"
            className="w-full py-4 pl-12 pr-4 rounded-full border border-gray-300 bg-white text-gray-800 shadow-lg focus:ring-2 focus:ring-[hsl(var(--primary-color))]"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button onClick={onSearchSubmit} className="absolute right-2 top-1/2 -translate-y-1/2 bg-[hsl(var(--secondary-color))] hover:bg-[#e05a00] text-white rounded-full px-6 py-2 h-auto">
            Search
          </Button>
        </div>
        <p className="mt-6 text-sm md:text-base drop-shadow-md">
          Popular:{" "}
          <a href="#" onClick={() => onPopularCategoryClick('cleaning')} className="underline hover:text-green-200">Cleaning</a>,{" "}
          <a href="#" onClick={() => onPopularCategoryClick('repairs')} className="underline hover:text-green-200">Handyman</a>,{" "}
          <a href="#" onClick={() => onPopularCategoryClick('moving')} className="underline hover:text-green-200">Moving</a>,{" "}
          <a href="#" onClick={() => onPopularCategoryClick('delivery')} className="underline hover:text-green-200">Delivery</a>
        </p>
      </div>
    </section>
  );
};

export default HeroSection;