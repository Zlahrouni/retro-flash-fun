
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
// import Board from "./pages/Board";
import Retro from "./pages/Retro";
import Icebreaker from "./pages/Icebreaker";
import RetroTypeSelection from "./pages/RetroTypeSelection";
import NotFound from "./pages/NotFound";
import UserJoin from "@/pages/UserJoin.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/retro" element={<RetroTypeSelection />} />
          <Route path="/retro/:retroId" element={<Retro />} />
          <Route path="/join/:retroId" element={<UserJoin />} />
          {/*<Route path="/board/:boardId" element={<Board />} />*/}
          <Route path="/icebreaker" element={<Icebreaker />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
