import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import SearchPage from "@/pages/searchPage";
import ListingDetail from "@/pages/listing-detail";
import UserDashboard from "@/pages/user-dashboard";
import PrivateSubscriptionPage from "@/pages/PrivateSubscriptionPage";
import LandingPage from "@/pages/LandingPage";
import Header from "@/components/layout/Header";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/SearchPage" component={SearchPage} />
      <Route path="/listing/:postId" component={ListingDetail} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/LandingPage" component={LandingPage} />
      <ProtectedRoute path="/dashboard" component={UserDashboard} />
      <Route
        path="/dashboard/private-subscription"
        component={PrivateSubscriptionPage}
      />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
