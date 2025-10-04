import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TaskDetailPage from "./pages/TaskDetailPage";
import MyTasksPage from "./pages/MyTasksPage";
import FeaturesAndEarningsPage from "./pages/FeaturesAndEarningsPage";
import ProfilePage from "./pages/ProfilePage";
import FAQPage from "./pages/FAQPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import BrowseTaskersPage from "./pages/BrowseTaskersPage";
import TaskerProfileViewPage from "./pages/TaskerProfileViewPage";
import ChatPage from "./pages/ChatPage";
import MyOffersPage from "./pages/MyOffersPage";
import SettingsPage from "./pages/SettingsPage";
import TaskerDashboardPage from "./pages/TaskerDashboardPage";
import FinishSignInPage from "./pages/FinishSignInPage"; // New import
import { AuthProvider, useAuth } from "./hooks/use-auth"; // Import useAuth to get user for SupabaseProfileProvider
import { TasksProvider } from "./hooks/use-tasks";
import { ModalProvider } from "./components/ModalProvider";
import { PWAProvider } from "./hooks/use-pwa";
import { TaskerProfileProvider } from "./hooks/use-tasker-profile";
import { OffersProvider } from "./hooks/use-offers";
import { ChatProvider } from "./hooks/use-chat";
import React from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from "./components/theme-provider";
import { ChatSessionProvider } from "./hooks/use-chat-session";
import { SupabaseProfileProvider } from "./hooks/use-supabase-profile"; // New import

const queryClient = new QueryClient();

// A wrapper component to get the Firebase user from AuthProvider
const AppProviders = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return (
    <SupabaseProfileProvider firebaseUser={user}>
      {children}
    </SupabaseProfileProvider>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <AppProviders> {/* Wrap other providers with AppProviders */}
                <PWAProvider>
                  <TasksProvider>
                    <TaskerProfileProvider>
                      <ChatProvider>
                        <OffersProvider>
                          <ChatSessionProvider>
                            <ModalProvider>
                              <div className="min-h-screen w-full flex flex-col items-center">
                                <Routes>
                                  <Route path="/" element={<Index />} />
                                  <Route path="/tasks/:id" element={<TaskDetailPage />} />
                                  <Route path="/my-tasks" element={<MyTasksPage />} />
                                  <Route path="/my-offers" element={<MyOffersPage />} />
                                  <Route path="/features-earnings" element={<FeaturesAndEarningsPage />} />
                                  <Route path="/profile" element={<ProfilePage />} />
                                  <Route path="/settings" element={<SettingsPage />} />
                                  <Route path="/faq" element={<FAQPage />} />
                                  <Route path="/contact" element={<ContactPage />} />
                                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                                  <Route path="/terms" element={<TermsOfServicePage />} />
                                  <Route path="/browse-taskers" element={<BrowseTaskersPage />} />
                                  <Route path="/taskers/:id" element={<TaskerProfileViewPage />} />
                                  <Route path="/chat" element={<ChatPage />} />
                                  <Route path="/tasker-dashboard" element={<TaskerDashboardPage />} />
                                  <Route path="/finishSignIn" element={<FinishSignInPage />} /> {/* New route */}
                                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                                  <Route path="*" element={<NotFound />} />
                                </Routes>
                              </div>
                            </ModalProvider>
                          </ChatSessionProvider>
                        </OffersProvider>
                      </ChatProvider>
                    </TaskerProfileProvider>
                  </TasksProvider>
                </PWAProvider>
              </AppProviders>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
      <Toaster />
    </QueryClientProvider>
  );
};

export default App;