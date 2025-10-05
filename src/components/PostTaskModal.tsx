import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTasks } from '@/hooks/use-tasks';
import { toast } from 'sonner';
import { useFileUpload } from '@/hooks/use-file-upload';
import { Camera, Image as ImageIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils'; // Assuming cn utility is available

interface PostTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Define Zod schema for task creation
const taskSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(100, "Title cannot exceed 100 characters."),
  description: z.string().min(20, "Description must be at least 20 characters.").max(500, "Description cannot exceed 500 characters."),
  location: z.string().min(3, "Location must be at least 3 characters.").max(100, "Location cannot exceed 100 characters."),
  budget: z.preprocess(
    (val) => Number(val),
    z.number().min(100, "Budget must be at least ₱100.").max(100000, "Budget cannot exceed ₱100,000.")
  ),
  category: z.string().min(1, "Please select a category."),
  // imageUrl is handled separately by file upload, not directly by form input
});

type TaskFormValues = z.infer<typeof taskSchema>;

const PostTaskModal: React.FC<PostTaskModalProps> = ({ isOpen, onClose }) => {
  const { addTask } = useTasks();
  const { uploadFile, loading: uploadLoading } = useFileUpload();
  const [taskImageFile, setTaskImageFile] = React.useState<File | null>(null);
  const [taskImagePreview, setTaskImagePreview] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      budget: 0,
      category: '',
    },
  });

  // Reset form fields when modal opens
  React.useEffect(() => {
    if (isOpen) {
      form.reset();
      setTaskImageFile(null);
      setTaskImagePreview(null);
      setIsLoading(false);
    }
  }, [isOpen, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // Basic file size validation (e.g., 5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image file size cannot exceed 5MB.");
        setTaskImageFile(null);
        setTaskImagePreview(null);
        return;
      }
      setTaskImageFile(file);
      setTaskImagePreview(URL.createObjectURL(file));
    } else {
      setTaskImageFile(null);
      setTaskImagePreview(null);
    }
  };

  const onSubmit = async (values: TaskFormValues) => {
    setIsLoading(true);
    let imageUrl: string | undefined;

    if (taskImageFile) {
      const filePath = `task_images/${Date.now()}_${taskImageFile.name}`;
      const uploadedURL = await uploadFile(taskImageFile, filePath);
      if (uploadedURL) {
        imageUrl = uploadedURL;
      } else {
        setIsLoading(false);
        return;
      }
    }

    try {
      await addTask({
        title: values.title,
        description: values.description,
        location: values.location,
        budget: values.budget,
        category: values.category,
        imageUrl: imageUrl,
      });
      onClose();
    } catch (error) {
      // Error handled by useTasks hook, toast will be shown there
    } finally {
      setIsLoading(false);
    }
  };

  const isFormDisabled = isLoading || uploadLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[hsl(var(--primary-color))]">Post a New Task</DialogTitle>
          <DialogDescription className="text-[hsl(var(--text-light))]">
            Describe your task and let local taskers make offers.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <div className="col-span-3">
              <Input
                id="title"
                placeholder="e.g., 'House Cleaning'"
                {...form.register("title")}
                disabled={isFormDisabled}
              />
              {form.formState.errors.title && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.title.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <div className="col-span-3">
              <Textarea
                id="description"
                placeholder="Provide details about your task..."
                {...form.register("description")}
                disabled={isFormDisabled}
              />
              {form.formState.errors.description && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.description.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location
            </Label>
            <div className="col-span-3">
              <Input
                id="location"
                placeholder="e.g., 'Quezon City, Metro Manila'"
                {...form.register("location")}
                disabled={isFormDisabled}
              />
              {form.formState.errors.location && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.location.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="budget" className="text-right">
              Budget (₱)
            </Label>
            <div className="col-span-3">
              <Input
                id="budget"
                type="number"
                placeholder="e.g., '1500'"
                {...form.register("budget", { valueAsNumber: true })}
                disabled={isFormDisabled}
              />
              {form.formState.errors.budget && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.budget.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <div className="col-span-3">
              <Select
                value={form.watch("category")}
                onValueChange={(value) => form.setValue("category", value, { shouldValidate: true })}
                disabled={isFormDisabled}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cleaning">Home Cleaning</SelectItem>
                  <SelectItem value="repairs">Handyman Services</SelectItem>
                  <SelectItem value="moving">Moving & Hauling</SelectItem>
                  <SelectItem value="delivery">Delivery & Errands</SelectItem>
                  <SelectItem value="painting">Painting Services</SelectItem>
                  <SelectItem value="assembly">Assembly Services</SelectItem>
                  <SelectItem value="marketing">Marketing Services</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.category.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="task-image-upload" className="text-right pt-2">
              Task Image
            </Label>
            <div className="col-span-3 flex flex-col gap-2">
              {taskImagePreview && (
                <img src={taskImagePreview} alt="Task Preview" className="w-32 h-32 object-cover rounded-md mb-2" />
              )}
              <Label htmlFor="task-image-upload" className="cursor-pointer flex items-center gap-2 text-blue-600 hover:text-blue-800">
                <Camera size={20} /> {taskImageFile ? "Change Image" : "Upload Image (Optional)"}
                <Input
                  id="task-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isFormDisabled}
                />
              </Label>
              {!taskImageFile && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Max file size: 5MB</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isFormDisabled}>Cancel</Button>
            <Button type="submit" disabled={isFormDisabled} className="bg-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] text-white">
              {isFormDisabled ? 'Posting...' : 'Post Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PostTaskModal;