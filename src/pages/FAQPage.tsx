import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FAQPage: React.FC = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "How do I post a task?",
      answer: "To post a task, simply click the 'Post a Task' button on the homepage, describe your task, set your budget, and choose a category. You'll need to be logged in to post."
    },
    {
      question: "How do I become a Tasker?",
      answer: "Visit the 'Become a Tasker' page from the navigation menu to learn about the benefits and sign up to offer your services."
    },
    {
      question: "How are payments handled?",
      answer: "All payments are processed securely through the Tasko platform. Once a task is completed and approved, funds are released to the Tasker."
    },
    {
      question: "What if I have an issue with a task?",
      answer: "If you encounter any issues, please contact our support team through the 'Contact Us' page. We're here to help resolve disputes and ensure satisfaction."
    },
    {
      question: "Is Tasko available nationwide?",
      answer: "Tasko is currently focused on key cities in the Philippines, but we are rapidly expanding! Check the app for service availability in your area."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px]">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
          <ArrowLeft size={20} className="mr-2" /> Back
        </Button>
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">Frequently Asked Questions</h1>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          {faqs.map((faq, index) => (
            <div key={index} className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:mb-0 last:pb-0">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{faq.question}</h2>
              <p className="text-gray-700 dark:text-gray-300">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQPage;