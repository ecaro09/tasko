"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTaskerProfile, TaskerProfile } from '@/hooks/use-tasker-profile';
import { toast } from 'sonner';

interface TaskerProfileFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: TaskerProfile | null; // Optional: for editing existing profile
}

const skillsOptions = [
  "Cleaning", "Delivery", "Repairs", "Carpentry", "IT Support",
  "Gardening", "Pet Care", "Tutoring", "Personal Assistant", "Photography",
  "Writing", "Graphic Design", "Web Development", "Marketing", "Other"
];

const TaskerProfileFormModal: React.FC<TaskerProfileFormModalProps> = ({ isOpen, onClose, initialData }) => {
  const { createTaskerProfile, updateTaskerProfile, loading: profileLoading } = useTaskerProfile();
  const [bio, setBio] = useState(initialData?.bio || '');
  const [skills, setSkills] = useState<string[]>(initialData?.skills || []);
  const [hourlyRate, setHourlyRate] = useState(initialData?.hourlyRate?.toString() || '');
  const [location, setLocation] = useState(initialData?.location || '');

  useEffect(() => {
    if (initialData) {
      setBio(initialData.bio);
      setSkills(initialData.skills);
      setHourlyRate(initialData.hourlyRate.toString());
      setLocation(initialData.location);
    } else {
      // Reset form if no initialData (e.g., creating new profile)
      setBio('');
      setSkills([]);
      setHourlyRate('');
      setLocation('');
    }
  }, [initialData, isOpen]); // Reset when modal opens or initialData changes

  const handleSkillChange = (selectedSkill: string) => {
    setSkills((prevSkills) =>
      prevSkills.includes(selectedSkill)
        ? prevSkills.filter((s) => s !== selectedSkill)
        : [...prevSkills, selectedSkill]
    );
  };

  const handleSubmit = async () => {
    const parsedHourlyRate = parseFloat(hourlyRate);

    if (!bio.trim() || skills.length === 0 || !location.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (isNaN(parsedHourlyRate) || parsedHourlyRate <= 0) {
      toast.error("Please enter a valid hourly rate.");
      return;
    }

    try {
      if (initialData) {
        await updateTaskerProfile({ bio, skills, hourlyRate: parsedHourlyRate, location });
        toast.success("Tasker profile updated successfully!");
      } else {
        await createTaskerProfile(bio, skills, parsedHourlyRate, location);
        toast.success("Tasker profile created successfully!");
      }
      onClose();
    } catch (error) {
      console.error("Error saving tasker profile:", error);
      toast.error("Failed to save tasker profile. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Your Tasker Profile' : 'Become a Tasker'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Update your professional details.' : 'Fill in your details to start offering your services.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="bio" className="text-right">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="col-span-3"
              placeholder="Tell us about yourself and your experience..."
              rows={4}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="skills" className="text-right">
              Skills
            </Label>
            <div className="col-span-3 flex flex-wrap gap-2">
              {skillsOptions.map((skill) => (
                <Button
                  key={skill}
                  variant={skills.includes(skill) ? "default" : "outline"}
                  onClick={() => handleSkillChange(skill)}
                  className="h-auto px-3 py-1 text-sm"
                >
                  {skill}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="hourlyRate" className="text-right">
              Hourly Rate (₱)
            </Label>
            <Input
              id="hourlyRate"
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              className="col-span-3"
              min="0"
              step="0.01"
              placeholder="e.g., 350"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Quezon City, Metro Manila"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={profileLoading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={profileLoading}>
            {profileLoading ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Profile')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskerProfileFormModal;