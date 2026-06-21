import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./routes/index";
import AuthPage from "./routes/auth";

// Asynchronous route imports using React.lazy
const Collaborate = lazy(() => import("./routes/collaborate"));
const Dashboard = lazy(() => import("./routes/dashboard"));
const Explore = lazy(() => import("./routes/explore"));
const PlannerMulti = lazy(() => import("./routes/planner-multi"));
const PlannerSingle = lazy(() => import("./routes/planner-single"));
const WeekendTrips = lazy(() => import("./routes/weekend-trips"));
const Profile = lazy(() => import("./routes/profile"));
const SettingsPage = lazy(() => import("./routes/settings"));
const Results = lazy(() => import("./routes/results"));
const Pricing = lazy(() => import("./routes/pricing"));
const Privacy = lazy(() => import("./routes/privacy"));
const Terms = lazy(() => import("./routes/terms"));
const Cookies = lazy(() => import("./routes/cookies"));
const About = lazy(() => import("./routes/about"));
const Careers = lazy(() => import("./routes/careers"));
const Feedback = lazy(() => import("./routes/feedback"));
const TripDetails = lazy(() => import("./routes/trip-details"));
const TripType = lazy(() => import("./routes/trip-type"));
const Trips = lazy(() => import("./routes/trips"));
const CollaborativeTrip = lazy(() => import("./routes/collaborative-trip"));
const JoinTrip = lazy(() => import("./routes/join-trip"));
const CollabRoom = lazy(() => import("@/components/collabRoom/CollabRoom"));
const PublicGallery = lazy(() => import("./components/PublicGallery"));
const PassportPage = lazy(() => import("./routes/passport"));

// Admin Routes
const AdminDashboardPage = lazy(() => import("./routes/admin/index"));
const AdminLoginPage = lazy(() => import("./routes/admin/login"));
const AdminUsersPage = lazy(() => import("./routes/admin/users"));
const AdminTripsPage = lazy(() => import("./routes/admin/trips"));
const AdminReviewsPage = lazy(() => import("./routes/admin/reviews"));
const AdminPollsPage = lazy(() => import("./routes/admin/polls"));
const AdminNotificationsPage = lazy(() => import("./routes/admin/notifications"));
const AdminConfigPage = lazy(() => import("./routes/admin/config"));
const AdminJobApplicationsPage = lazy(() => import("./routes/admin/job-applications"));
const AdminChatbotPage = lazy(() => import("./routes/admin/chatbot"));
const AdminFeedbackPage = lazy(() => import("./routes/admin/feedback"));
const AdminFrontendAgentPage = lazy(() => import("./routes/admin/ai/frontend-agent"));
const AdminBackendAgentPage = lazy(() => import("./routes/admin/ai/backend-agent"));
const AdminMarketingAgentPage = lazy(() => import("./routes/admin/ai/marketing-agent"));
const AdminTestingAgentPage = lazy(() => import("./routes/admin/ai/testing-agent"));
const AdminPromptLibraryPage = lazy(() => import("./routes/admin/ai/prompt-library"));
const AdminAiContentEnginePage = lazy(() => import("./routes/admin/ai/content-engine"));

// Yatra Module
const YatraHub = lazy(() => import("./routes/yatra/index"));
const YatraDetail = lazy(() => import("./routes/yatra/details"));
const YatraPlanner = lazy(() => import("./routes/yatra/plan"));
const YatraKit = lazy(() => import("./routes/yatra/kit"));
const YatraShop = lazy(() => import("./routes/yatra/shop"));

// Commerce Routes
const CartPage = lazy(() => import("./routes/cart"));
const CheckoutPage = lazy(() => import("./routes/checkout"));
const OrdersPage = lazy(() => import("./routes/orders/index"));
const OrderDetailPage = lazy(() => import("./routes/orders/detail"));

import { ProtectedRoute } from "./components/ProtectedRoute";
import { Chatbot } from "./components/Chatbot";
import { useTracking } from "./hooks/useTracking";
import { CartProvider } from "./context/CartContext";
import { AutoSEO } from "./seo";
import ReactGA from "react-ga4";

// Initialize Google Analytics 4
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "G-BDP3TC1E66";
ReactGA.initialize(GA_MEASUREMENT_ID);

// Fallback Loader
const PageLoader = () => (
  <div style={{ background: "#0a0a0a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "sans-serif" }}>
    <div style={{ letterSpacing: "0.15em", textTransform: "uppercase", fontSize: "0.85rem", opacity: 0.7 }}>
      Loading GoTripo...
    </div>
  </div>
);

export default function App() {
  useTracking();
  
  return (
    <CartProvider>
      <AutoSEO />
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/community" element={<PublicGallery />} />
          <Route path="/collaborate" element={<Collaborate />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/explore" element={<Navigate to="/explore-india" replace />} />
          <Route path="/explore-india" element={<Explore isInternational={false} />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/about" element={<About />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/planner-multi" element={<PlannerMulti />} />
          <Route path="/planner-single" element={<PlannerSingle />} />
          <Route path="/weekend-trips" element={<WeekendTrips />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/results" element={<Results />} />
          <Route path="/trip-details" element={<TripDetails />} />
          <Route path="/trip-type" element={<TripType />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/collaborative-trip" element={<CollaborativeTrip />} />
          <Route path="/trips/:tripId/collab" element={<ProtectedRoute><CollabRoom /></ProtectedRoute>} />
          <Route path="/join/:tripId/:token" element={<JoinTrip />} />
          <Route path="/passport" element={<PassportPage />} />
          
          {/* Yatra Module */}
          <Route path="/yatra" element={<YatraHub />} />
          <Route path="/yatra/:id" element={<YatraDetail />} />
          <Route path="/yatra/plan" element={<YatraPlanner />} />
          <Route path="/yatra/shop" element={<YatraShop />} />
          <Route path="/yatra/:id/kit" element={<ProtectedRoute><YatraKit /></ProtectedRoute>} />
          
          {/* Commerce Routes */}
          <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin">
            <Route index element={<AdminDashboardPage />} />
            <Route path="login" element={<AdminLoginPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="trips" element={<AdminTripsPage />} />
            <Route path="applications" element={<AdminJobApplicationsPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="polls" element={<AdminPollsPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
            <Route path="chatbot" element={<AdminChatbotPage />} />
            <Route path="feedback" element={<AdminFeedbackPage />} />
            <Route path="config" element={<AdminConfigPage />} />
            <Route path="ai">
              <Route path="frontend-agent" element={<AdminFrontendAgentPage />} />
              <Route path="backend-agent" element={<AdminBackendAgentPage />} />
              <Route path="marketing-agent" element={<AdminMarketingAgentPage />} />
              <Route path="testing-agent" element={<AdminTestingAgentPage />} />
              <Route path="prompt-library" element={<AdminPromptLibraryPage />} />
              <Route path="content-engine" element={<AdminAiContentEnginePage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
      <Chatbot />
    </CartProvider>
  );
}
