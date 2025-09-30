import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TaskDetailPage from "./pages/TaskDetailPage";
import MyTasksPage from "./pages/MyTasksPage";
import FeaturesAndEarningsPage from "./pages/FeaturesAndEarningsPage";
import { AuthProvider } from "./hooks/use-auth"; // Corrected import for AuthProvider
import { TasksProvider } from "./hooks/use-tasks";
import { ModalProvider } from "./components/ModalProvider";
import { PWAProvider } from "./hooks/use-pwa";
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
                <ModalProvider>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/tasks/:id" element={<TaskDetailPage />} />
                    <Route path="/my-tasks" element={<MyTasksPage />} />
                    <Route path="/features-earnings" element={<FeaturesAndEarningsPage />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ModalProvider>
              </TasksProvider>
            </PWAProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;