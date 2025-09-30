import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignup: (name: string, email: string, phone: string, password: string, userType: string) => void;
  onShowLogin: () => void;
}

const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose, onSignup, onShowLogin }) => {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [userType, setUserType] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignup(name, email, phone, password, userType);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join Tasko</DialogTitle>
          <DialogDescription>
            Create your account to start using Tasko.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="signupName">Full Name</Label>
            <Input
              id="signupName"
              type="text"
              placeholder="Juan Dela Cruz"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="signupEmail">Email</Label>
            <Input
              id="signupEmail"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="signupPhone">Phone Number</Label>
            <Input
              id="signupPhone"
              type="tel"
              placeholder="+63 9XX XXX XXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="signupPassword">Password</Label>
            <Input
              id="signupPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="userType">I want to:</Label>
            <Select onValueChange={setUserType} value={userType} required>
              <SelectTrigger id="userType">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">Hire Taskers</SelectItem>
                <SelectItem value="tasker">Become a Tasker</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Create Account</Button>
        </form>
        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Button variant="link" onClick={onShowLogin} className="p-0 h-auto text-green-600 hover:text-green-700">
            Login
          </Button>
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default SignupModal;