import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTasks } from '@/hooks/use-tasks';
import { Task } from '@/lib/task-firestore'; // Import Task interface from new location
import { toast } from 'sonner';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null; // The task to be edited
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, task }) => {
  const { editTask } = useTasks();
  const [taskTitle, setTaskTitle] = React.useState(task?.title || '');
  const [taskDescription, setTaskDescription] = React.useState(task?.description || '');
  const [taskLocation, setTaskLocation] = React.useState(task?.location || '');
  const [taskBudget, setTaskBudget] = React.useState(task?.budget ? String(task.budget) : '');
  const [taskCategory, setTaskCategory] = React.useState(task?.category || '');
  const [isLoading, setIsLoading] = React.useState(false);

  // Update form fields when the 'task' prop changes
  React.useEffect(() => {
    if (task) {
      setTaskTitle(task.title);
      setTaskDescription(task.description);
      setTaskLocation(task.location);
      setTaskBudget(String(task.budget));
      setTaskCategory(task.category);
    }
  }, [task]);

  const handleEditTask = async () => {
    if (!task) {
      toast.error("No task selected for editing.");
      return;
    }
    if (!taskTitle || !taskDescription || !taskLocation || !taskBudget || !taskCategory) {
      toast.error("Please fill in all task details.");
      return;
    }

    setIsLoading(true);
    try {
      await editTask(task.id, {
        title: taskTitle,
        description: taskDescription,
        location: taskLocation,
        budget: parseFloat(taskBudget),
        category: taskCategory,
      });
      onClose(); // Close modal on successful edit
    } catch (error) {
      // Error handled by useTasks hook, toast will be shown there
    } finally {
      setIsLoading(false);
    }
  };

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
              disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select value={taskCategory} onValueChange={setTaskCategory} disabled={isLoading}>
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleEditTask} disabled={isLoading} className="bg-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] text-white">
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskModal;