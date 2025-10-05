import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useTaskerProfile } from '@/hooks/use-tasker-profile';
import { useSupabaseProfile } from '@/hooks/use-supabase-profile';
import { useTasks } from '@/hooks/use-tasks'; // Import useTasks
import { useOffers } from '@/hooks/use-offers'; // Import useOffers
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, Mail, Edit, Briefcase, Settings as SettingsIcon, Phone, CheckCircle, ListTodo, Star, DollarSign, MapPin, Tag, MessageSquare } from 'lucide-react'; // Added MessageSquare
import EditProfileSection from '@/components/EditProfileSection';
import EditTaskerProfileSection from '@/components/EditTaskerProfileSection'; // Import the new component
import { Badge } from '@/components/ui/badge';
import { DEFAULT_AVATAR_URL, DEFAULT_TASK_IMAGE_URL } from '@/utils/image-placeholders'; // Import DEFAULT_TASK_IMAGE_URL
import { cn } from '@/lib/utils';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { isTasker, taskerProfile, loading: taskerProfileLoading } = useTaskerProfile();
  const { profile, loadingProfile } = useSupabaseProfile();
  const { tasks, loading: tasksLoading } = useTasks(); // Fetch all tasks
  const { offers, loading: offersLoading } = useOffers(); // Fetch all offers
  const navigate = useNavigate();
  const [isEditingGeneral, setIsEditingGeneral] = React.useState(false);
  const [isEditingTasker, setIsEditingTasker] = React.useState(false);

  const isLoading = authLoading || taskerProfileLoading || loadingProfile || tasksLoading || offersLoading;

  if (isLoading) {
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

  const userPostedTasks = tasks.filter(task => task.posterId === user.id);
  const userMadeOffers = offers.filter(offer => offer.taskerId === user.id);

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

            {/* My Posted Tasks Summary */}
            <Card className="shadow-lg p-6 mb-8">
              <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <ListTodo size={24} /> My Posted Tasks ({userPostedTasks.length})
                </CardTitle>
                <Button variant="link" onClick={() => navigate('/my-tasks')} className="text-green-600 hover:text-green-700 p-0 h-auto">
                  View All
                </Button>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                {userPostedTasks.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">You haven't posted any tasks yet.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {userPostedTasks.slice(0, 3).map(task => ( // Show up to 3 tasks
                      <Card key={task.id} className="p-3 shadow-sm flex items-center gap-3">
                        <img
                          src={task.imageUrl || DEFAULT_TASK_IMAGE_URL}
                          alt={task.title}
                          className="w-16 h-16 object-cover rounded-md"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_TASK_IMAGE_URL;
                            e.currentTarget.onerror = null;
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 dark:text-gray-100">{task.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <MapPin size={14} /> {task.location}
                          </p>
                          <p className="text-sm font-bold text-green-600">₱{task.budget.toLocaleString()}</p>
                        </div>
                        <Badge className={cn(
                          "text-xs",
                          task.status === 'open' && 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
                          task.status === 'assigned' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200',
                          task.status === 'completed' && 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200',
                          task.status === 'cancelled' && 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                        )}>
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </Badge>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* My Offers Summary (only if user is a tasker) */}
            {isTasker && (
              <Card className="shadow-lg p-6 mb-8">
                <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <Briefcase size={24} /> My Offers ({userMadeOffers.length})
                  </CardTitle>
                  <Button variant="link" onClick={() => navigate('/my-offers')} className="text-green-600 hover:text-green-700 p-0 h-auto">
                    View All
                  </Button>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  {userMadeOffers.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">You haven't made any offers yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {userMadeOffers.slice(0, 3).map(offer => ( // Show up to 3 offers
                        <Card key={offer.id} className="p-3 shadow-sm flex items-center gap-3">
                          <Avatar className="w-12 h-12 border-2 border-blue-500">
                            <AvatarImage
                              src={offer.taskerAvatar || DEFAULT_AVATAR_URL}
                              alt={offer.taskerName}
                              onError={(e) => {
                                e.currentTarget.src = DEFAULT_AVATAR_URL;
                                e.currentTarget.onerror = null;
                              }}
                            />
                            <AvatarFallback className="bg-blue-200 text-blue-800 text-md font-semibold">
                              {offer.taskerName ? offer.taskerName.charAt(0).toUpperCase() : <UserIcon size={16} />}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-100">Offer for {offer.taskId.substring(0, 8)}...</h4> {/* Placeholder for task title */}
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                              <MessageSquare size={14} /> {offer.message.substring(0, 30)}{offer.message.length > 30 ? '...' : ''}
                            </p>
                            <p className="text-sm font-bold text-blue-600">₱{offer.offerAmount.toLocaleString()}</p>
                          </div>
                          <Badge className={cn(
                            "text-xs",
                            offer.status === 'pending' && 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
                            offer.status === 'accepted' && 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200',
                            offer.status === 'rejected' && 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200',
                            offer.status === 'withdrawn' && 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                          )}>
                            {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                          </Badge>
                        </Card>
                      ))}
                    </div>
                  )}
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