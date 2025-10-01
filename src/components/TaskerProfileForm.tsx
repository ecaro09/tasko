"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { useTaskerProfile } from '@/hooks/use-tasker-profile';
import { toast } from 'sonner';

const skillsOptions = [
  "Cleaning", "Delivery", "Repairs", "Carpentry", "IT Support",
  "Gardening", "Pet Care", "Tutoring", "Personal Assistant", "Photography",
  "Writing", "Graphic Design", "Web Development", "Marketing", "Other"
];

const TaskerProfileForm: React.FC = () => {
  const {
    taskerProfile,
    isTasker,
    loading,
    createTaskerProfile,
    updateTaskerProfile,
  } = useTaskerProfile();

  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (taskerProfile) {
      setBio(taskerProfile.bio);
      setSkills(taskerProfile.skills);
      setHourlyRate(taskerProfile.hourlyRate.toString());
      setLocation(taskerProfile.location);
    } else {
      // Reset form if no tasker profile
      setBio('');
      setSkills([]);
      setHourlyRate('');
      setLocation('');
    }
  }, [taskerProfile]);

  const handleSkillChange = (selectedSkill: string) => {
    setSkills((prevSkills) =>
      prevSkills.includes(selectedSkill)
        ? prevSkills.filter((s) => s !== selectedSkill)
        : [...prevSkills, selectedSkill]
    );
  };

  const handleSubmit = async () => {
    const parsedHourlyRate = parseFloat(hourlyRate);

    if (!bio.trim() || skills.length === 0 || isNaN(parsedHourlyRate) || parsedHourlyRate <= 0 || !location.trim()) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    try {
      if (isTasker) {
        await updateTaskerProfile({
          bio,
          skills,
          hourlyRate: parsedHourlyRate,
          location,
        });
      } else {
        await createTaskerProfile(bio, skills, parsedHourlyRate, location);
      }
    } catch (error) {
      console.error("Error saving tasker profile:", error);
      toast.error("Failed to save tasker profile. Please try again.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isTasker ? "Manage Your Tasker Profile" : "Become a Tasker"}</CardTitle>
        <CardDescription>
          {isTasker
            ? "Update your professional details to attract more tasks."
            : "Create a tasker profile to start making offers on tasks."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Tell us about yourself and your experience..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            disabled={loading}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="skills">Skills</Label>
          <div className="flex flex-wrap gap-2">
            {skillsOptions.map((skill) => (
              <Button
                key={skill}
                variant={skills.includes(skill) ? "default" : "outline"}
                onClick={() => handleSkillChange(skill)}
                disabled={loading}
                className={skills.includes(skill) ? "bg-blue-600 text-white hover:bg-blue-700" : "border-gray-300 dark:border-gray-600"}
              >
                {skill}
              </Button>
            ))}
          </div>
          {skills.length === 0 && <p className="text-red-500 text-sm">Please select at least one skill.</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="hourlyRate">Hourly Rate (₱)</Label>
          <Input
            id="hourlyRate"
            type="number"
            placeholder="e.g., 500"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            min="0"
            step="0.01"
            disabled={loading}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="e.g., Makati, Metro Manila"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={loading}
          />
        </div>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : (isTasker ? "Update Profile" : "Create Tasker Profile")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TaskerProfileForm;