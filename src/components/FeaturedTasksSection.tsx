import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, User as UserIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Task } from '@/lib/task-firestore'; // Import Task interface

interface FeaturedTasksSectionProps {
  tasks: Task[];
  loading: boolean;
  onViewTaskDetails: (taskId: string) => void;
}

const getCategoryName = (category: string) => {
  const names: { [key: string]: string } = {
    all: 'All Services',
    cleaning: 'Cleaning',
    moving: 'Moving',
    assembly: 'Assembly',
    repairs: 'Repairs',
    delivery: 'Delivery',
    mounting: 'Mounting',
    painting: 'Painting',
    marketing: 'Marketing',
    other: 'Other'
  };
  return names[category] || 'Task';
};

const FeaturedTasksSection: React.FC<FeaturedTasksSectionProps> = ({ tasks, loading, onViewTaskDetails }) => {
  return (
    <section id="featured-tasks" className="py-8">
      <h2 className="text-4xl font-bold text-[hsl(var(--primary-color))] mb-8 text-center">✨ Featured Tasks</h2>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="shadow-lg rounded-[var(--border-radius)] overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-6 w-1/3 mb-4" />
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-10 w-24 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <p className="text-center text-gray-500 italic py-8">No featured tasks available right now.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <Card key={task.id} className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-[var(--border-radius)] overflow-hidden">
              <div className="h-40 overflow-hidden relative">
                <img src={task.imageUrl} alt={task.title} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute top-2 left-2 bg-[hsl(var(--primary-color))] text-white px-3 py-1 rounded-full text-xs font-semibold">
                  {getCategoryName(task.category)}
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
                <p className="text-[hsl(var(--text-light))] flex items-center mb-2">
                  <MapPin size={16} className="mr-2" /> {task.location}
                </p>
                <p className="text-2xl font-bold text-[hsl(var(--primary-color))] mb-4">₱{task.budget.toLocaleString()}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <img src={task.posterAvatar} alt={task.posterName} className="w-8 h-8 rounded-full object-cover border-2 border-[hsl(var(--border-color))]" />
                    <span className="font-medium">{task.posterName}</span>
                  </div>
                  <Button variant="outline" onClick={() => onViewTaskDetails(task.id)} className="border-[hsl(var(--primary-color))] text-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] hover:text-white">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};

export default FeaturedTasksSection;