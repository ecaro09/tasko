import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    // In a real application, you would send this data to a backend API.
    // For this example, we'll just simulate a successful submission.
    console.log({ name, email, subject, message });

    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

    toast.success("Your message has been sent successfully!");
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px] px-4">
      <div className="container mx-auto max-w-4xl">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
          &larr; Back
        </Button>
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">Contact Us</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-12 text-center max-w-2xl mx-auto">
          Have questions, feedback, or need support? Reach out to us using the form below or through our contact details.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-lg p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">Send Us a Message</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                We'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Your Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john.doe@example.com"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Inquiry about services"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    rows={5}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 text-white">
                  {isLoading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-lg p-6 bg-green-50 dark:bg-gray-800">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">Our Contact Details</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                You can also reach us directly.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-6 text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-4">
                <Mail size={24} className="text-green-600" />
                <div>
                  <p className="font-semibold">Email Support</p>
                  <a href="mailto:support@tasko.ph" className="hover:underline text-green-700 dark:text-green-400">support@tasko.ph</a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Phone size={24} className="text-green-600" />
                <div>
                  <p className="font-semibold">Phone Support</p>
                  <a href="tel:+639123456789" className="hover:underline text-green-700 dark:text-green-400">+63 912 345 6789</a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <MapPin size={24} className="text-green-600" />
                <div>
                  <p className="font-semibold">Our Office</p>
                  <p>123 Tasko Avenue, Makati City, Philippines</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;