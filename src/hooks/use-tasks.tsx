import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './use-auth';
import { useTaskerProfile } from './use-tasker-profile';
import { useSupabaseProfile } from './use-supabase-profile';
import { DEFAULT_TASK_IMAGE_URL, DEFAULT_AVATAR_URL } from '@/utils/image-placeholders';

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
  status: 'open' | 'assigned' | 'completed' | 'cancelled'; // Added 'cancelled' status
  imageUrl?: string | null;
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
  cancelTask: (taskId: string) => Promise<void>; // New function
}

const TasksContext = createContext<UseTasksContextType | undefined>(undefined);

interface TasksProviderProps {
  children: ReactNode;
}

export const TasksProvider: React.FC<TasksProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { profile: currentUserProfile } = useSupabaseProfile();
  const { updateTaskerRating } = useTaskerProfile();
  const { fetchProfile: fetchSupabaseProfile } = useSupabaseProfile();
  const [allTasks, setAllTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Memoized function to fetch tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .order('date_posted', { ascending: false });

      if (fetchError) {
        console.error("Error fetching tasks:", fetchError);
        setError("Failed to fetch tasks.");
        toast.error("Failed to load tasks.");
        return;
      }

      // Fetch all unique poster profiles to avoid N+1 queries
      const uniquePosterIds = Array.from(new Set(data.map(item => item.poster_id)));
      const posterProfiles = await Promise.all(
        uniquePosterIds.map(id => fetchSupabaseProfile(id))
      );
      const posterProfileMap = new Map(posterProfiles.filter(p => p).map(p => [p!.id, p!]));

      const fetchedTasks: Task[] = data.map((item: any) => {
        const posterProfile = posterProfileMap.get(item.poster_id);
        const posterAvatar = posterProfile?.avatar_url || DEFAULT_AVATAR_URL;
        const posterName = posterProfile?.first_name && posterProfile?.last_name
          ? `${posterProfile.first_name} ${posterProfile.last_name}`
          : item.poster_name || "Anonymous User"; // Fallback to stored name if profile not found

        return {
          id: item.id,
          title: item.title,
          category: item.category,
          description: item.description,
          location: item.location,
          budget: item.budget,
          posterId: item.poster_id,
          posterName: posterName,
          posterAvatar: posterAvatar,
          datePosted: new Date(item.date_posted).toISOString().split('T')[0],
          status: item.status || 'open',
          imageUrl: item.image_url || DEFAULT_TASK_IMAGE_URL,
          assignedTaskerId: item.assigned_tasker_id || undefined,
          assignedOfferId: item.assigned_offer_id || undefined,
          rating: item.rating || undefined,
          review: item.review || undefined,
          dateCompleted: item.date_completed ? new Date(item.date_completed).toISOString().split('T')[0] : undefined,
          dateUpdated: item.date_updated ? new Date(item.date_updated).toISOString().split('T')[0] : undefined,
        };
      });
      setAllTasks(fetchedTasks);

      // Only seed if no tasks were fetched initially
      if (fetchedTasks.length === 0) {
        // Call seed function, which is also memoized
        // The seed function will call fetchTasks again after seeding
        // to update the state, so no need to set loading/error here.
      }

    } catch (err: any) {
      console.error("Error in fetchTasks:", err);
      setError(`Failed to load tasks: ${err.message}`);
      toast.error(`Failed to load tasks: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [fetchSupabaseProfile]); // Dependencies for useCallback

  // Memoized function to seed initial tasks
  const seedInitialTasks = useCallback(async () => {
    const { data: existingTasks, error: fetchError } = await supabase
      .from('tasks')
      .select('id');

    if (fetchError) {
      console.error("Error checking for existing tasks for seeding:", fetchError);
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
        // After seeding, re-fetch tasks to display them
        await fetchTasks(); // This will trigger a re-fetch
      }
    }
  }, [fetchTasks]); // seedInitialTasks depends on fetchTasks

  React.useEffect(() => {
    fetchTasks(); // Initial fetch

    // Call seed function after initial fetch, but only if no tasks were found
    // This ensures seeding happens only once and only if the table is empty
    const checkAndSeed = async () => {
      const { data: existingTasks } = await supabase.from('tasks').select('id');
      if (existingTasks && existingTasks.length === 0) {
        await seedInitialTasks();
      }
    };
    checkAndSeed();

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
  }, [fetchTasks, seedInitialTasks]); // Now depends on memoized fetchTasks and seedInitialTasks

  const addTask = useCallback(async (newTaskData: Omit<Task, 'id' | 'posterId' | 'posterName' | 'posterAvatar' | 'datePosted' | 'status' | 'assignedTaskerId' | 'assignedOfferId' | 'rating' | 'review' | 'dateCompleted' | 'dateUpdated'>) => {
    if (!isAuthenticated || !user || !currentUserProfile) {
      toast.error("You must be logged in to post a task.");
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from('tasks')
        .insert({
          ...newTaskData,
          poster_id: user.id,
          poster_name: currentUserProfile.first_name && currentUserProfile.last_name
            ? `${currentUserProfile.first_name} ${currentUserProfile.last_name}`
            : user.email || "Anonymous User",
          poster_avatar: currentUserProfile.avatar_url || DEFAULT_AVATAR_URL,
          status: 'open',
          image_url: newTaskData.imageUrl || DEFAULT_TASK_IMAGE_URL,
        });

      if (insertError) throw insertError;
      toast.success("Task posted successfully!");
    } catch (err: any) {
      console.error("Error adding task:", err);
      toast.error(`Failed to post task: ${err.message}`);
      throw err;
    }
  }, [isAuthenticated, user, currentUserProfile]);

  const deleteTask = useCallback(async (taskId: string) => {
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
  }, [isAuthenticated, user]);

  const editTask = useCallback(async (taskId: string, updatedFields: Partial<Omit<Task, 'id' | 'posterId' | 'posterName' | 'posterAvatar' | 'datePosted' | 'status' | 'assignedTaskerId' | 'assignedOfferId' | 'rating' | 'review' | 'dateCompleted' | 'dateUpdated'>>) => {
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
  }, [isAuthenticated, user]);

  const completeTaskWithReview = useCallback(async (taskId: string, rating: number, review: string) => {
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
  }, [isAuthenticated, user, updateTaskerRating]);

  const cancelTask = useCallback(async (taskId: string) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to cancel a task.");
      return;
    }

    try {
      const { data: taskData, error: fetchError } = await supabase
        .from('tasks')
        .select('poster_id, status')
        .eq('id', taskId)
        .single();

      if (fetchError) throw fetchError;
      if (!taskData) {
        toast.error("Task not found.");
        return;
      }
      if (taskData.poster_id !== user.id) {
        toast.error("You are not authorized to cancel this task.");
        return;
      }
      if (taskData.status === 'completed' || taskData.status === 'cancelled') {
        toast.info("This task is already completed or cancelled.");
        return;
      }

      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          status: 'cancelled',
          date_updated: new Date().toISOString(),
          assigned_tasker_id: null, // Clear assigned tasker if cancelled
          assigned_offer_id: null, // Clear assigned offer if cancelled
        })
        .eq('id', taskId);

      if (updateError) throw updateError;
      toast.success("Task cancelled successfully!");
    } catch (err: any) {
      console.error("Error cancelling task:", err);
      toast.error(`Failed to cancel task: ${err.message}`);
      throw err;
    }
  }, [isAuthenticated, user]);

  const value = React.useMemo(() => ({
    tasks: allTasks,
    loading,
    error,
    addTask,
    deleteTask,
    editTask,
    completeTaskWithReview,
    cancelTask, // Added new function
  }), [
    allTasks,
    loading,
    error,
    addTask,
    deleteTask,
    editTask,
    completeTaskWithReview,
    cancelTask,
  ]);

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};