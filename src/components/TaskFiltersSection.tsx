import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter } from 'lucide-react';

interface TaskFiltersSectionProps {
  minBudget: string;
  setMinBudget: (value: string) => void;
  maxBudget: string;
  setMaxBudget: (value: string) => void;
  filterLocation: string;
  setFilterLocation: (value: string) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

const TaskFiltersSection: React.FC<TaskFiltersSectionProps> = ({
  minBudget,
  setMinBudget,
  maxBudget,
  setMaxBudget,
  filterLocation,
  setFilterLocation,
  onApplyFilters,
  onResetFilters,
}) => {
  return (
    <section className="py-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg my-8 p-6">
      <h2 className="text-2xl font-bold text-[hsl(var(--primary-color))] mb-6">Refine Your Search</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label htmlFor="filterLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
          <Input
            id="filterLocation"
            type="text"
            placeholder="e.g., 'Makati City'"
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor="minBudget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Budget (₱)</label>
          <Input
            id="minBudget"
            type="number"
            placeholder="e.g., 500"
            value={minBudget}
            onChange={(e) => setMinBudget(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor="maxBudget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Budget (₱)</label>
          <Input
            id="maxBudget"
            type="number"
            placeholder="e.g., 2000"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button onClick={onResetFilters} variant="outline" className="border-gray-400 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
          Reset Filters
        </Button>
        <Button onClick={onApplyFilters} className="bg-[hsl(var(--primary-color))] text-white hover:bg-[hsl(var(--primary-color))]">
          Apply Filters
        </Button>
      </div>
    </section>
  );
};

export default TaskFiltersSection;