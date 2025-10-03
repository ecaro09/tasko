import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface EditProfileSectionProps {
  onCancel: () => void;
  onSaveSuccess: () => void;
}

const EditProfileSection: React.FC<EditProfileSectionProps> = ({ onCancel, onSaveSuccess }) => {
  const { user, profile, updateUserProfile } = useAuth();
  const [firstName, setFirstName] = React.useState(profile?.first_name || '');
  const [lastName, setLastName] = React.useState(profile?.last_name || '');
  const [phone, setPhone] = React.useState(profile?.phone || '');
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user || !profile) {
      toast.error("No user profile found.");
      return;
    }
    if (firstName.trim() === '' || lastName.trim() === '') {
      toast.error("First name and last name cannot be empty.");
      return;
    }

    setIsLoading(true);
    try {
      await updateUserProfile(firstName, lastName, phone);
      onSaveSuccess();
    } catch (error) {
      // Error handled by useAuth, toast already shown
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg p-6">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">Edit Profile</CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isLoading}
            placeholder="e.g., +639171234567"
          />
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white">
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EditProfileSection;