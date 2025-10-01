import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useTaskerProfile } from '@/hooks/use-tasker-profile';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, Mail, Edit, Briefcase, Settings as SettingsIcon, LayoutDashboard, DollarSign, Info } from 'lucide-react';
import EditProfileSection from '@/components/EditProfileSection';
import { Badge } from '@/components/ui/badge';
import { useModal } from '@/components/ModalProvider'; // Import useModal

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { taskerProfile, isTasker, loading: taskerProfileLoading } = useTaskerProfile();
  const { openTaskerRegistrationModal } = useModal(); // Get the modal opener
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  if (authLoading || taskerProfileLoading) {
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px] px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">My Profile</h1>

        {!isEditing ? (
          <>
            <Card className="shadow-lg p-6 mb-8">
              <CardContent className="flex flex-col items-center text-center p-0">
                <Avatar className="w-24 h-24 mb-4 border-4 border-green-500">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || "User"} />
                  <AvatarFallback className="bg-green-200 text-green-800 text-3xl font-semibold">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon size={32} />}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{user.displayName || "Anonymous User"}</h2>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Mail size={18} /> {user.email}
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="mt-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white flex items-center gap-2"
                >
                  <Edit size={18} /> Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Tasker Profile Section */}
            <Card className="shadow-lg p-6 mb-8">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <Briefcase size={24} /> Tasker Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                {isTasker && taskerProfile ? (
                  <>
                    <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Info size={18} /> <strong>Bio:</strong> {taskerProfile.bio}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <DollarSign size={18} /> <strong>Hourly Rate:</strong> ₱{taskerProfile.hourlyRate.toLocaleString()}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <strong>Skills:</strong>
                      {taskerProfile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200 px-2 py-0.5 text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      onClick={openTaskerRegistrationModal}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 flex items-center justify-center gap-2 mt-4"
                    >
                      <Edit size={20} /> Edit Tasker Profile
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-700 dark:text-gray-300">
                      You are not yet registered as a Tasker. Become one to start earning!
                    </p>
                    <Button
                      onClick={openTaskerRegistrationModal}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg py-6 mt-4"
                    >
                      Become a Tasker
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* My Activities Section */}
            <Card className="shadow-lg p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">My Activities</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6 flex items-center justify-center gap-2"
                >
                  <LayoutDashboard size={20} /> View Dashboard
                </Button>
                <Button
                  onClick={() => navigate('/my-tasks')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
                >
                  View My Posted Tasks
                </Button>
                {isTasker && (
                  <Button
                    onClick={() => navigate('/my-offers')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 flex items-center justify-center gap-2"
                  >
                    <Briefcase size={20} /> View My Offers
                  </Button>
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
        ) : (
          <EditProfileSection
            onCancel={() => setIsEditing(false)}
            onSaveSuccess={() => setIsEditing(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;