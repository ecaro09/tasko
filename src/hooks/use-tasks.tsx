import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './use-auth';
import { useTaskerProfile } from './use-tasker-profile'; // Import useTaskerProfile

export interface Task {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  budget: number;
  posterId: string;
  posterName: string;
  posterAvatar: string;
  datePosted: string;
  status: 'open' | 'assigned' | 'completed';
  imageUrl?: string;
  assignedTaskerId?: string;
  assignedOfferId?: string;
  rating?: number;
  review?: string;
  dateCompleted?: string;
  dateUpdated?: string;
}

interface UseTasksContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  addTask: (newTask: Omit<Task, 'id' | 'posterId' | 'posterName' | 'posterAvatar' | 'datePosted' | 'status' | 'assignedTaskerId' | 'assignedOfferId' | 'rating' | 'review' | 'dateCompleted' | 'dateUpdated'>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  editTask: (taskId: string, updatedFields: Partial<Omit<Task, 'id' | 'posterId' | 'posterName' | 'posterAvatar' | 'datePosted' | 'status' | 'assignedTaskerId' | 'assignedOfferId' | 'rating' | 'review' | 'dateCompleted' | 'dateUpdated'>>) => Promise<void>;
  completeTaskWithReview: (taskId: string, rating: number, review: string) => Promise<void>;
}

const TasksContext = createContext<UseTasksContextType | undefined>(undefined);

interface TasksProviderProps {
  children: ReactNode;
}

