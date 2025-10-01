import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTaskerProfile } from '@/hooks/use-tasker-profile';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile'; // Import useIsMobile
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer"; // Import Drawer components

interface TaskerRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const availableSkills = [
  "Home Cleaning", "Plumbing", "Electrical", "Carpentry", "Moving", "Delivery",
  "Painting", "Furniture Assembly", "Gardening", "Pet Sitting", "Marketing",
  "Web Development", "Graphic Design", "Tutoring", "Photography", "Event Planning", "Other"
];

const TaskerRegistrationModal: React.FC<TaskerRegistrationModalProps> = ({ isOpen, onClose }) => {
  const { taskerProfile, createOrUpdateTaskerProfile, loading: profileLoading } = useTaskerProfile();
  const [skills, setSkills] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile(); // Use the hook

  useEffect(() => {
    if (taskerProfile) {
      setSkills(taskerProfile.skills || []);
      setBio(taskerProfile.bio || '');
      setHourlyRate(taskerProfile.hourlyRate ? String(taskerProfile.hourlyRate) : '');
    } else {
      // Reset form if no profile exists (e.g., new registration)
      setSkills([]);
      setBio('');
      setHourlyRate('');
    }
  }, [taskerProfile, isOpen]); // Reset when modal opens or profile changes

  const handleSkillChange = (selectedSkill: string) => {
    setSkills(prev =>
      prev.includes(selectedSkill)
        ? prev.filter(s => s !== selectedSkill)
        : [...prev, selectedSkill]
    );
  };

  const handleSaveProfile = async () => {
    if (skills.length === 0 || bio.trim() === '' || !hourlyRate) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (isNaN(parseFloat(hourlyRate)) || parseFloat(hourlyRate) <= 0) {
      toast.error("Hourly rate must be a positive number.");
      return;
    }

    setIsLoading(true);
    try {
      await createOrUpdateTaskerProfile({
        skills,
        bio,
        hourlyRate: parseFloat(hourlyRate),
      });
      onClose();
    } catch (error) {
      // Error handled by useTaskerProfile hook, toast will be shown there
    } finally {
      setIsLoading(false);
    }
  };

  const ModalComponent = isMobile ? Drawer : Dialog;
  const ModalContentComponent = isMobile ? DrawerContent : DialogContent;
  const ModalHeaderComponent = isMobile ? DrawerHeader : DialogHeader;
  const ModalTitleComponent = isMobile ? DrawerTitle : DialogTitle;
  const ModalDescriptionComponent = isMobile ? DrawerDescription : DialogDescription;
  const ModalFooterComponent = isMobile ? DrawerFooter : DialogFooter;

  return (
    <ModalComponent open={isOpen} onOpenChange={onClose}>
      <ModalContentComponent className="sm:max-w-[600px]">
        <ModalHeaderComponent>
          <ModalTitleComponent className="text-2xl font-bold text-[hsl(var(--primary-color))]">
            {taskerProfile ? "Edit Your Tasker Profile" : "Become a Tasker"}
          </ModalTitleComponent>
          <ModalDescriptionComponent className="text-[hsl(var(--text-light))]">
            {taskerProfile ? "Update your skills and availability." : "Share your skills and start earning!"}
          </ModalDescriptionComponent>
        </ModalHeaderComponent>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="skills" className="text-right pt-2">
              Skills
            </Label>
            <div className="col-span-3 flex flex-wrap gap-2">
              {availableSkills.map((skill) => (
                <Button
                  key={skill}
                  variant={skills.includes(skill) ? "default" : "outline"}
                  onClick={() => handleSkillChange(skill)}
                  disabled={isLoading || profileLoading}
                  className={skills.includes(skill) ? "bg-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] text-white" : "border-[hsl(var(--border-color))] text-[hsl(var(--text-dark))] hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"}
                >
                  {skill}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bio" className="text-right">
              Bio
            </Label>
            <Textarea
              id="bio"
              placeholder="Tell us about your experience and what you offer..."
              className="col-span-3"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={isLoading || profileLoading}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="hourlyRate" className="text-right">
              Hourly Rate (₱)
            </Label>
            <Input
              id="hourlyRate"
              type="number"
              placeholder="e.g., 300"
              className="col-span-3"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              disabled={isLoading || profileLoading}
            />
          </div>
        </div>
        <ModalFooterComponent>
          <Button variant="outline" onClick={onClose} disabled={isLoading || profileLoading}>Cancel</Button>
          <Button onClick={handleSaveProfile} disabled={isLoading || profileLoading} className="bg-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] text-white">
            {isLoading ? 'Saving...' : 'Save Profile'}
          </Button>
        </ModalFooterComponent>
      </ModalContentComponent>
    </ModalComponent>
  );
};

export default TaskerRegistrationModal;