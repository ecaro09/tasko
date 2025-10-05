import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTaskerProfile } from '@/hooks/use-tasker-profile';
import { toast } from 'sonner';
import { Briefcase, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditTaskerProfileSectionProps {
  onCancel: () => void;
  onSaveSuccess: () => void;
}

const availableSkills = [
  "Home Cleaning", "Plumbing", "Electrical", "Carpentry", "Moving", "Delivery",
  "Painting", "Furniture Assembly", "Gardening", "Pet Sitting", "Marketing",
  "Web Development", "Graphic Design", "Tutoring", "Photography", "Event Planning", "Other"
];

const EditTaskerProfileSection: React.FC<EditTaskerProfileSectionProps> = ({ onCancel, onSaveSuccess }) => {
  const { taskerProfile, createOrUpdateTaskerProfile, loading: profileLoading } = useTaskerProfile();
  const [skills, setSkills] = React.useState<string[]>([]);
  const [bio, setBio] = React.useState('');
  const [hourlyRate, setHourlyRate] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (taskerProfile) {
      setSkills(taskerProfile.skills || []);
      setBio(taskerProfile.bio || '');
      setHourlyRate(taskerProfile.hourlyRate ? String(taskerProfile.hourlyRate) : '');
    } else {
      // If no tasker profile exists, initialize with empty values for new registration flow
      setSkills([]);
      setBio('');
      setHourlyRate('');
    }
  }, [taskerProfile]);

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
      onSaveSuccess();
    } catch (error) {
      // Error handled by useTaskerProfile hook, toast will be shown there
    } finally {
      setIsLoading(false);
    }
  };

  const isFormDisabled = isLoading || profileLoading;

  return (
    <Card className="shadow-lg p-6">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Briefcase size={24} /> {taskerProfile ? "Edit Your Tasker Profile" : "Become a Tasker"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="skills" className="font-semibold">
            Skills
          </Label>
          <div className="flex flex-wrap gap-2">
            {availableSkills.map((skill) => (
              <Button
                key={skill}
                variant={skills.includes(skill) ? "default" : "outline"}
                onClick={() => handleSkillChange(skill)}
                disabled={isFormDisabled}
                className={cn(
                  skills.includes(skill) ? "bg-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] text-white" : "border-[hsl(var(--border-color))] text-[hsl(var(--text-dark))] hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700",
                  "text-sm px-3 py-1 h-auto"
                )}
              >
                {skill}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="bio" className="font-semibold">
            Bio
          </Label>
          <Textarea
            id="bio"
            placeholder="Tell us about your experience and what you offer..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={isFormDisabled}
            rows={5}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="hourlyRate" className="font-semibold">
            Hourly Rate (₱)
          </Label>
          <Input
            id="hourlyRate"
            type="number"
            placeholder="e.g., 300"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            disabled={isFormDisabled}
          />
        </div>

        {taskerProfile && ( // Only show rating/review count if profile exists
          <div className="grid gap-2">
            <Label className="font-semibold">Rating</Label>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={cn(
                      "transition-colors",
                      i < Math.round(taskerProfile.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"
                    )}
                  />
                ))}
              </div>
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {taskerProfile.rating.toFixed(1)}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                ({taskerProfile.reviewCount} reviews)
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onCancel} disabled={isFormDisabled}>
            Cancel
          </Button>
          <Button onClick={handleSaveProfile} disabled={isFormDisabled} className="bg-green-600 hover:bg-green-700 text-white">
            {isFormDisabled ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EditTaskerProfileSection;