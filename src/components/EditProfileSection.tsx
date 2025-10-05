import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/use-auth';
import { useSupabaseProfile } from '@/hooks/use-supabase-profile';
import { useFileUpload } from '@/hooks/use-file-upload';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, Camera, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DEFAULT_AVATAR_URL } from '@/utils/image-placeholders'; // Import default avatar URL

interface EditProfileSectionProps {
  onCancel: () => void;
  onSaveSuccess: () => void;
}

const EditProfileSection: React.FC<EditProfileSectionProps> = ({ onCancel, onSaveSuccess }) => {
  const { user, updateUserProfile } = useAuth();
  const { profile, updateProfile, loadingProfile } = useSupabaseProfile();
  const { uploadFile, loading: uploadLoading } = useFileUpload();

  const [firstName, setFirstName] = React.useState(user?.user_metadata?.first_name || '');
  const [lastName, setLastName] = React.useState(user?.user_metadata?.last_name || '');
  const [phone, setPhone] = React.useState(profile?.phone || ''); // New state for phone
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(user?.user_metadata?.avatar_url || null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setFirstName(user.user_metadata?.first_name || '');
      setLastName(user.user_metadata?.last_name || '');
      setAvatarPreview(user.user_metadata?.avatar_url || null);
    }
    if (profile) {
      setPhone(profile.phone || ''); // Update phone from profile
    }
  }, [user, profile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setAvatarFile(null);
      setAvatarPreview(user?.user_metadata?.avatar_url || null); // Revert to original if no new file selected
    }
  };

  const handleSave = async () => {
    if (!user || !profile) {
      toast.error("No user or profile data available.");
      return;
    }
    if (firstName.trim() === '' || lastName.trim() === '') {
      toast.error("First name and last name cannot be empty.");
      return;
    }

    setIsLoading(true);
    let newAvatarUrl: string | undefined = user.user_metadata?.avatar_url || undefined;

    if (avatarFile) {
      const filePath = `avatars/${user.id}/${Date.now()}_${avatarFile.name}`;
      const uploadedURL = await uploadFile(avatarFile, filePath);
      if (uploadedURL) {
        newAvatarUrl = uploadedURL;
      } else {
        setIsLoading(false);
        return; // Stop if avatar upload fails
      }
    } else if (avatarPreview === null && user.user_metadata?.avatar_url) {
      // If preview is cleared and there was an original image, it means user wants to remove it
      newAvatarUrl = undefined; // Explicitly set to undefined to signal removal
    }

    try {
      // Update Supabase auth.users metadata (firstName, lastName, avatarUrl)
      await updateUserProfile(firstName, lastName, newAvatarUrl);

      // Update public.profiles table (firstName, lastName, phone, avatarUrl, etc.)
      await updateProfile(
        user.id,
        { // Pass as partial object
          first_name: firstName,
          last_name: lastName,
          phone: phone.trim() === '' ? null : phone,
          avatar_url: newAvatarUrl || null,
          role: profile.role, // Keep existing role
          rating: profile.rating, // Keep existing rating
          is_verified_tasker: profile.is_verified_tasker // Keep existing status
        }
      );

      onSaveSuccess();
    } catch (error) {
      // Errors handled by useAuth and useSupabaseProfile, toasts already shown
    } finally {
      setIsLoading(false);
    }
  };

  const isFormDisabled = isLoading || uploadLoading || loadingProfile;

  return (
    <Card className="shadow-lg p-6">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">Edit Profile</CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-4">
        <div className="flex flex-col items-center gap-4 mb-6">
          <Avatar className="w-24 h-24 border-4 border-green-500">
            <AvatarImage 
              src={avatarPreview || DEFAULT_AVATAR_URL} 
              alt={user?.email || "User"} 
              onError={(e) => {
                e.currentTarget.src = DEFAULT_AVATAR_URL;
                e.currentTarget.onerror = null;
              }}
            />
            <AvatarFallback className="bg-green-200 text-green-800 text-3xl font-semibold">
              {firstName.charAt(0).toUpperCase()}{lastName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Label htmlFor="avatar-upload" className="cursor-pointer flex items-center gap-2 text-blue-600 hover:text-blue-800">
            <Camera size={20} /> {avatarFile ? "Change Avatar" : (avatarPreview ? "Update Avatar" : "Upload Avatar (Optional)")}
            <Input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isFormDisabled}
            />
          </Label>
          {avatarPreview && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAvatarPreview(null)}
              disabled={isFormDisabled}
              className="text-red-500 hover:text-red-700"
            >
              Remove Avatar
            </Button>
          )}
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
          <Label htmlFor="phone">Phone Number (Optional)</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="e.g., +639171234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isFormDisabled}
          />
        </div>

        {/* Display Role and Verified Tasker status (read-only) */}
        <div className="grid gap-2">
          <Label>Role</Label>
          <Input
            value={profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'User'}
            readOnly
            disabled
            className="bg-gray-100 dark:bg-gray-700"
          />
        </div>
        <div className="grid gap-2">
          <Label>Verified Tasker Status</Label>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={`px-3 py-1 rounded-full ${profile?.is_verified_tasker ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
              {profile?.is_verified_tasker ? (
                <><CheckCircle size={14} className="mr-1" /> Verified</>
              ) : (
                'Not Verified'
              )}
            </Badge>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              (Verification is managed by Tasko admin)
            </span>
          </div>
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