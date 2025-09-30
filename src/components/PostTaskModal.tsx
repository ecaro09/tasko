import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PostTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostTask: (task: { title: string; category: string; description: string; location: string; budget: number }) => void;
}

const categories = [
  { value: "cleaning", label: "Home Cleaning" },
  { value: "moving", label: "Moving & Packing" },
  { value: "assembly", label: "Furniture Assembly" },
  { value: "repairs", label: "Home Repairs" },
  { value: "delivery", label: "Delivery Services" },
  { value: "mounting", label: "Mounting & Installation" },
];

const PostTaskModal: React.FC<PostTaskModalProps> = ({ isOpen, onClose, onPostTask }) => {
  const [title, setTitle] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [budget, setBudget] = React.useState<number | ''>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && category && description && location && budget !== '') {
      onPostTask({ title, category, description, location, budget: Number(budget) });
      // Reset form
      setTitle('');
      setCategory('');
      setDescription('');
      setLocation('');
      setBudget('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Post a Task</DialogTitle>
          <DialogDescription>
            Describe the task you need help with.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="taskTitle">Task Title</Label>
            <Input
              id="taskTitle"
              type="text"
              placeholder="e.g., Need help assembling IKEA furniture"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="taskCategory">Category</Label>
            <Select onValueChange={setCategory} value={category} required>
              <SelectTrigger id="taskCategory">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="taskDescription">Task Description</Label>
            <Textarea
              id="taskDescription"
              placeholder="Describe what you need help with..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="taskLocation">Location</Label>
            <Input
              id="taskLocation"
              type="text"
              placeholder="Enter your address or area"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="taskBudget">Budget (₱)</Label>
            <Input
              id="taskBudget"
              type="number"
              placeholder="500"
              min="100"
              value={budget}
              onChange={(e) => setBudget(e.target.value === '' ? '' : Number(e.target.value))}
              required
            />
          </div>
          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Post Task</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PostTaskModal;