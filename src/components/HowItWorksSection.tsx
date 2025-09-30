import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Search, Handshake, CheckCircle } from 'lucide-react';

interface Step {
  icon: React.ElementType;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: Search,
    title: "1. Post Your Task",
    description: "Describe what you need done, set your budget, and post your task in minutes.",
  },
  {
    icon: Handshake,
    title: "2. Connect with Taskers",
    description: "Receive offers from qualified local taskers and choose the best fit for you.",
  },
  {
    icon: CheckCircle,
    title: "3. Get It Done",
    description: "Relax while your task is completed efficiently and to your satisfaction.",
  },
];

const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="py-12 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-green-600 mb-10">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="flex flex-col items-center p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardContent className="flex flex-col items-center p-0">
                <step.icon size={48} className="text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;