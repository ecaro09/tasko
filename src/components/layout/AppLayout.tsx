import React from 'react';
import AppSidebar from '@/components/layout/AppSidebar';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/mobile-nav'; // Adjusted path
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1"> {/* Replaced SidebarInset with a simple div */}
          <Header />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20">{children}</main>
          <MobileNav />
        </div>
      </div>
      <Toaster />
      <Sonner />
    </AuthProvider>
  );
}