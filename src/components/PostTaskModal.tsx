import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTasks } from '@/hooks/use-tasks';
import { toast } from 'sonner';
import { useFileUpload } from '@/hooks/use-file-upload'; // Import the file upload hook
import { Camera, Image as ImageIcon } from 'lucide-react'; // Import icons

interface PostTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PostTaskModal: React.FC<PostTaskModalProps> = ({ isOpen, onClose }) => {
  const { addTask } = useTasks();
  const { uploadFile, loading: uploadLoading } = useFileUpload(); // Use the file upload hook
  const [taskTitle, setTaskTitle] = React.useState('');
  const [taskDescription, setTaskDescription] = React.useState('');
  const [taskLocation, setTaskLocation] = React.useState('');
  const [taskBudget, setTaskBudget] = React.useState('');
  const [taskCategory, setTaskCategory] = React.useState('');
  const [taskImageFile, setTaskImageFile] = React.useState<File | null>(null); // State for the image file
  const [taskImagePreview, setTaskImagePreview] = React.useState<string | null>(null); // State for image preview
  const [isLoading, setIsLoading] = React.useState(false);

  // Reset form fields when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTaskTitle('');
      setTaskDescription('');
      setTaskLocation('');
      setTaskBudget('');
      setTaskCategory('');
      setTaskImageFile(null);
      setTaskImagePreview(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setTaskImageFile(file);
      setTaskImagePreview(URL.createObjectURL(file)); // Create a preview URL
    } else {
      setTaskImageFile(null);
      setTaskImagePreview(null);
    }
  };

  const handlePostTask = async () => {
    if (!taskTitle || !taskDescription || !taskLocation || !taskBudget || !taskCategory) {
      toast.error("Please fill in all task details.");
      return;
    }
    if (isNaN(parseFloat(taskBudget)) || parseFloat(taskBudget) <= 0) {
      toast.error("Budget must be a positive number.");
      return;
    }

    setIsLoading(true);
    let imageUrl: string | undefined;

    if (taskImageFile) {
      const filePath = `task_images/${Date.now()}_${taskImageFile.name}`;
      const uploadedURL = await uploadFile(taskImageFile, filePath);
      if (uploadedURL) {
        imageUrl = uploadedURL;
      } else {
        setIsLoading(false);
        return; // Stop if upload failed
      }
    }

    try {
      await addTask({
        title: taskTitle,
        description: taskDescription,
        location: taskLocation,
        budget: parseFloat(taskBudget),
        category: taskCategory,
        imageUrl: imageUrl, // Pass the uploaded image URL
      });
      onClose(); // Close modal on successful post
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isFormDisabled}>Cancel</Button>
          <Button onClick={handlePostTask} disabled={isFormDisabled} className="bg-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] text-white">
            {isFormDisabled ? 'Posting...' : 'Post Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PostTaskModal;