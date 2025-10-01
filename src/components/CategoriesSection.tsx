import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Home, Wrench, Package, Truck, Paintbrush, Lightbulb, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { categories, getCategoryDisplayName } from '@/lib/categories'; // Import from new utility

// Map category values to Lucide icons
const categoryIcons: { [key: string]: React.ElementType } = {
  all: LayoutGrid,
  cleaning: Home,
  repairs: Wrench,
  moving: Truck,
  delivery: Package,
  painting: Paintbrush,
  assembly: Lightbulb,
  // Add other icons as needed
};

interface CategoriesSectionProps {
  activeCategory: string;
  onCategorySelect: (category: string) => void;
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({ activeCategory, onCategorySelect }) => {
  return (
    <section id="categories" className="py-12 bg-[hsl(var(--bg-light))] dark:bg-gray-800">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-[hsl(var(--primary-color))] mb-10">Explore Our Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {categories.map((category, index) => {
            const IconComponent = categoryIcons[category.value] || LayoutGrid; // Default to LayoutGrid if no specific icon
            return (
              <Card
                key={index}
                className={cn(
                  "flex flex-col items-center p-6 shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer border-[hsl(var(--border-color))] rounded-[var(--border-radius)]",
                  activeCategory === category.value ? "border-2 border-[hsl(var(--primary-color))] bg-[rgba(0,168,45,0.1)] dark:bg-gray-700" : "border border-[hsl(var(--border-color))] dark:border-gray-700"
                )}
                onClick={() => onCategorySelect(category.value)}
              >
                <CardContent className="flex flex-col items-center p-0">
                  <IconComponent size={48} className="text-[hsl(var(--primary-color))] mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-[hsl(var(--text-dark))] dark:text-gray-100">{category.displayName}</h3>
                  <p className="text-[hsl(var(--text-light))] dark:text-gray-300 text-sm">{
                    category.value === 'all' ? "Browse all available tasks." :
                    category.value === 'cleaning' ? "Sparkling clean homes, hassle-free." :
                    category.value === 'repairs' ? "Fixes, repairs, and installations." :
                    category.value === 'moving' ? "Effortless moving and junk removal." :
                    category.value === 'delivery' ? "Get anything delivered or done." :
                    category.value === 'painting' ? "Transform your space with a fresh coat." :
                    category.value === 'assembly' ? "Furniture assembly, electronics setup." :
                    category.value === 'marketing' ? "Promote your business and reach customers." :
                    "Various tasks and services."
                  }</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;