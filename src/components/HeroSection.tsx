"use client";

import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onSearchSubmit: () => void;
}

export function HeroSection({ searchTerm, onSearchTermChange, onSearchSubmit }: HeroSectionProps) {
  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20 md:py-32">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
          Organize Your Life, <br className="hidden md:inline"/> Achieve Your Goals
        </h1>
        <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto">
          Tasko is the ultimate task management app designed to boost your productivity and keep you on track.
        </p>
        <div className="flex justify-center items-center space-x-4">
          <Input
            type="text"
            placeholder="Search tasks..."
            className="max-w-sm w-full p-3 rounded-md text-gray-800"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
          <Button onClick={onSearchSubmit} className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-md font-semibold">
            Search
          </Button>
        </div>
        <div className="mt-12">
          <img
            src="/dashboard-screenshot.png" // Placeholder image
            alt="Tasko Dashboard Screenshot"
            className="mx-auto rounded-lg shadow-2xl border-4 border-white/20 max-w-full h-auto"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}