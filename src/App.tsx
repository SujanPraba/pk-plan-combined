import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PokerProvider } from "@/contexts/PokerContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RetroProvider } from './contexts/RetroContext';
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Session from "./pages/Session";
import RetroSession from './pages/RetroSession';
import JiraCallback from "./pages/auth/jira/callback";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from './contexts/SessionContext';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <SessionProvider>
          <Router>
            <PokerProvider>
              <RetroProvider>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/session" element={<Session />} />
                  <Route path="/retro" element={<RetroSession />} />
                  <Route path="/api/jira/auth/callback" element={<JiraCallback />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </RetroProvider>
            </PokerProvider>
          </Router>
        </SessionProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
