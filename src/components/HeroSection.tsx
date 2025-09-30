import React from 'react';
import { Button } from "@/components/ui/button"; // Using shadcn/ui Button

const HeroSection: React.FC = () => {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Powerful Solutions for Your Business
              </h1>
              <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                Streamline your operations, boost productivity, and achieve your goals with our innovative platform.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild>
                <a href="#">Get Started</a>
              </Button>
              <Button asChild variant="outline">
                <a href="#">Learn More</a>
              </Button>
            </div>
          </div>
          <img
            src="/placeholder.svg"
            width="550"
            height="310"
            alt="Hero"
            className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;