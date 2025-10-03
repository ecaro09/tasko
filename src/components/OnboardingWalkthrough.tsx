import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingWalkthroughProps {
  onClose: () => void;
}

const onboardingSteps = [
  {
    title: "Welcome to Tasko!",
    description: "Your trusted service marketplace in the Philippines. Get things done, hassle-free!",
    image: "/placeholder.svg", // Placeholder image
  },
  {
    title: "Post Your Task",
    description: "Describe what you need help with, set your budget, and let local taskers send offers.",
    image: "/placeholder.svg", // Placeholder image
  },
  {
    title: "Find Skilled Taskers",
    description: "Browse verified profiles, compare offers, and choose the best tasker for your job.",
    image: "/placeholder.svg", // Placeholder image
  },
  {
    title: "Secure & Easy Payments",
    description: "All payments are processed securely through the app. Your funds are protected until the task is complete.",
    image: "/placeholder.svg", // Placeholder image
  },
  {
    title: "Start Earning as a Tasker",
    description: "Have skills? Offer your services, set your own rates, and earn extra income!",
    image: "/placeholder.svg", // Placeholder image
  },
];

const OnboardingWalkthrough: React.FC<OnboardingWalkthroughProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenWalkthrough = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenWalkthrough) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setIsVisible(false);
    onClose();
  };

  if (!isVisible) return null;

  const step = onboardingSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[10000] p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-2xl relative animate-slideUp">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={handleFinish}
        >
          <X size={20} />
        </Button>
        <CardContent className="p-6 text-center">
          <img src={step.image} alt="Onboarding illustration" className="w-48 h-48 object-contain mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-[hsl(var(--primary-color))] mb-3">{step.title}</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">{step.description}</p>
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={handleFinish} className="text-gray-600 dark:text-gray-400">Skip</Button>
            <Button onClick={handleNext} className="bg-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] text-white flex items-center gap-2">
              {currentStep < onboardingSteps.length - 1 ? (
                <>Next <ArrowRight size={18} /></>
              ) : (
                "Get Started!"
              )}
            </Button>
          </div>
          <div className="flex justify-center gap-2 mt-6">
            {onboardingSteps.map((_, index) => (
              <span
                key={index}
                className={cn(
                  "h-2 w-2 rounded-full",
                  index === currentStep ? "bg-[hsl(var(--primary-color))]" : "bg-gray-300 dark:bg-gray-600"
                )}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingWalkthrough;