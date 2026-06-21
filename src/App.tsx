import { Switch, Route, Router as WouterRouter, Redirect } from 'wouter';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import ChatBot from "@/components/ChatBot";
import SiteTutorial from "@/components/SiteTutorial";
import AuthGate from "@/components/AuthGate";
import RootLayout from "@/components/layout/RootLayout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Catering from "@/pages/Catering";
import Ushering from "@/pages/Ushering";
import EventPlanning from "@/pages/EventPlanning";
import Gallery from "@/pages/Gallery";
import Shop from "@/pages/Shop";
import Contact from "@/pages/Contact";
import Booking from "@/pages/Booking";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Receipt from "@/pages/Receipt";
import Account from "@/pages/Account";
import Admin from "@/pages/Admin";
import StaffSignup from "@/pages/StaffSignup";
import SignInPage from "@/pages/SignInPage";
import SignUpPage from "@/pages/SignUpPage";
import LoginPortal from "@/pages/LoginPortal";
import StaffSignIn from "@/pages/StaffSignIn";
import StaffHub from "@/pages/StaffHub";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import NotFound from "@/pages/not-found";
import { SERVICE_MENU } from "@/lib/serviceMenu";

const queryClient = new QueryClient();

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

/** Simple replacement for Clerk's <Show when="signed-in">: blocks a route
 *  entirely behind a real sign-in redirect (used for pages that don't make
 *  sense to browse as a guest at all, like Cart/Account/Admin). */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <div className="min-h-screen bg-background" />;
  if (!isSignedIn) {
    const redirect = encodeURIComponent(window.location.pathname);
    return <Redirect to={`/sign-in?redirect=${redirect}`} />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/login" component={LoginPortal} />
      <Route path="/sign-in" component={SignInPage} />
      <Route path="/sign-up" component={SignUpPage} />
      <Route path="/staff/sign-in" component={StaffSignIn} />

      <Route path="/receipt/:orderId">
        {(params) => (
          <RequireAuth>
            <Receipt orderId={params.orderId} />
          </RequireAuth>
        )}
      </Route>

      <Route>
        <RootLayout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/about" component={About} />
            <Route path="/catering" component={Catering} />
            <Route path="/ushering" component={Ushering} />
            <Route path="/event-planning" component={EventPlanning} />
            <Route path="/gallery" component={Gallery} />
            <Route path="/shop" component={Shop} />
            <Route path="/contact" component={Contact} />

            {/* 14 service category pages, generated from the single SERVICE_MENU
                source so they always match what's shown in the Navbar dropdown. */}
            {SERVICE_MENU.map((item) => (
              <Route key={item.path} path={item.path} component={item.component} />
            ))}

            {/* Booking & Checkout stay fully browsable for guests; only the
                final action is gated, via an in-page modal rather than a
                hard redirect away from the page they were looking at. */}
            <Route path="/booking">
              <AuthGate actionLabel="book a service">
                <Booking />
              </AuthGate>
            </Route>
            <Route path="/checkout">
              <AuthGate actionLabel="complete checkout">
                <Checkout />
              </AuthGate>
            </Route>

            <Route path="/cart">
              <RequireAuth><Cart /></RequireAuth>
            </Route>
            <Route path="/account">
              <RequireAuth><Account /></RequireAuth>
            </Route>
            <Route path="/admin">
              <RequireAuth><Admin /></RequireAuth>
            </Route>
            <Route path="/staff-signup">
              <RequireAuth><StaffSignup /></RequireAuth>
            </Route>
            <Route path="/team">
              <RequireAuth><StaffHub /></RequireAuth>
            </Route>
            <Route path="/terms" component={Terms} />
            <Route path="/privacy" component={Privacy} />

            <Route component={NotFound} />
          </Switch>
        </RootLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <TooltipProvider>
              <AppRoutes />
              <ThemeSwitcher />
              <ChatBot />
              <SiteTutorial />
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </WouterRouter>
  );
}

export default App;
