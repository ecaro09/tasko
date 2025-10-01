import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/use-auth';
import { useTaskerProfile } from '@/hooks/use-tasker-profile';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { isTasker, loading: taskerProfileLoading } = useTaskerProfile();

  if (authLoading || taskerProfileLoading) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Loading dashboard...</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 pt-[60px] px-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[hsl(var(--primary-color))]">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to view your dashboard.</p>
            <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 text-white">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px]">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
          <ArrowLeft size={20} className="mr-2" /> Back
        </Button>
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center flex items-center justify-center gap-3">
          <LayoutDashboard size={36} /> Your Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-lg p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">Client Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                As a client, you can manage the tasks you've posted and review offers from taskers.
              </p>
              <Link to="/my-tasks">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6">
                  View My Posted Tasks
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-lg p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">Tasker Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              {isTasker ? (
                <>
                  <p className="text-gray-700 dark:text-gray-300">
                    As a tasker, you can manage your profile and track the offers you've made.
                  </p>
                  <Link to="/my-offers">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6">
                      View My Offers
                    </Button>
                  </Link>
                  <Link to="/profile">
                    <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white text-lg py-6 mt-2">
                      Edit Tasker Profile
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-gray-700 dark:text-gray-300">
                    Become a tasker to start earning by completing tasks!
                  </p>
                  <Link to="/features-earnings">
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg py-6">
                      Become a Tasker
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;