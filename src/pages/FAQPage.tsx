import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { HelpCircle, ArrowLeft } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQPage: React.FC = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "How do I post a task?",
      answer: "To post a task, simply click the 'Post a Task' button on the homepage, fill in the details, and set your budget. Taskers will then send you offers."
    },
    {
      question: "How do I become a Tasker?",
      answer: "Visit the 'Become a Tasker' page from the navigation menu. You'll need to sign up and complete your profile to start receiving task offers."
    },
    {
      question: "Is my payment secure?",
      answer: "Yes, all payments on Tasko are processed securely through our platform. We use trusted payment gateways to ensure your financial information is protected."
    },
    {
      question: "What if I'm not satisfied with a task?",
      answer: "If you're not satisfied, please contact our support team immediately. We have a dispute resolution process to help address any issues and ensure fair outcomes."
    },
    {
      question: "Can I cancel a task?",
      answer: "Tasks can be canceled, but cancellation policies may vary depending on the task's status and the agreement with the tasker. Please review our terms of service for more details."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px]">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
          <ArrowLeft size={20} className="mr-2" /> Back
        </Button>
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center flex items-center justify-center gap-3">
          <HelpCircle size={36} /> Frequently Asked Questions
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-12 text-center">
          Find answers to common questions about using Tasko.
        </p>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg font-semibold text-gray-800 dark:text-gray-100 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 dark:text-gray-300 text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;