export const TasksProvider: React.FC<TasksProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { updateTaskerRating } = useTaskerProfile(); // Use the new function
  const [allTasks, setAllTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Function to seed initial tasks
  const seedInitialTasks = async () => {
    const { data: existingTasks, error: fetchError } = await supabase
      .from('tasks')
      .select('id');

    if (fetchError) {
      console.error("Error checking for existing tasks:", fetchError);
      return;
    }

    if (existingTasks && existingTasks.length === 0) {
      console.log("Database is empty, seeding initial marketing tasks...");
      const initialTasks = [
        {
          title: "Social Media Manager for Local Business",
          category: "marketing",
          description: "Looking for a Pinoy/Pinay social media expert to manage our Facebook and Instagram pages. Must be familiar with local trends and audience engagement. Experience with Canva is a plus!",
          location: "Metro Manila",
          budget: 5000,
          poster_id: "seed-user-1",
          poster_name: "Maria Santos",
          poster_avatar: "https://randomuser.me/api/portraits/women/44.jpg",
          status: "open",
          image_url: "https://images.unsplash.com/photo-1557804506-669a67965da0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        },
        {
          title: "Flyer Distribution for Sari-Sari Store",
          category: "marketing",
          description: "Need help distributing flyers for our new sari-sari store opening in Cebu. Must be reliable and know the local neighborhoods well. Target areas: Lapu-Lapu City, Mandaue City.",
          location: "Cebu City",
          budget: 1200,
          poster_id: "seed-user-2",
          poster_name: "Juan Dela Cruz",
          poster_avatar: "https://randomuser.me/api/portraits/men/32.jpg",
          status: "open",
          image_url: "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        },
        {
          title: "Online Content Creator for Pinoy Food Blog",
          category: "marketing",
          description: "Seeking a creative Pinay content creator to produce engaging short videos and articles for our Filipino food blog. Knowledge of popular Filipino dishes and food styling is a must!",
          location: "Remote (Philippines)",
          budget: 3500,
          poster_id: "seed-user-3",
          poster_name: "Aling Nena",
          poster_avatar: "https://randomuser.me/api/portraits/women/68.jpg",
          status: "open",
          image_url: "https://images.unsplash.com/photo-1504711432028-ee2611f5817a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        },
      ];

      const { error: insertError } = await supabase
        .from('tasks')
        .insert(initialTasks);

      if (insertError) {
        console.error("Error seeding initial tasks:", insertError);
        toast.error("Failed to seed initial tasks.");
      } else {
        toast.info("Initial marketing tasks added!");
      }
    }
  };

  React.useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchTasks = async () => {
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .order('date_posted', { ascending: false });

      if (fetchError) {
        console.error("Error fetching tasks:", fetchError);
        setError("Failed to fetch tasks.");
        toast.error("Failed to load tasks.");
        setLoading(false);
        return;
      }

      const fetchedTasks: Task[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        description: item.description,
        location: item.location,
        budget: item.budget,
        posterId: item.poster_id,
        posterName: item.poster_name,
        posterAvatar: item.poster_avatar || "https://randomuser.me/api/portraits/lego/1.jpg",
        datePosted: new Date(item.date_posted).toISOString().split('T')[0],
        status: item.status || 'open',
        imageUrl: item.image_url || "https://images.unsplash.com/photo-1581578731548-c646952?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        assignedTaskerId: item.assigned_tasker_id || undefined,
        assignedOfferId: item.assigned_offer_id || undefined,
        rating: item.rating || undefined,
        review: item.review || undefined,
        dateCompleted: item.date_completed ? new Date(item.date_completed).toISOString().split('T')[0] : undefined,
        dateUpdated: item.date_updated ? new Date(item.date_updated).toISOString().split('T')[0] : undefined,
      }));
      setAllTasks(fetchedTasks);
      setLoading(false);

      if (fetchedTasks.length === 0) {
        seedInitialTasks();
      }
    };

    fetchTasks();

    const subscription = supabase
      .channel('public:tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, payload => {
        console.log('Task change received!', payload);
        fetchTasks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const addTask = async (newTaskData: Omit<Task, 'id' | 'posterId' | 'posterName' | 'posterAvatar' | 'datePosted' | 'status' | 'assignedTaskerId' | 'assignedOfferId' | 'rating' | 'review' | 'dateCompleted' | 'dateUpdated'>) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to post a task.");
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from('tasks')
        .insert({
          ...newTaskData,
          poster_id: user.id,
          poster_name: user.user_metadata?.first_name && user.user_metadata?.last_name
            ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
            : user.email || "Anonymous User",
          poster_avatar: user.user_metadata?.avatar_url || "https://randomuser.me/api/portraits/lego/1.jpg",
          status: 'open',
          image_url: newTaskData.imageUrl || "https://images.unsplash.com/photo-1581578731548-c646952?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        });

      if (insertError) throw insertError;
      toast.success("Task posted successfully!");
    } catch (err: any) {
      console.error("Error adding task:", err);
      toast.error(`Failed to post task: ${err.message}`);
      throw err;
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to delete a task.");
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('poster_id', user.id);

      if (deleteError) throw deleteError;
      toast.success("Task deleted successfully!");
    } catch (err: any) {
      console.error("Error deleting task:", err);
      toast.error(`Failed to delete task: ${err.message}`);
      throw err;
    }
  };

  const editTask = async (taskId: string, updatedFields: Partial<Omit<Task, 'id' | 'posterId' | 'posterName' | 'posterAvatar' | 'datePosted' | 'status' | 'assignedTaskerId' | 'assignedOfferId' | 'rating' | 'review' | 'dateCompleted' | 'dateUpdated'>>) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to edit a task.");
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          title: updatedFields.title,
          description: updatedFields.description,
          location: updatedFields.location,
          budget: updatedFields.budget,
          category: updatedFields.category,
          image_url: updatedFields.imageUrl === undefined ? null : updatedFields.imageUrl,
          date_updated: new Date().toISOString(),
        })
        .eq('id', taskId)
        .eq('poster_id', user.id);

      if (updateError) throw updateError;
      toast.success("Task updated successfully!");
    } catch (err: any) {
      console.error("Error updating task:", err);
      toast.error(`Failed to update task: ${err.message}`);
      throw err;
    }
  };

  const completeTaskWithReview = async (taskId: string, rating: number, review: string) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to complete a task.");
      return;
    }

    try {
      const { data: taskData, error: fetchError } = await supabase
        .from('tasks')
        .select('poster_id, assigned_tasker_id')
        .eq('id', taskId)
        .single();

      if (fetchError) throw fetchError;
      if (!taskData) {
        toast.error("Task not found.");
        return;
      }
      if (taskData.poster_id !== user.id) {
        toast.error("You are not authorized to complete this task.");
        return;
      }
      if (!taskData.assigned_tasker_id) {
        toast.error("This task has not been assigned to a tasker yet.");
        return;
      }

      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          rating: rating,
          review: review,
          date_completed: new Date().toISOString(),
          date_updated: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (updateError) throw updateError;

      // Update the assigned tasker's overall rating
      if (taskData.assigned_tasker_id) {
        await updateTaskerRating(taskData.assigned_tasker_id, rating);
      }

      toast.success("Task marked as complete and review submitted!");
    } catch (err: any) {
      console.error("Error completing task:", err);
      toast.error(`Failed to complete task: ${err.message}`);
      throw err;
    }
  };

  const value = {
    tasks: allTasks,
    loading,
    error,
    addTask,
    deleteTask,
    editTask,
    completeTaskWithReview,
  };

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};