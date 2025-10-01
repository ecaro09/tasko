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
  const { user, updateUserProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [contactNumber, setContactNumber] = useState(user?.profile?.contact_number || ''); // New state
  const [photoURL, setPhotoURL] = useState(user?.photoURL || ''); // New state
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setDisplayName(user?.displayName || '');
    setContactNumber(user?.profile?.contact_number || '');
    setPhotoURL(user?.photoURL || '');
  }, [user]);

  const handleSave = async () => {
    if (!user) {
      toast.error("No user logged in.");
      return;
    }
    if (displayName.trim() === '') {
      toast.error("Display name cannot be empty.");
      return;
    }

    setIsLoading(true);
    try {
      await updateUserProfile(displayName, photoURL, contactNumber);
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
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="contactNumber">Contact Number</Label>
          <Input
            id="contactNumber"
            type="tel"
            placeholder="e.g., +639171234567"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="photoURL">Profile Picture URL</Label>
          <Input
            id="photoURL"
            type="url"
            placeholder="e.g., https://example.com/your-photo.jpg"
            value={photoURL}
            onChange={(e) => setPhotoURL(e.target.value)}
            disabled={isLoading}
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