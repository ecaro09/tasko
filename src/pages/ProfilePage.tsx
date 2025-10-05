import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useTaskerProfile } from '@/hooks/use-tasker-profile';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, Mail, Edit, Briefcase, Settings as SettingsIcon, Phone, DollarSign, Star, ShieldCheck, Clock, XCircle, CheckCircle } from 'lucide-react'; // Added CheckCircle icon
import EditProfileSection from '@/components/EditProfileSection';
import { useModal } from '@/components/ModalProvider'; // Import useModal
import { Badge } from '@/components/ui/badge'; // Import Badge
import { useSupabaseProfile } from '@/hooks/use-supabase-profile'; // New import
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { useVerificationRequests } from '@/hooks/use-verification-requests'; // New import

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { profile, loadingProfile } = useSupabaseProfile(); // Get profile from useSupabaseProfile
  const { taskerProfile, isTasker, loading: taskerProfileLoading } = useTaskerProfile();
  const { verificationRequest, loading: verificationLoading, requestVerification, cancelVerificationRequest } = useVerificationRequests(); // Use verification hook
  const { openTaskerRegistrationModal } = useModal(); // Get the modal opener
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = React.useState(false);

  if (authLoading || loadingProfile || taskerProfileLoading || verificationLoading) { // Include loadingProfile and verificationLoading
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px] px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">My Profile</h1>
          <Card className="shadow-lg p-6 mb-8">
            <CardContent className="flex flex-col items-center text-center p-0">
              <Skeleton className="w-24 h-24 rounded-full mb-4" />
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-5 w-1/2 mb-1" />
              <Skeleton className="h-5 w-1/3 mb-4" />
              <Skeleton className="h-10 w-40 rounded-md" />
            </CardContent>
          </Card>

          <Card className="shadow-lg p-6">
            <CardHeader className="p-0 mb-4">
              <Skeleton className="h-7 w-2/3 mb-2" />
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
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
    : user.displayName || "Anonymous User";

  // Use profile.is_verified_tasker for the actual verification status
  const isUserVerified = profile?.is_verified_tasker; // This is the source of truth from Supabase profiles table
  const isPendingVerificationRequest = verificationRequest?.status === 'pending';
  const isRejectedVerificationRequest = verificationRequest?.status === 'rejected';

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px] px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">My Profile</h1>

        {!isEditing ? (
          <>
            <Card className="shadow-lg p-6 mb-8">
              <CardContent className="flex flex-col items-center text-center p-0">
                <Avatar className="w-24 h-24 mb-4 border-4 border-green-500">
                  <AvatarImage src={user.photoURL || profile?.avatar_url || undefined} alt={displayName} />
                  <AvatarFallback className="bg-green-200 text-green-800 text-3xl font-semibold">
                    {displayName.charAt(0).toUpperCase()}
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

                {/* Verification Status */}
                <div className="mt-4 flex items-center gap-2">
                  {isUserVerified ? ( // Use isUserVerified here
                    <Badge className="bg-green-500 text-white flex items-center gap-1">
                      <ShieldCheck size={16} /> Verified User
                    </Badge>
                  ) : isPendingVerificationRequest ? ( // Use isPendingVerificationRequest here
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200 flex items-center gap-1">
                      <Clock size={16} /> Pending Verification
                    </Badge>
                  ) : isRejectedVerificationRequest ? ( // Use isRejectedVerificationRequest here
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <XCircle size={16} /> Verification Rejected
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      Not Verified
                    </Badge>
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="mt-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white flex items-center gap-2"
                >
                  <Edit size={18} /> Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Verification Request Section */}
            <Card className="shadow-lg p-6 mb-8">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <ShieldCheck size={24} /> Account Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Get your account verified to build trust with clients and taskers. Verified users often receive more task opportunities.
                </p>
                {isUserVerified ? ( // Use isUserVerified here
                  <p className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-2">
                    <CheckCircle size={20} /> Your account is successfully verified!
                  </p>
                ) : isPendingVerificationRequest ? ( // Use isPendingVerificationRequest here
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={cancelVerificationRequest}
                      disabled={verificationLoading}
                      className="w-full sm:w-auto border-red-600 text-red-600 hover:bg-red-100 flex items-center gap-2"
                    >
                      <XCircle size={18} /> {verificationLoading ? 'Cancelling...' : 'Cancel Request'}
                    </Button>
                    <p className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-2">
                      <Clock size={20} /> Your verification request is pending review.
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={requestVerification}
                    disabled={verificationLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 flex items-center justify-center gap-2"
                  >
                    <ShieldCheck size={20} /> {verificationLoading ? 'Submitting...' : 'Request Verification'}
                  </Button>
                )}
                {isRejectedVerificationRequest && verificationRequest?.admin_notes && ( // Use isRejectedVerificationRequest here
                  <p className="text-red-500 text-sm italic">
                    Admin Notes: {verificationRequest.admin_notes}
                  </p>
                )}
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
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Bio:</h3>
                    <p className="text-gray-600 dark:text-gray-400">{taskerProfile.bio}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <DollarSign size={18} /> Hourly Rate:
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">₱{taskerProfile.hourlyRate.toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Star size={18} /> Skills:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {taskerProfile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200 px-3 py-1 rounded-full">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={openTaskerRegistrationModal}
                    className="mt-6 w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center gap-2"
                  >
                    <Edit size={18} /> Edit Tasker Profile
                  </Button>
                  <Button
                    onClick={() => navigate('/tasker-dashboard')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6 flex items-center justify-center gap-2 mt-4"
                  >
                    <Briefcase size={20} /> View Tasker Dashboard
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