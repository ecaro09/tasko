"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, UserCheck, DollarSign, MessageSquare, CalendarDays } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: ClipboardList,
      title: "Easy Task Posting",
      description: "Describe your task in minutes and get offers from local professionals.",
    },
    {
      icon: UserCheck,
      title: "Verified Taskers",
      description: "Connect with reliable and skilled individuals, vetted by the Tasko community.",
    },
    {
      icon: DollarSign,
      title: "Secure Payments",
      description: "All transactions are processed securely through the platform, ensuring peace of mind.",
    },
    {
      icon: MessageSquare,
      title: "Real-time Communication",
      description: "Chat directly with taskers and clients to clarify details and coordinate efficiently.",
    },
    {
      icon: CalendarDays,
      title: "Flexible Scheduling",
      description: "Set your own deadlines and work arrangements that fit your schedule.",
    },
  ];

  return (
    <section id="features" className="py-12 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-[hsl(var(--primary-color))] mb-10">Why Choose Tasko?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="flex flex-col items-center p-6 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-[var(--border-radius)]">
              <CardHeader className="p-0 mb-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon size={32} className="text-[hsl(var(--primary-color))] dark:text-green-200" />
                </div>
                <CardTitle className="text-xl font-semibold text-[hsl(var(--text-dark))] dark:text-gray-100">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-[hsl(var(--text-light))] dark:text-gray-300 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;