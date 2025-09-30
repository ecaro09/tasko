import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  { number: 1, title: "Post Your Task", description: "Describe what you need help with and set your budget" },
  { number: 2, title: "Get Offers", description: "Taskers in your area will send you offers" },
  { number: 3, title: "Choose a Tasker", description: "Review profiles and ratings, then pick the best fit" },
  { number: 4, title: "Get It Done", description: "Your task gets completed safely and efficiently" },
];

const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="bg-white py-16 my-12 rounded-lg shadow-xl">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-green-600 mb-12">📝 How Tasko Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center p-6">
              <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                {step.number}
              </div>
              <h3 className="text-2xl font-semibold mb-4">{step.title}</h3>
              <p className="text-gray-700">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;