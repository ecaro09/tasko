import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Home, Wrench, Package, Truck, Paintbrush, Lightbulb, LayoutGrid } from 'lucide-react'; // Added LayoutGrid
import { cn } from '@/lib/utils'; // Import cn for conditional class names

interface Category {
  name: string;
  icon: React.ElementType;
  description: string;
  value: string; // Added value for filtering
}

const categories: Category[] = [
  { name: "All Services", icon: LayoutGrid, description: "Browse all available tasks.", value: "all" }, // Added "All Services"
  { name: "Home Cleaning", icon: Home, description: "Sparkling clean homes, hassle-free.", value: "cleaning" },
  { name: "Handyman Services", icon: Wrench, description: "Fixes, repairs, and installations.", value: "repairs" }, // Changed to 'repairs' for consistency
  { name: "Moving & Hauling", icon: Truck, description: "Effortless moving and junk removal.", value: "moving" },
  { name: "Delivery & Errands", icon: Package, description: "Get anything delivered or done.", value: "delivery" },
  { name: "Painting Services", icon: Paintbrush, description: "Transform your space with a fresh coat.", value: "painting" }, // Added 'painting'
  { name: "Assembly Services", icon: Lightbulb, description: "Furniture assembly, electronics setup.", value: "assembly" },
];

interface CategoriesSectionProps {
  activeCategory: string;
  onCategorySelect: (category: string) => void;
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({ activeCategory, onCategorySelect }) => {
  return (
    <section id="categories" className="py-12 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-green-600 mb-10">Explore Our Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {categories.map((category, index) => (
            <Card
              key={index}
              className={cn(
                "flex flex-col items-center p-6 shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer",
                activeCategory === category.value ? "border-2 border-green-600 bg-green-50 dark:bg-gray-700" : "border border-gray-200 dark:border-gray-700"
              )}
              onClick={() => onCategorySelect(category.value)}
            >
              <CardContent className="flex flex-col items-center p-0">
                <category.icon size={48} className="text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">{category.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{category.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;