"use client";

import React from 'react';

export function TestimonialsSection() {
  return (
    <section className="py-16 bg-blue-50">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-8">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <p className="italic text-gray-700 mb-4">"Tasko has transformed the way I manage my daily tasks. Highly recommended!"</p>
            <p className="font-semibold">- Jane Doe</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <p className="italic text-gray-700 mb-4">"An incredibly intuitive and powerful tool for team collaboration."</p>
            <p className="font-semibold">- John Smith</p>
          </div>
        </div>
      </div>
    </section>
  );
}