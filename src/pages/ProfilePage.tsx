import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, LogOut, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Loading profile...</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 pt-[80px] px-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">Please log in to view your profile.</p>
        <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 text-white">
          Go to Home
        </Button>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px]">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">My Profile</h1>

        <Card className="shadow-lg mb-8">
          <CardHeader className="flex flex-col items-center p-6">
            <Avatar className="w-24 h-24 mb-4 border-4 border-green-500">
              <AvatarImage src={user.photoURL || "https://randomuser.me/api/portraits/lego/1.jpg"} alt={user.displayName || "User"} />
              <AvatarFallback className="bg-green-200 text-green-800 text-3xl font-bold">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User size={40} />}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{user.displayName || "Anonymous User"}</CardTitle>
            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-2">
              <Mail size={18} /> {user.email}
            </p>
          </CardHeader>
          <CardContent className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center gap-2">
                <Edit size={20} /> Edit Profile (Coming Soon)
              </Button>
              <Button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center gap-2">
                <LogOut size={20} /> Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">My Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => navigate('/my-tasks')} variant="outline" className="w-full justify-start border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
              My Posted Tasks
            </Button>
            <Button variant="outline" className="w-full justify-start border-gray-400 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
              My Accepted Tasks (Coming Soon)
            </Button>
            <Button variant="outline" className="w-full justify-start border-gray-400 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
              My Reviews (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;