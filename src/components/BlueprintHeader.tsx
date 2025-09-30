import React from 'react';
import { MountainIcon } from 'lucide-react'; // Using Lucide React for the icon

const BlueprintHeader: React.FC = () => {
  return (
    <header className="px-4 lg:px-6 h-14 flex items-center">
      <a className="flex items-center justify-center" href="#">
        <MountainIcon className="h-6 w-6" />
        <span className="sr-only">Acme Inc</span>
      </a>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        <a className="text-sm font-medium hover:underline underline-offset-4" href="#">
          Features
        </a>
        <a className="text-sm font-medium hover:underline underline-offset-4" href="#">
          Pricing
        </a>
        <a className="text-sm font-medium hover:underline underline-offset-4" href="#">
          About
        </a>
        <a className="text-sm font-medium hover:underline underline-offset-4" href="#">
          Contact
        </a>
      </nav>
    </header>
  );
};

export default BlueprintHeader;