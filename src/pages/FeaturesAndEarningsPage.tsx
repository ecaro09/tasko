import React from 'react';
import Header from '@/components/Header';
import AppFooter from '@/components/AppFooter';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { useAuth } from '@/hooks/use-auth';

const FeaturesAndEarningsPage: React.FC = () => {
  const { isAuthenticated, logOut } = useAuth();

  const handleSignOut = async () => {
    await logOut();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <Header isAuthenticated={isAuthenticated} onSignOut={handleSignOut} />
      <main className="flex-grow container mx-auto p-4 pt-[80px]"> {/* Added padding-top for fixed header */}
        {/* Header for the content */}
        <header className="p-4 bg-green-600 text-white text-center rounded-b-2xl shadow-md mb-6">
          <h1 className="text-3xl font-bold">Tasko</h1>
          <p className="text-sm">Hire skilled people near you. Get things done fast.</p>
        </header>

        {/* Features Section */}
        <section className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md mb-6">
          <h2 className="text-2xl font-semibold text-green-700 dark:text-green-400 mb-4">📌 Core Features</h2>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
            <li>User registration (Clients & Taskers)</li>
            <li>Profile verification (ID upload, skills badge)</li>
            <li>Job posting & task browsing</li>
            <li>Location-based matching with map integration</li>
            <li>In-app chat + call option (masked numbers)</li>
            <li>Task scheduling & real-time updates</li>
            <li>Ratings & reviews</li>
            <li>Push notifications (job alerts, status updates)</li>
            <li>Secure payments via GCash, Maya, Credit/Debit</li>
            <li>E-receipts & history tracking</li>
          </ul>
        </section>

        {/* Security Section */}
        <section className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md mb-6">
          <h2 className="text-2xl font-semibold text-green-700 dark:text-green-400 mb-4">🔒 Security Features</h2>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
            <li>Two-factor authentication (2FA)</li>
            <li>End-to-end encrypted chat</li>
            <li>Secure payment escrow (Tasko holds funds until job is done)</li>
            <li>Tasker background & ID verification</li>
            <li>Fraud detection & reporting system</li>
          </ul>
        </section>

        {/* Income Model Section */}
        <section className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md mb-6">
          <h2 className="text-2xl font-semibold text-green-700 dark:text-green-400 mb-4">💰 How Tasko Earns</h2>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
            <li><b>Commission Fee</b>: 10–20% from each completed task</li>
            <li><b>Service Fee</b>: ₱50–100 charged to clients per booking</li>
            <li><b>Tasko Pro Subscription</b>: ₱299/month for Taskers (lower fees + higher visibility)</li>
            <li><b>Boosted Listings</b>: ₱20–50 to feature jobs or Taskers</li>
            <li><b>Verification Fee</b>: ₱99 for "Pro Verified" skilled workers</li>
            <li><b>Referral Rewards</b>: Growth strategy (only paid after successful jobs)</li>
          </ul>
        </section>
      </main>

      {/* Footer with app store logos */}
      <footer className="p-4 bg-gray-100 dark:bg-gray-800 text-center text-sm text-gray-600 dark:text-gray-400 mt-6 rounded-t-2xl shadow-inner">
        <p>© {new Date().getFullYear()} Tasko - Get Things Done</p>
        <div className="flex justify-center mt-2 space-x-3">
          <img src="/google-play.png" alt="Google Play" className="h-8" />
          <img src="/app-store.png" alt="App Store" className="h-8" />
        </div>
      </footer>
      <MadeWithDyad />
    </div>
  );
};

export default FeaturesAndEarningsPage;