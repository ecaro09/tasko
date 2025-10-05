import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from './use-auth';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  location: string;
  dueDate: string;
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  posterId: string;
  posterName: string;
  posterAvatar: string | null;
  assignedTaskerId: string | null;
  assignedTaskerName: string | null;
  assignedTaskerAvatar: string | null;
  imageUrl: string | null;
  review: {
    rating: number;
    comment: string;
    reviewerId: string;
    reviewedUserId: string;
    reviewerName: string;
  } | null;
  created_at: string;
}

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  createTask: (taskData: Omit<Task, 'id' | 'status' | 'posterName' | 'posterAvatar' | 'assignedTaskerId' | 'assignedTaskerName' | 'assignedTaskerAvatar' | 'review' | 'created_at'>) => Promise<void>;
  updateTaskStatus: (taskId: string, status: 'assigned' | 'in_progress' | 'completed' | 'cancelled', assignedTaskerId?: string, reviewData?: { rating: number; comment: string; reviewerId: string; reviewedUserId: string; }) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          profiles!posterId (first_name, last_name, avatar_url),
          assigned_tasker:profiles!assignedTaskerId (first_name, last_name, avatar_url),
          reviews (rating, comment, reviewerId, reviewedUserId, profiles!reviewerId (first_name, last_name))
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTasks: Task[] = data.map(task => ({
        ...task,
        posterName: `${task.profiles?.first_name || ''} ${task.profiles?.last_name || ''}`.trim(),
        posterAvatar: task.profiles?.avatar_url,
        assignedTaskerName: task.assigned_tasker ? `${task.assigned_tasker.first_name || ''} ${task.assigned_tasker.last_name || ''}`.trim() : null,
        assignedTaskerAvatar: task.assigned_tasker ? task.assigned_tasker.avatar_url : null,
        review: task.reviews.length > 0 ? {
          rating: task.reviews[0].rating,
          comment: task.reviews[0].comment,
          reviewerId: task.reviews[0].reviewerId,
          reviewedUserId: task.reviews[0].reviewedUserId,
          reviewerName: `${task.reviews[0].profiles?.first_name || ''} ${task.reviews[0].profiles?.last_name || ''}`.trim(),
        } : null,
      }));
      setTasks(formattedTasks);
    } catch (err: any) {
      console.error('Error fetching tasks:', err.message);
      setError(err.message);
      toast.error(`Failed to fetch tasks: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();

    const tasksChannel = supabase
      .channel('public:tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, payload => {
        console.log('Change received!', payload);
        queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Invalidate react-query cache
        fetchTasks(); // Re-fetch tasks on any change
      })
      .subscribe();

    const offersChannel = supabase
      .channel('public:offers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'offers' }, payload => {
        console.log('Offer change received!', payload);
        queryClient.invalidateQueries({ queryKey: ['offers'] }); // Invalidate react-query cache
        fetchTasks(); // Re-fetch tasks as offers can affect task status (e.g., assignment)
      })
      .subscribe();

    const reviewsChannel = supabase
      .channel('public:reviews')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, payload => {
        console.log('Review change received!', payload);
        queryClient.invalidateQueries({ queryKey: ['reviews'] }); // Invalidate react-query cache
        fetchTasks(); // Re-fetch tasks as reviews are linked to tasks
      })
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(offersChannel);
      supabase.removeChannel(reviewsChannel);
    };
  }, [fetchTasks, queryClient]);

  const createTask = async (taskData: Omit<Task, 'id' | 'status' | 'posterName' | 'posterAvatar' | 'assignedTaskerId' | 'assignedTaskerName' | 'assignedTaskerAvatar' | 'review' | 'created_at'>) => {
    if (!user) {
      toast.error("You must be logged in to create a task.");
      return;
    }
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...taskData, posterId: user.id, status: 'open' })
        .select();

      if (error) throw error;
      toast.success("Task created successfully!");
      fetchTasks(); // Re-fetch to include the new task
    } catch (err: any) {
      console.error('Error creating task:', err.message);
      toast.error(`Failed to create task: ${err.message}`);
      throw err;
    }
  };

  const updateTaskStatus = async (taskId: string, status: 'assigned' | 'in_progress' | 'completed' | 'cancelled', assignedTaskerId?: string, reviewData?: { rating: number; comment: string; reviewerId: string; reviewedUserId: string; }) => {
    if (!user) {
      toast.error("You must be logged in to update task status.");
      return;
    }
    try {
      const updatePayload: { status: 'assigned' | 'in_progress' | 'completed' | 'cancelled'; assignedTaskerId?: string | null } = { status };

      if (status === 'assigned' && assignedTaskerId) {
        updatePayload.assignedTaskerId = assignedTaskerId;
      } else if (status === 'cancelled') {
        updatePayload.assignedTaskerId = null; // Unassign tasker if cancelled
      } else if (status === 'in_progress') {
        // No additional fields needed for 'in_progress' beyond status
      } else if (status === 'completed' && reviewData) {
        // Insert review first
        const { error: reviewError } = await supabase
          .from('reviews')
          .insert({
            task_id: taskId,
            rating: reviewData.rating,
            comment: reviewData.comment,
            reviewerId: reviewData.reviewerId,
            reviewedUserId: reviewData.reviewedUserId,
          });
        if (reviewError) throw reviewError;
      }

      const { error } = await supabase
        .from('tasks')
        .update(updatePayload)
        .eq('id', taskId);

      if (error) throw error;
      toast.success(`Task status updated to ${status.replace('_', ' ')}!`);
      fetchTasks(); // Re-fetch to reflect status change
    } catch (err: any) {
      console.error('Error updating task status:', err.message);
      toast.error(`Failed to update task status: ${err.message}`);
      throw err;
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) {
      toast.error("You must be logged in to delete a task.");
      return;
    }
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      toast.success("Task cancelled successfully.");
      fetchTasks(); // Re-fetch to remove the deleted task
    } catch (err: any) {
      console.error('Error deleting task:', err.message);
      toast.error(`Failed to cancel task: ${err.message}`);
      throw err;
    }
  };

  return (
    <TaskContext.Provider value={{ tasks, loading, error, fetchTasks, createTask, updateTaskStatus, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};