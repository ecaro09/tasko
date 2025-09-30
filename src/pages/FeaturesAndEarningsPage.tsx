import React from 'react';
import Header from '@/components/Header';
import AppFooter from '@/components/AppFooter';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { Link } from 'react-router-dom'; // Assuming navigation might be needed later
import { useAuth } from '@/hooks/use-auth'; // To pass isAuthenticated and onSignOut to Header

const FeaturesAndEarningsPage: React.FC = () => {
  const { isAuthenticated, logOut } = useAuth();

  const handleSignOut = async () => {
    await logOut();
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <Header isAuthenticated={isAuthenticated} onSignOut={handleSignOut} />
      <main className="flex-grow container mx-auto px-4 py-7 md:py-10 pt-[80px]"> {/* Added padding-top for fixed header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">Tasko — Features & Earnings Model</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1.5">
              Philippines-focused TaskRabbit clone with clear monetization strategy.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 mt-6">
          {/* Features */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Core Features</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-md border border-dashed border-green-200 dark:border-green-700 bg-green-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200">Auth: Phone, Email, Social logins</div>
              <div className="p-3 rounded-md border border-dashed border-green-200 dark:border-green-700 bg-green-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200">KYC: ID + Selfie; extra verification for high-end Taskers</div>
              <div className="p-3 rounded-md border border-dashed border-green-200 dark:border-green-700 bg-green-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200">Escrow payments via GCash, Maya, Bank, COD</div>
              <div className="p-3 rounded-md border border-dashed border-green-200 dark:border-green-700 bg-green-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200">Task lifecycle: Post → Accept → In Progress → Completed</div>
              <div className="p-3 rounded-md border border-dashed border-green-200 dark:border-green-700 bg-green-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200">Encrypted chat, hide numbers/emails</div>
              <div className="p-3 rounded-md border border-dashed border-green-200 dark:border-green-700 bg-green-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200">GPS tracking + emergency button</div>
              <div className="p-3 rounded-md border border-dashed border-green-200 dark:border-green-700 bg-green-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200">Ratings & reviews + report system</div>
              <div className="p-3 rounded-md border border-dashed border-green-200 dark:border-green-700 bg-green-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200">Admin dashboard: earnings, payouts, disputes</div>
            </div>
          </section>

          {/* Earnings */}
          <aside className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Ways Tasko Earns</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-md border border-dashed border-green-200 dark:border-green-700 bg-green-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200">1. Commission: 10–20% per completed job</div>
              <div className="p-3 rounded-md border border-dashed border-green-200 dark:border-green-700 bg-green-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200">2. Service Fee: Flat ₱50 per client task</div>
              <div className="p-3 rounded-md border border-dashed border-green-200 dark:border-green-700 bg-green-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200">3. Tasko Pro: ₱299/month for Taskers (lower cut, visibility)</div>
              <div className="p-3 rounded-md border border-dashed border-green-200 dark:border-green-700 bg-green-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200">4. Boosted Listings & Featured Taskers</div>
              <div className="p-3 rounded-md border border-dashed border-green-200 dark:border-green-700 bg-green-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200">5. Ads & brand partnerships (future)</div>
              <div className="p-3 rounded-md border border-dashed border-green-200 dark:border-green-700 bg-green-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200">6. Referral bonus system (₱100 after first job)</div>
              <div className="p-3 rounded-md border border-dashed border-green-200 dark:border-green-700 bg-green-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200">7. High-end verification fee (₱99)</div>
            </div>
          </aside>
        </div>

        {/* Income Projection */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mt-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Sample Income Projection (Monthly)</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm mt-3">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="border border-gray-300 dark:border-gray-600 p-2 text-center">Scenario</th>
                  <th className="border border-gray-300 dark:border-gray-600 p-2 text-center">Jobs/Month</th>
                  <th className="border border-gray-300 dark:border-gray-600 p-2 text-center">Avg. Job Value</th>
                  <th className="border border-gray-300 dark:border-gray-600 p-2 text-center">Commission (15%)</th>
                  <th className="border border-gray-300 dark:border-gray-600 p-2 text-center">Service Fees</th>
                  <th className="border border-gray-300 dark:border-gray-600 p-2 text-center">Subscriptions</th>
                  <th className="border border-gray-300 dark:border-gray-600 p-2 text-center">Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">Small</td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">500</td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">₱1,000</td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">₱75,000</td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">₱25,000</td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">₱29,900</td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-center font-bold">₱129,900</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">Medium</td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">1,000</td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">₱1,000</td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">₱150,000</td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">₱50,000</td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">₱59,800</td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-center font-bold">₱259,800</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">Growth</td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">5,000</td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">₱1,000</td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">₱750,000</td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">₱250,000</td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">₱149,500</td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-center font-bold">₱1,149,500</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Note: These are estimates. Actual income may vary based on jobs, Tasker signups, and premium boosts.
          </p>
        </section>
      </main>

      <AppFooter />
      <MadeWithDyad />
    </div>
  );
};

export default FeaturesAndEarningsPage;