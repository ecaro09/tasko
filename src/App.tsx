import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TaskDetailPage from "./pages/TaskDetailPage";
import MyTasksPage from "./pages/MyTasksPage"; // Import MyTasksPage
import { AuthProvider } from "./hooks/use-auth";
import { TasksProvider } from "./hooks/use-tasks";
import { ModalProvider } from "./components/ModalProvider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <TasksProvider>
            <ModalProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/tasks/:id" element={<TaskDetailPage />} />
                <Route path="/my-tasks" element={<MyTasksPage />} /> {/* New route for MyTasksPage */}
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

export default App;