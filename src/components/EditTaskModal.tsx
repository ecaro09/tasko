import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTasks, Task } from '@/hooks/use-tasks';
import { toast } from 'sonner';
import { useFileUpload } from '@/hooks/use-file-upload';
import { Camera, Image as ImageIcon } from 'lucide-react';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, task }) => {
  const { editTask } = useTasks();
  const { uploadFile, loading: uploadLoading } = useFileUpload();
  const [taskTitle, setTaskTitle] = React.useState(task?.title || '');
  const [taskDescription, setTaskDescription] = React.useState(task?.description || '');
  const [taskLocation, setTaskLocation] = React.useState(task?.location || '');
  const [taskBudget, setTaskBudget] = React.useState(String(task?.budget || ''));
  const [taskCategory, setTaskCategory] = React.useState(task?.category || '');
  const [taskImageFile, setTaskImageFile] = React.useState<File | null>(null);
  const [taskImagePreview, setTaskImagePreview] = React.useState<string | null>(task?.imageUrl || null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (task) {
      setTaskTitle(task.title);
      setTaskDescription(task.description);
      setTaskLocation(task.location);
      setTaskBudget(String(task.budget));
      setTaskCategory(task.category);
      setTaskImagePreview(task.imageUrl || null);
      setTaskImageFile(null); // Reset file input
    }
  }, [task, isOpen]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setTaskImageFile(file);
      setTaskImagePreview(URL.createObjectURL(file));
    } else {
      setTaskImageFile(null);
      setTaskImagePreview(task?.imageUrl || null); // Revert to original if no new file selected
    }
  };

  const handleSaveTask = async () => {
    if (!task) {
      toast.error("No task selected for editing.");
      return;
    }
    if (!taskTitle || !taskDescription || !taskLocation || !taskBudget || !taskCategory) {
      toast.error("Please fill in all task details.");
      return;
    }
    if (isNaN(parseFloat(taskBudget)) || parseFloat(taskBudget) <= 0) {
      toast.error("Budget must be a positive number.");
      return;
    }

    setIsLoading(true);
    let imageUrl: string | undefined = task.imageUrl;

    if (taskImageFile) {
      const filePath = `task_images/${task.id}_${Date.now()}_${taskImageFile.name}`;
      const uploadedURL = await uploadFile(taskImageFile, filePath);
      if (uploadedURL) {
        imageUrl = uploadedURL;
      } else {
        setIsLoading(false);
        return;
      }
    } else if (taskImagePreview === null && task.imageUrl) {
      // If preview is cleared and there was an original image, it means user wants to remove it
      imageUrl = undefined;
    }

    try {
      await editTask(task.id, {
        title: taskTitle,
        description: taskDescription,
        location: taskLocation,
        budget: parseFloat(taskBudget),
        category: taskCategory,
        imageUrl: imageUrl,
      });
      onClose();
    } catch (error) {
      // Error handled by useTasks hook
    } finally {
      setIsLoading(false);
    }
  };

  const isFormDisabled = isLoading || uploadLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[hsl(var(--primary-color))]">Edit Task</DialogTitle>
          <DialogDescription className="text-[hsl(var(--text-light))]">
            Update the details of your task.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              placeholder="e.g., 'House Cleaning'"
              className="col-span-3"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              disabled={isFormDisabled}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Provide details about your task..."
              className="col-span-3"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              disabled={isFormDisabled}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location
            </Label>
            <Input
              id="location"
              placeholder="e.g., 'Quezon City, Metro Manila'"
              className="col-span-3"
              value={taskLocation}
              onChange={(e) => setTaskLocation(e.target.value)}
              disabled={isFormDisabled}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="budget" className="text-right">
              Budget (₱)
            </Label>
            <Input
              id="budget"
              type="number"
              placeholder="e.g., '1500'"
              className="col-span-3"
              value={taskBudget}
              onChange={(e) => setTaskBudget(e.target.value)}
              disabled={isFormDisabled}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select value={taskCategory} onValueChange={setTaskCategory} disabled={isFormDisabled}>
              <SelectTrigger id="category" className="col-span-3">
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
                <Camera size={20} /> {taskImageFile ? "Change Image" : (taskImagePreview ? "Update Image" : "Upload Image (Optional)")}
                <Input
                  id="task-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isFormDisabled}
                />
              </Label>
              {taskImagePreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTaskImagePreview(null)}
                  disabled={isFormDisabled}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove Image
                </Button>
              )}
              {!taskImageFile && !taskImagePreview && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Max file size: 5MB</p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isFormDisabled}>Cancel</Button>
          <Button onClick={handleSaveTask} disabled={isFormDisabled} className="bg-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] text-white">
            {isFormDisabled ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskModal;