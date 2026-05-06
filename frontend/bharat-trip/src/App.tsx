import { Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./routes/index";
import AuthPage from "./routes/auth";
import Collaborate from "./routes/collaborate";
import Dashboard from "./routes/dashboard";
import Explore from "./routes/explore";
import PlannerMulti from "./routes/planner-multi";
import PlannerSingle from "./routes/planner-single";
import Profile from "./routes/profile";
import SettingsPage from "./routes/settings";
import Results from "./routes/results";
import Pricing from "./routes/pricing";
import Privacy from "./routes/privacy";
import Terms from "./routes/terms";
import Cookies from "./routes/cookies";
import About from "./routes/about";
import Careers from "./routes/careers";
import TripDetails from "./routes/trip-details";
import TripType from "./routes/trip-type";
import Trips from "./routes/trips";
import CollaborativeTrip from "./routes/collaborative-trip";
import CollabRoom from "@/components/collabRoom/CollabRoom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import PassportPage from "./routes/passport";
import AdminDashboardPage from "./routes/admin/index";
import AdminLoginPage from "./routes/admin/login";
import AdminUsersPage from "./routes/admin/users";
import AdminTripsPage from "./routes/admin/trips";
import AdminReviewsPage from "./routes/admin/reviews";
import AdminPollsPage from "./routes/admin/polls";
import AdminNotificationsPage from "./routes/admin/notifications";
import AdminConfigPage from "./routes/admin/config";
import AdminJobApplicationsPage from "./routes/admin/job-applications";
import AdminChatbotPage from "./routes/admin/chatbot";

import YatraHub from "./routes/yatra/index";
import YatraDetail from "./routes/yatra/details";
import YatraPlanner from "./routes/yatra/plan";
import { Chatbot } from "./components/Chatbot";
import { useTracking } from "./hooks/useTracking";

export default function App() {
  useTracking();
  
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
      <Route path="/auth" element={<AuthPage />} />
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
      <Route path="/planner-multi" element={<PlannerMulti />} />
      <Route path="/planner-single" element={<PlannerSingle />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/results" element={<Results />} />
      <Route path="/trip-details" element={<TripDetails />} />
      <Route path="/trip-type" element={<TripType />} />
      <Route path="/trips" element={<Trips />} />
      <Route path="/collaborative-trip" element={<CollaborativeTrip />} />
      <Route path="/trips/:tripId/collab" element={<ProtectedRoute><CollabRoom /></ProtectedRoute>} />
      <Route path="/passport" element={<PassportPage />} />
      
      {/* Yatra Module */}
      <Route path="/yatra" element={<YatraHub />} />
      <Route path="/yatra/:id" element={<YatraDetail />} />
      <Route path="/yatra/plan" element={<YatraPlanner />} />
      
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
        <Route path="config" element={<AdminConfigPage />} />
      </Route>
    </Routes>
    <Chatbot />
    </>
  );
}
