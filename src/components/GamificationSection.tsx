import React from 'react';
import { Award } from 'lucide-react';

const GamificationSection: React.FC = () => {
  return (
    <section id="gamification" className="py-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg my-8 p-6 text-center">
      <h2 className="text-4xl font-bold text-[hsl(var(--primary-color))] mb-8">🏆 Earn Badges!</h2>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
        Complete tasks, get 5-star ratings, and be a fast responder to earn exclusive Tasko badges!
      </p>
      <div className="flex justify-center gap-6 flex-wrap">
        <div className="flex flex-col items-center text-center">
          <Award size={48} className="text-yellow-500 mb-2" />
          <p className="font-semibold text-gray-800 dark:text-gray-100">5-Star Rated</p>
          <span className="text-sm text-gray-600 dark:text-gray-400">Achieve perfect ratings</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <Award size={48} className="text-blue-500 mb-2" />
          <p className="font-semibold text-gray-800 dark:text-gray-100">Fast Responder</p>
          <span className="text-sm text-gray-600 dark:text-gray-400">Reply quickly to clients</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <Award size={48} className="text-purple-500 mb-2" />
          <p className="font-semibold text-gray-800 dark:text-gray-100">Task Master</p>
          <span className="text-sm text-gray-600 dark:text-gray-400">Complete many tasks</span>
        </div>
      </div>
    </section>
  );
};

export default GamificationSection;