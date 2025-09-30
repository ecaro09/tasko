import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TaskDetailPage from "./pages/TaskDetailPage";
import MyTasksPage from "./pages/MyTasksPage";
import FeaturesAndEarningsPage from "./pages/FeaturesAndEarningsPage";
import { AuthProvider } from "./hooks/use-auth";
import { TasksProvider } from "./hooks/use-tasks";
import { ModalProvider } from "./components/ModalProvider";
import React from "react"; // Import React for useState

const queryClient = new QueryClient();

const App = () => {
  // These states will be managed in Index.tsx and passed to TasksProvider via context
  // For now, we'll keep them here to satisfy TasksProvider's props, but Index.tsx will control them.
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            {/* TasksProvider now accepts searchTerm and selectedCategory */}
            <TasksProvider searchTerm={searchTerm} selectedCategory={selectedCategory}>
              <ModalProvider>
                <Routes>
                  {/* Pass setSearchTerm and setSelectedCategory to Index */}
                  <Route path="/" element={<Index />} />
                  <Route path="/tasks/:id" element={<TaskDetailPage />} />
                  <Route path="/my-tasks" element={<MyTasksPage />} />
                  <Route path="/features-earnings" element={<FeaturesAndEarningsPage />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ModalProvider>
            </TasksProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;