'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { createTask } from '@/lib/data';
import { getEnhancedTaskSuggestions } from '@/ai/flows/enhanced-suggestions';
import type { Location, TaskStatus } from '@/lib/types'; // Import specific types

const categories = [
  'Cleaning', 'Repairs', 'Errands', 'Deliveries', 'Carpentry',
  'Plumbing', 'Electrical', 'IT Support', 'Home Improvement',
  'Gardening', 'Moving', 'Event Planning', 'Pet Care', 'Personal Care', 'Other'
] as const;

type TaskCategory = typeof categories[number];

const taskFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.enum(categories, {
    errorMap: (issue, ctx) => {
      if (issue.code === z.ZodIssueCode.invalid_enum_value) {
        return { message: 'Please select a valid category' };
      }
      return { message: 'Please select a category' };
    },
  }),
  price: z.number().min(50, 'Price must be at least ₱50'),
  location: z.object({
    barangay: z.string().min(1, 'Barangay is required'),
    city: z.string().min(1, 'City is required'),
    province: z.string().min(1, 'Province is required'),
  }),
  scheduleDate: z.string().min(1, 'Schedule date is required'),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

// Define the exact type expected by createTask
type CreateTaskPayload = {
  title: string;
  description: string;
  category: TaskCategory;
  price: number;
  location: Location;
  scheduleDate: Date;
  clientId: string;
  status: TaskStatus;
  serviceFee: number;
  paymentMethod: string;
};


export default function EnhancedCreateTaskForm() {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [selectedCategories, setSelectedCategories] = useState<TaskCategory[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      price: 0,
      location: {
        barangay: '',
        city: '',
        province: '',
      },
      category: 'Other',
    },
  });

  const watchTitle = watch('title');
  const watchDescription = watch('description');

  useEffect(() => {
    const analyzeTask = async () => {
      if (watchTitle?.length >= 5 && watchDescription?.length >= 20) {
        setIsAnalyzing(true);
        try {
          const suggestions = await getEnhancedTaskSuggestions({
            taskTitle: watchTitle,
            taskDescription: watchDescription,
          });
          setAiSuggestions(suggestions);
          
          if (suggestions.suggestedCategories.length > 0) {
            const validCategory = categories.find(cat => cat === suggestions.suggestedCategories[0]);
            if (validCategory) {
              setSelectedCategories([validCategory]);
              setValue('category', validCategory);
            }
          }
          if (suggestions.suggestedPrice > 0) {
            setValue('price', suggestions.suggestedPrice);
          }
        } catch (error) {
          console.error('AI analysis failed:', error);
        } finally {
          setIsAnalyzing(false);
        }
      }
    };

    const timeoutId = setTimeout(analyzeTask, 1000);
    return () => clearTimeout(timeoutId);
  }, [watchTitle, watchDescription, setValue]);

  const onSubmit = async (data: TaskFormData) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please log in to create a task.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const taskDataForCreation: CreateTaskPayload = {
        title: data.title,
        description: data.description,
        category: data.category,
        price: data.price,
        location: data.location,
        scheduleDate: new Date(data.scheduleDate),
        clientId: user.uid,
        status: 'posted',
        serviceFee: 50,
        paymentMethod: 'gcash',
      };

      const result = await createTask(taskDataForCreation);
      
      if (result.success) {
        toast({
          title: 'Task Created!',
          description: 'Your task has been posted successfully.',
        });
        // window.location.href = '/dashboard';
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Creating Task',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Task Details
            {isAnalyzing && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Task Title *
              </label>
              <Input
                id="title"
                {...register('title')}
                placeholder="e.g., Need help cleaning my apartment"
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-destructive text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description *
              </label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe the task in detail..."
                rows={4}
                className={errors.description ? 'border-destructive' : ''}
              />
              {errors.description && (
                <p className="text-destructive text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Category *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    type="button"
                    variant={selectedCategories.includes(category) ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedCategories([category]);
                      setValue('category', category);
                    }}
                    className="h-auto py-2 text-xs"
                  >
                    {category}
                  </Button>
                ))}
              </div>
              {errors.category && (
                <p className="text-destructive text-sm mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-1">
                Price (PHP) *
              </label>
              <Input
                id="price"
                type="number"
                {...register('price', { valueAsNumber: true })}
                className={errors.price ? 'border-destructive' : ''}
              />
              {errors.price && (
                <p className="text-destructive text-sm mt-1">{errors.price.message}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="barangay" className="block text-sm font-medium mb-1">
                  Barangay *
                </label>
                <Input
                  id="barangay"
                  {...register('location.barangay')}
                  className={errors.location?.barangay ? 'border-destructive' : ''}
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium mb-1">
                  City *
                </label>
                <Input
                  id="city"
                  {...register('location.city')}
                  className={errors.location?.city ? 'border-destructive' : ''}
                />
              </div>
              <div>
                <label htmlFor="province" className="block text-sm font-medium mb-1">
                  Province *
                </label>
                <Input
                  id="province"
                  {...register('location.province')}
                  className={errors.location?.province ? 'border-destructive' : ''}
                />
              </div>
            </div>

            <div>
              <label htmlFor="scheduleDate" className="block text-sm font-medium mb-1">
                Schedule Date *
              </label>
              <Input
                id="scheduleDate"
                type="date"
                {...register('scheduleDate')}
                className={errors.scheduleDate ? 'border-destructive' : ''}
              />
              {errors.scheduleDate && (
                <p className="text-destructive text-sm mt-1">{errors.scheduleDate.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? 'Creating Task...' : 'Post Task'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {aiSuggestions ? (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Suggested Categories</h4>
                <div className="flex flex-wrap gap-1">
                  {aiSuggestions.suggestedCategories.map((cat: string, index: number) => (
                    <Badge
                      key={cat}
                      variant={index === 0 ? 'default' : 'secondary'}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Suggested Price</h4>
                  <p className="text-2xl font-bold text-primary">
                    ₱{aiSuggestions.suggestedPrice.toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Difficulty</h4>
                  <Badge
                    variant={
                      aiSuggestions.difficulty === 'easy' ? 'default' :
                      aiSuggestions.difficulty === 'medium' ? 'secondary' : 'destructive'
                    }
                  >
                    {aiSuggestions.difficulty}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-1">Estimated Time</h4>
                <p>{aiSuggestions.estimatedHours} hours</p>
              </div>

              <div>
                <h4 className="font-medium mb-1">Skills Required</h4>
                <div className="flex flex-wrap gap-1">
                  {aiSuggestions.skillsRequired.map((skill: string) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {aiSuggestions.safetyNotes.length > 0 && (
                <div>
                  <h4 className="font-medium mb-1 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    Safety Notes
                  </h4>
                  <ul className="text-sm space-y-1">
                    {aiSuggestions.safetyNotes.map((note: string, index: number) => (
                      <li key={index} className="flex items-start gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Start typing your task details to get AI-powered suggestions</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}