"use client";

import React, { useState } from 'react';
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { PricingSection } from "@/components/PricingSection";
import { CallToActionSection } from "@/components/CallToActionSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import { AppFooter } from "@/components/AppFooter";
import { MadeWithDyad } from "@/components/made-with-dyad";

export default function Index() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchTermChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleSearchSubmit = () => {
    console.log("Searching for:", searchTerm);
    // Implement actual search logic here
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <HeroSection
          searchTerm={searchTerm}
          onSearchTermChange={handleSearchTermChange}
          onSearchSubmit={handleSearchSubmit}
        />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />
        <CallToActionSection />
      </main>
      <AppFooter />
      <MadeWithDyad />
    </div>
  );
}