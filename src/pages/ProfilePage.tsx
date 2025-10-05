import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useTaskerProfile } from '@/hooks/use-tasker-profile';
import { useSupabaseProfile } from '@/hooks/use-supabase-profile';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, Mail, Edit, Briefcase, Settings as SettingsIcon, Phone, CheckCircle, ListTodo, Star, DollarSign } from 'lucide-react';
import EditProfileSection from '@/components/EditProfileSection';
import EditTaskerProfileSection from '@/components/EditTaskerProfileSection'; // Import the new component
import { Badge } from '@/components/ui/badge';
import { DEFAULT_AVATAR_URL } from '@/utils/image-placeholders';
import { cn } from '@/lib/utils';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { isTasker, taskerProfile, loading: taskerProfileLoading } = useTaskerProfile(); // Get taskerProfile
  const { profile, loadingProfile } = useSupabaseProfile();
  const navigate = useNavigate();
  const [isEditingGeneral, setIsEditingGeneral] = React.useState(false);
  const [isEditingTasker, setIsEditingTasker] = React.useState(false);

  if (authLoading || taskerProfileLoading || loadingProfile) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Loading profile...</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 pt-[60px] px-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[hsl(var(--primary-color))]">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to view your profile.</p>
            <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 text-white">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : user.email || "Anonymous User";
  const avatarUrl = profile?.avatar_url || undefined;

  const handleSaveGeneralSuccess = () => {
    setIsEditingGeneral(false);
  };

  const handleSaveTaskerSuccess = () => {
    setIsEditingTasker(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px] px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">My Profile</h1>

        {isEditingGeneral ? (
          <EditProfileSection
            onCancel={() => setIsEditingGeneral(false)}
            onSaveSuccess={handleSaveGeneralSuccess}
          />
        ) : isEditingTasker && isTasker ? (
          <EditTaskerProfileSection
            onCancel={() => setIsEditingTasker(false)}
            onSaveSuccess={handleSaveTaskerSuccess}
          />
        ) : (
          <>
            <Card className="shadow-lg p-6 mb-8">
              <CardContent className="flex flex-col items-center text-center p-0">
                <Avatar className="w-24 h-24 mb-4 border-4 border-green-500">
                  <AvatarImage
                    src={avatarUrl || DEFAULT_AVATAR_URL}
                    alt={displayName}
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_AVATAR_URL;
                      e.currentTarget.onerror = null;
                    }}
                  />
                  <AvatarFallback className="bg-green-200 text-green-800 text-3xl font-semibold">
                    {profile?.first_name?.charAt(0).toUpperCase() || ''}
                    {profile?.last_name?.charAt(0).toUpperCase() || <UserIcon size={32} />}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{displayName}</h2>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Mail size={18} /> {user.email}
                </p>
                {profile?.phone && (
                  <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                    <Phone size={18} /> {profile.phone}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-4">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200 px-3 py-1 rounded-full">
                    Role: {profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'User'}
                  </Badge>
                  {profile?.is_verified_tasker && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200 px-3 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle size={14} /> Verified Tasker
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsEditingGeneral(true)}
                  className="mt-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white flex items-center gap-2"
                >
                  <Edit size={18} /> Edit General Profile
                </Button>
              </CardContent>
            </Card>

            {isTasker && taskerProfile && (
              <Card className="shadow-lg p-6 mb-8">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <Briefcase size={24} /> Tasker Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div className="grid gap-2">
                    <p className="font-semibold text-gray-700 dark:text-gray-300">Bio:</p>
                    <p className="text-gray-600 dark:text-gray-400">{taskerProfile.bio || 'No bio provided.'}</p>
                  </div>
                  <div className="grid gap-2">
                    <p className="font-semibold text-gray-700 dark:text-gray-300">Hourly Rate:</p>
                    <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <DollarSign size={16} /> ₱{taskerProfile.hourlyRate.toLocaleString()}/hr
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <p className="font-semibold text-gray-700 dark:text-gray-300">Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {taskerProfile.skills.length > 0 ? (
                        taskerProfile.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200 px-3 py-1 rounded-full">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No skills listed.</p>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <p className="font-semibold text-gray-700 dark:text-gray-300">Rating:</p>
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
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingTasker(true)}
                    className="mt-6 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center gap-2"
                  >
                    <Edit size={18} /> Edit Tasker Profile
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-lg p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">My Activities</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <Button
                  onClick={() => navigate('/my-tasks')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
                >
                  View My Posted Tasks
                </Button>
                {isTasker && (
                  <>
                    <Button
                      onClick={() => navigate('/my-offers')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 flex items-center justify-center gap-2"
                    >
                      <Briefcase size={20} /> View My Offers
                    </Button>
                    <Button
                      onClick={() => navigate('/my-assigned-tasks')}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white text-lg py-6 flex items-center justify-center gap-2"
                    >
                      <ListTodo size={20} /> View My Assigned Tasks
                    </Button>
                  </>
                )}
                <Button
                  onClick={() => navigate('/settings')}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 text-lg py-6 flex items-center justify-center gap-2"
                >
                  <SettingsIcon size={20} /> App Settings
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;