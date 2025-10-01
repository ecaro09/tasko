import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTasks } from '@/hooks/use-tasks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Tag, DollarSign, User } from 'lucide-react';
import { toast } from 'sonner';

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks, loading, error } = useTasks();
  const task = tasks.find(t => t.id === id);

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading task details...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500">Error: {error}</div>;
  }

  if (!task) {
    return <div className="container mx-auto p-4 text-center">Task not found.</div>;
  }

  const handleAcceptOffer = () => {
    toast.info("Accept offer functionality coming soon!");
    // Implement logic to accept an offer for the task
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px]">
      <div className="container mx-auto px-4">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
          &larr; Back to Tasks
        </Button>

        <Card className="shadow-lg">
          <CardHeader className="relative p-0">
            <img src={task.imageUrl} alt={task.title} className="w-full h-64 object-cover rounded-t-lg" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
              <CardTitle className="text-3xl font-bold mb-1">{task.title}</CardTitle>
              <CardDescription className="text-gray-200 flex items-center gap-2">
                <MapPin size={18} /> {task.location}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">Task Details</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">{task.description}</p>

                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p className="flex items-center gap-2"><Tag size={18} /> <strong>Category:</strong> {task.category}</p>
                  <p className="flex items-center gap-2"><Calendar size={18} /> <strong>Posted:</strong> {new Date(task.datePosted).toLocaleDateString()}</p>
                  <p className="flex items-center gap-2"><DollarSign size={18} /> <strong>Budget:</strong> ₱{task.budget.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">Posted By</h3>
                <div className="flex items-center gap-4 mb-4">
                  <img src={task.posterAvatar} alt={task.posterName} className="w-16 h-16 rounded-full object-cover border-2 border-green-500" />
                  <div>
                    <p className="font-semibold text-lg text-gray-800 dark:text-gray-100">{task.posterName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Task Poster</p>
                  </div>
                </div>
                <Button onClick={handleAcceptOffer} className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                  <User size={20} /> Make an Offer
                </Button>
              </div>
            </div>

            {/* Placeholder for offers/comments section */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Offers & Discussion</h3>
              <p className="text-gray-500 dark:text-gray-400">No offers yet. Be the first to make one!</p>
              {/* In a real app, this would be a dynamic list of offers/comments */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskDetailPage;