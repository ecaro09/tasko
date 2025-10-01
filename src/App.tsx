import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./hooks/use-auth"; // Import AuthProvider
import { ChatProvider } from "./hooks/use-chat"; // Import ChatProvider
import ChatPage from "./pages/ChatPage"; // Import ChatPage

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider> {/* Wrap with AuthProvider */}
          <ChatProvider> {/* Wrap with ChatProvider */}
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/chat" element={<ChatPage />} /> {/* Add ChatPage route */}
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ChatProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;