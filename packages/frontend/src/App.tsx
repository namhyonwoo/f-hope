import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import SocialSignupPage from "./pages/SocialSignupPage"; // Import SocialSignupPage
import { Dashboard } from "./components/Dashboard"; // Import Dashboard component
import { useEffect } from "react";

const queryClient = new QueryClient();

// Component to handle Google OAuth callback
const GoogleOAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const socialSignupToken = params.get('socialSignupToken'); // Check for socialSignupToken

    console.log('GoogleOAuthCallback: location.search', location.search);
    console.log('GoogleOAuthCallback: extracted token', token);
    console.log('GoogleOAuthCallback: extracted socialSignupToken', socialSignupToken);

    if (token) {
      localStorage.setItem('accessToken', token);
      console.log('GoogleOAuthCallback: token stored in localStorage');
      navigate('/dashboard'); // Redirect to dashboard or home page after successful login
    } else if (socialSignupToken) {
      console.log('GoogleOAuthCallback: socialSignupToken found, redirecting to social-signup');
      navigate(`/social-signup?token=${socialSignupToken}`); // Redirect to social signup page
    } else {
      console.log('GoogleOAuthCallback: no token or socialSignupToken found, redirecting to login');
      navigate('/'); // Redirect to home page (login page)
    }
  }, [location, navigate]);

  return <div>Loading...</div>; // Or a loading spinner
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/social-signup" element={<SocialSignupPage />} /> {/* Add social signup route */}
          <Route path="/dashboard" element={<HomePage />} /> {/* Render HomePage for dashboard */}
          <Route path="/auth/google/callback" element={<GoogleOAuthCallback />} /> {/* Google OAuth callback route */}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
