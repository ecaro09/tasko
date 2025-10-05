import React, { createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
import { toast } from 'sonner';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { useTaskerProfile } from './use-tasker-profile';

export interface Task {
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
  tasks: Task[] | undefined;
  isLoading: boolean;
  error: Error | null;
  createTask: (taskData: Omit<Task, 'id' | 'status' | 'posterName' | 'posterAvatar' | 'assignedTaskerId' | 'assignedTaskerName' | 'assignedTaskerAvatar' | 'review' | 'created_at'>) => Promise<void>;
  updateTaskStatus: (taskId: string, status: 'assigned' | 'in_progress' | 'completed' | 'cancelled', assignedTaskerId?: string, reviewData?: { rating: number; comment: string; reviewerId: string; reviewedUserId: string; }) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  editTask: (taskId: string, updatedFields: Partial<Omit<Task, 'id' | 'posterId' | 'posterName' | 'posterAvatar' | 'datePosted' | 'status' | 'assignedTaskerId' | 'assignedOfferId' | 'rating' | 'review' | 'dateCompleted' | 'dateUpdated' | 'created_at' | 'dueDate'>>) => Promise<void>;
  completeTaskWithReview: (taskId: string, rating: number, review: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Query function for fetching tasks
const fetchTasksQueryFn = async (): Promise<Task[]> => {
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
  return formattedTasks;
};

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { updateTaskerRatingAndReviewCount } = useTaskerProfile();
  const queryClient = useQueryClient();

  // Use useQuery for fetching tasks
  const { data: tasks, isLoading, error: queryError, refetch } = useQuery<Task[], Error>({
    queryKey: ['tasks'],
    queryFn: fetchTasksQueryFn,
  });

  // Real-time subscriptions
  React.useEffect(() => {
    const tasksChannel = supabase
      .channel('public:tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, payload => {
        console.log('Task change received!', payload);
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        refetch();
      })
      .subscribe();

    const offersChannel = supabase
      .channel('public:offers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'offers' }, payload => {
        console.log('Offer change received!', payload);
        queryClient.invalidateQueries({ queryKey: ['offers'] });
        refetch();
      })
      .subscribe();

    const reviewsChannel = supabase
      .channel('public:reviews')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, payload => {
        console.log('Review change received!', payload);
        queryClient.invalidateQueries({ queryKey: ['reviews'] });
        refetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(offersChannel);
      supabase.removeChannel(reviewsChannel);
    };
  }, [queryClient, refetch]);

  // Mutations for task operations
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: Omit<Task, 'id' | 'status' | 'posterName' | 'posterAvatar' | 'assignedTaskerId' | 'assignedTaskerName' | 'assignedTaskerAvatar' | 'review' | 'created_at'>) => {
      if (!user) {
        throw new Error("You must be logged in to create a task.");
      }
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...taskData, posterId: user.id, status: 'open' })
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Task created successfully!");
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (err: any) => {
      console.error('Error creating task:', err.message);
      toast.error(`Failed to create task: ${err.message}`);
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ taskId, status, assignedTaskerId, reviewData }: { taskId: string; status: 'assigned' | 'in_progress' | 'completed' | 'cancelled'; assignedTaskerId?: string; reviewData?: { rating: number; comment: string; reviewerId: string; reviewedUserId: string; }; }) => {
      if (!user) {
        throw new Error("You must be logged in to update task status.");
      }
      const updatePayload: { status: 'assigned' | 'in_progress' | 'completed' | 'cancelled'; assignedTaskerId?: string | null; date_completed?: string } = { status };

      if (status === 'assigned' && assignedTaskerId) {
        updatePayload.assignedTaskerId = assignedTaskerId;
      } else if (status === 'cancelled') {
        updatePayload.assignedTaskerId = null;
      } else if (status === 'completed') {
        updatePayload.date_completed = new Date().toISOString();
        if (reviewData) {
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
      }

      const { error } = await supabase
        .from('tasks')
        .update(updatePayload)
        .eq('id', taskId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(`Task status updated to ${variables.status.replace('_', ' ')}!`);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (err: any) => {
      console.error('Error updating task status:', err.message);
      toast.error(`Failed to update task status: ${err.message}`);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      if (!user) {
        throw new Error("You must be logged in to delete a task.");
      }
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Task cancelled successfully.");
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (err: any) => {
      console.error('Error deleting task:', err.message);
      toast.error(`Failed to cancel task: ${err.message}`);
    },
  });

  const editTaskMutation = useMutation({
    mutationFn: async ({ taskId, updatedFields }: { taskId: string; updatedFields: Partial<Omit<Task, 'id' | 'posterId' | 'posterName' | 'posterAvatar' | 'datePosted' | 'status' | 'assignedTaskerId' | 'assignedOfferId' | 'rating' | 'review' | 'dateCompleted' | 'dateUpdated' | 'created_at' | 'dueDate'>> }) => {
      if (!user) {
        throw new Error("You must be logged in to edit a task.");
      }
      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          title: updatedFields.title,
          description: updatedFields.description,
          location: updatedFields.location,
          budget: updatedFields.budget,
          category: updatedFields.category,
          image_url: updatedFields.imageUrl === undefined ? null : updatedFields.imageUrl,
        })
        .eq('id', taskId)
        .eq('poster_id', user.id);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      toast.success("Task updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (err: any) => {
      console.error("Error updating task:", err);
      toast.error(`Failed to update task: ${err.message}`);
    },
  });

  const completeTaskWithReviewMutation = useMutation({
    mutationFn: async ({ taskId, rating, comment }: { taskId: string; rating: number; comment: string; }) => {
      if (!user) {
        throw new Error("You must be logged in to complete a task.");
      }

      const { data: taskData, error: fetchError } = await supabase
        .from('tasks')
        .select('poster_id, assigned_tasker_id, status')
        .eq('id', taskId)
        .single();

      if (fetchError) throw fetchError;
      if (!taskData) {
        throw new Error("Task not found.");
      }
      if (taskData.poster_id !== user.id) {
        throw new Error("You are not authorized to complete this task.");
      }
      if (!taskData.assigned_tasker_id) {
        throw new Error("This task has not been assigned to a tasker yet.");
      }

      const { data: existingReview, error: existingReviewError } = await supabase
        .from('reviews')
        .select('id')
        .eq('task_id', taskId)
        .eq('reviewerId', user.id)
        .single();

      if (existingReviewError && existingReviewError.code !== 'PGRST116') {
        throw existingReviewError;
      }

      if (!existingReview) {
        const { error: reviewError } = await supabase
          .from('reviews')
          .insert({
            task_id: taskId,
            rating: rating,
            comment: comment,
            reviewerId: user.id,
            reviewedUserId: taskData.assigned_tasker_id,
          });
        if (reviewError) throw reviewError;
      } else {
        toast.info("You have already reviewed this task.");
      }

      if (taskData.status !== 'completed') {
        const { error: updateError } = await supabase
          .from('tasks')
          .update({
            status: 'completed',
            date_completed: new Date().toISOString(),
          })
          .eq('id', taskId);
        if (updateError) throw updateError;
      }

      if (taskData.assigned_tasker_id) {
        await updateTaskerRatingAndReviewCount(taskData.assigned_tasker_id, rating);
      }
    },
    onSuccess: () => {
      toast.success("Task reviewed and finalized successfully!");
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (err: any) => {
      console.error("Error completing task with review:", err);
      toast.error(`Failed to finalize task: ${err.message}`);
    },
  });

  const value = {
    tasks,
    isLoading,
    error: queryError,
    createTask: createTaskMutation.mutateAsync,
    updateTaskStatus: updateTaskStatusMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutateAsync,
    editTask: editTaskMutation.mutateAsync,
    completeTaskWithReview: completeTaskWithReviewMutation.mutateAsync,
  };

  return (
    <TaskContext.Provider value={value}>
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