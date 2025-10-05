import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, Camera } from 'lucide-react';
import { useFileUpload } from '@/hooks/use-file-upload'; // New import
import { useSupabaseProfile } from '@/hooks/use-supabase-profile'; // New import

interface EditProfileSectionProps {
  onCancel: () => void;
  onSaveSuccess: () => void;
}

const EditProfileSection: React.FC<EditProfileSectionProps> = ({ onCancel, onSaveSuccess }) => {
  const { user, updateUserProfile } = useAuth();
  const { profile, loadingProfile } = useSupabaseProfile(); // Get profile from useSupabaseProfile
  const { uploadFile, loading: uploadLoading } = useFileUpload(); // Use the file upload hook
  const [firstName, setFirstName] = React.useState(profile?.first_name || '');
  const [lastName, setLastName] = React.useState(profile?.last_name || '');
  const [phone, setPhone] = React.useState(profile?.phone || '');
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(user?.photoURL || profile?.avatar_url || null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setPhone(profile.phone || '');
      setAvatarPreview(user?.photoURL || profile?.avatar_url || null);
    }
  }, [profile, user?.photoURL]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file)); // Create a preview URL
    }
  };

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
    let newPhotoURL = user.photoURL || profile.avatar_url;

    if (avatarFile) {
      const filePath = `avatars/${user.uid}/${avatarFile.name}`;
      const uploadedURL = await uploadFile(avatarFile, filePath);
      if (uploadedURL) {
        newPhotoURL = uploadedURL;
      } else {
        setIsLoading(false);
        return; // Stop if upload failed
      }
    }

    try {
      await updateUserProfile(firstName, lastName, phone, newPhotoURL || undefined);
      onSaveSuccess();
    } catch (error) {
      // Error handled by useAuth, toast already shown
    } finally {
      setIsLoading(false);
    }
  };

  const isFormDisabled = isLoading || uploadLoading || loadingProfile; // Include loadingProfile

  return (
    <Card className="shadow-lg p-6">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">Edit Profile</CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-4">
        <div className="flex flex-col items-center gap-4 mb-6">
          <Avatar className="w-24 h-24 border-4 border-green-500">
            <AvatarImage src={avatarPreview || undefined} alt={user?.displayName || "User Avatar"} />
            <AvatarFallback className="bg-green-200 text-green-800 text-3xl font-semibold">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon size={48} />}
            </AvatarFallback>
          </Avatar>
          <Label htmlFor="avatar-upload" className="cursor-pointer flex items-center gap-2 text-blue-600 hover:text-blue-800">
            <Camera size={20} /> Change Avatar
            <Input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isFormDisabled}
            />
          </Label>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={isFormDisabled}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={isFormDisabled}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isFormDisabled}
            placeholder="e.g., +639171234567"
          />
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onCancel} disabled={isFormDisabled}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isFormDisabled} className="bg-green-600 hover:bg-green-700 text-white">
            {isFormDisabled ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EditProfileSection;