import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTasks } from '@/hooks/use-tasks';
import { toast } from 'sonner';

interface PostTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PostTaskModal: React.FC<PostTaskModalProps> = ({ isOpen, onClose }) => {
  const { addTask } = useTasks();
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskLocation, setTaskLocation] = useState('');
  const [taskBudget, setTaskBudget] = useState('');
  const [taskCategory, setTaskCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePostTask = async () => {
    if (!taskTitle || !taskDescription || !taskLocation || !taskBudget || !taskCategory) {
      toast.error("Please fill in all task details.");
      return;
    }

    setIsLoading(true);
    try {
      await addTask({
        title: taskTitle,
        description: taskDescription,
        location: taskLocation,
        budget: parseFloat(taskBudget),
        category: taskCategory,
      });
      // Clear form fields on success
      setTaskTitle('');
      setTaskDescription('');
      setTaskLocation('');
      setTaskBudget('');
      setTaskCategory('');
      onClose(); // Close modal on successful post
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
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select value={taskCategory} onValueChange={setTaskCategory}>
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
                <SelectItem value="marketing">Marketing Services</SelectItem> {/* Added Marketing */}
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button onClick={handlePostTask} disabled={isLoading} className="bg-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] text-white">
            {isLoading ? 'Posting...' : 'Post Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PostTaskModal;