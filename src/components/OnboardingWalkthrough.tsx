import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
// Removed: import logo from '@/assets/logo.svg'; // Import the logo

interface OnboardingWalkthroughProps {
  onClose: () => void;
}

const onboardingSteps = [
  {
    title: "Welcome to Tasko!",
    description: "Your go-to platform for finding reliable help and getting tasks done efficiently.",
    image: "/pwa-192x192.png", // Using the PWA icon from public folder
  },
  {
    title: "Find Skilled Taskers",
    description: "Browse through a wide range of categories and connect with verified professionals near you.",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
  },
  {
    title: "Post Your Tasks",
    description: "Need something done? Post your task, set your budget, and let taskers bid on it.",
    image: "https://images.unsplash.com/photo-1504384308090-c894fd24153e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
  },
  {
    title: "Earn Money as a Tasker",
    description: "Offer your skills, find tasks that match your expertise, and start earning on your own terms.",
    image: "https://images.unsplash.com/photo-1521737711867-ee1ab9279f17?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
  },
  {
    title: "Secure & Transparent",
    description: "Enjoy secure payments, transparent pricing, and reliable support every step of the way.",
    image: "https://images.unsplash.com/photo-1556740738-b63629034c2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
  },
];

const OnboardingWalkthrough: React.FC<OnboardingWalkthroughProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const step = onboardingSteps[currentStep];

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-2xl relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFinish}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={24} />
        </Button>
        <CardContent className="p-6 text-center">
          <img
            src={step.image}
            alt="Onboarding illustration"
            className="w-32 h-32 object-contain mx-auto mb-6" // Adjusted size for logo
          />
          <h2 className="text-3xl font-bold text-[hsl(var(--primary-color))] mb-3">{step.title}</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">{step.description}</p>
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-2 border-gray-400 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <ChevronLeft size={20} /> Previous
            </Button>
            <div className="flex space-x-2">
              {onboardingSteps.map((_, index) => (
                <span
                  key={index}
                  className={`block w-3 h-3 rounded-full ${
                    index === currentStep ? 'bg-[hsl(var(--primary-color))]' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                ></span>
              ))}
            </div>
            <Button
              onClick={handleNext}
              className="flex items-center gap-2 bg-[hsl(var(--primary-color))] text-white hover:bg-[hsl(var(--primary-color))]"
            >
              {currentStep === onboardingSteps.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={20} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingWalkthrough;