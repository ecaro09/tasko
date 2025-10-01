"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"; // Added CardFooter
import { Quote } from 'lucide-react';

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Tasko made finding help for my home repairs incredibly easy. The tasker was professional and efficient!",
      author: "Sarah M.",
      role: "Client",
    },
    {
      quote: "As a tasker, Tasko has provided me with consistent work and a flexible schedule. The platform is intuitive and reliable.",
      author: "Mark D.",
      role: "Tasker",
    },
    {
      quote: "I needed a last-minute delivery, and Tasko connected me with someone within minutes. Highly recommend!",
      author: "Jessica L.",
      role: "Client",
    },
    {
      quote: "Earning extra income has never been simpler. Tasko's payment system is secure and transparent.",
      author: "Robert P.",
      role: "Tasker",
    },
    {
      quote: "The variety of services available is impressive. I've used Tasko for cleaning, assembly, and even gardening.",
      author: "Emily R.",
      role: "Client",
    },
    {
      quote: "Tasko's support team is fantastic. They helped me resolve an issue quickly and professionally.",
      author: "David S.",
      role: "Client",
    },
  ];

  return (
    <section id="testimonials" className="py-12 bg-[hsl(var(--bg-light))] dark:bg-gray-800">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-[hsl(var(--primary-color))] mb-10">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-[var(--border-radius)] flex flex-col justify-between">
              <CardContent className="p-0 mb-4 flex-grow">
                <Quote size={32} className="text-[hsl(var(--primary-color))] mb-4 mx-auto" />
                <p className="text-[hsl(var(--text-dark))] dark:text-gray-100 text-lg italic mb-4">"{testimonial.quote}"</p>
              </CardContent>
              <CardFooter className="p-0 flex flex-col items-center">
                <p className="font-semibold text-[hsl(var(--primary-color))]">{testimonial.author}</p>
                <p className="text-sm text-[hsl(var(--text-light))] dark:text-gray-300">{testimonial.role}</p>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}