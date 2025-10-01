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
import MyOffersPage from "./pages/MyOffersPage"; // New import
import { AuthProvider } from "./hooks/use-auth";
import { TasksProvider } from "./hooks/use-tasks";
import { ModalProvider } from "./components/ModalProvider";
import { PWAProvider } from "./hooks/use-pwa";
import { TaskerProfileProvider } from "./hooks/use-tasker-profile";
import { OffersProvider } from "./hooks/use-offers";
import { ChatProvider } from "./hooks/use-chat"; // New import
import React from "react";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <PWAProvider>
              <TasksProvider>
                <TaskerProfileProvider>
                  <OffersProvider>
                    <ChatProvider> {/* Wrap ModalProvider with ChatProvider */}
                      <ModalProvider>
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/tasks/:id" element={<TaskDetailPage />} />
                          <Route path="/my-tasks" element={<MyTasksPage />} />
                          <Route path="/my-offers" element={<MyOffersPage />} />
                          <Route path="/features-earnings" element={<FeaturesAndEarningsPage />} />
                          <Route path="/profile" element={<ProfilePage />} />
                          <Route path="/faq" element={<FAQPage />} />
                          <Route path="/contact" element={<ContactPage />} />
                          <Route path="/privacy" element={<PrivacyPolicyPage />} />
                          <Route path="/terms" element={<TermsOfServicePage />} />
                          <Route path="/browse-taskers" element={<BrowseTaskersPage />} />
                          <Route path="/taskers/:id" element={<TaskerProfileViewPage />} />
                          <Route path="/chat" element={<ChatPage />} />
                          <Route path="/chat/:conversationId" element={<ChatPage />} /> {/* New route for specific conversation */}
                          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </ModalProvider>
                    </ChatProvider>
                  </OffersProvider>
                </TaskerProfileProvider>
              </TasksProvider>
            </PWAProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;