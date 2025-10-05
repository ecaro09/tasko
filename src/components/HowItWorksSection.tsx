import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Handshake, UserCheck, CheckCircle } from 'lucide-react';

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      icon: ClipboardList,
      title: "Post Your Task",
      description: "Describe what you need help with and set your budget.",
    },
    {
      icon: Handshake,
      title: "Get Offers",
      description: "Taskers in your area will send you offers.",
    },
    {
      icon: UserCheck,
      title: "Choose a Tasker",
      description: "Review profiles and pick the best fit.",
    },
    {
      icon: CheckCircle,
      title: "Get It Done",
      description: "Your task gets completed safely and efficiently.",
    },
  ];

  return (
    <section id="how-it-works" className="py-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg my-8">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-[hsl(var(--primary-color))] mb-10">How Tasko Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="flex flex-col items-center p-6 shadow-md rounded-[var(--border-radius)]">
              <CardHeader className="p-0 mb-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon size={32} className="text-[hsl(var(--primary-color))] dark:text-green-200" />
                </div>
                <CardTitle className="text-xl font-semibold text-[hsl(var(--text-dark))] dark:text-gray-100">{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-[hsl(var(--text-light))] dark:text-gray-300 text-sm">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;