import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// Public/Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Portal Module Pages
import SchemesPage from './pages/public/SchemesPage';
import SchemeDetailPage from './pages/public/SchemeDetailPage';
import DepartmentsPage from './pages/public/DepartmentsPage';
import DepartmentDetailPage from './pages/public/DepartmentDetailPage';
import EligibilityCheckerPage from './pages/public/EligibilityCheckerPage';
import RecommendationsPage from './pages/public/RecommendationsPage';
import SchemeAssistantPage from './pages/public/SchemeAssistantPage';

// Citizen Dashboard Pages
import UserDashboard from './pages/user/UserDashboard';
import UserProfilePage from './pages/user/UserProfilePage';
import BookmarksPage from './pages/user/BookmarksPage';
import RemindersPage from './pages/user/RemindersPage';
import NotificationsPage from './pages/user/NotificationsPage';
import FeedbackPage from './pages/user/FeedbackPage';
import EligibilityHistoryPage from './pages/user/EligibilityHistoryPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSchemesPage from './pages/admin/AdminSchemesPage';
import AdminDepartmentsPage from './pages/admin/AdminDepartmentsPage';
import AdminRulesPage from './pages/admin/AdminRulesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminFeedbackPage from './pages/admin/AdminFeedbackPage';
import AdminVerificationPage from './pages/admin/AdminVerificationPage';

// Root Entry Component: requires login first, then redirects to appropriate portal
const RootRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return user?.role === 'ADMIN' ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <Routes>
      {/* Root redirect: if not logged in, ask for login/signup first; if logged in, list all modules */}
      <Route path="/" element={<RootRedirect />} />

      {/* Auth Entry Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* All portal module routes require authentication first */}
        <Route
          path="/schemes"
          element={
            <ProtectedRoute>
              <SchemesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/schemes/:id"
          element={
            <ProtectedRoute>
              <SchemeDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/departments"
          element={
            <ProtectedRoute>
              <DepartmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/departments/:id"
          element={
            <ProtectedRoute>
              <DepartmentDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/eligibility"
          element={
            <ProtectedRoute>
              <EligibilityCheckerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <RecommendationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assistant"
          element={
            <ProtectedRoute>
              <SchemeAssistantPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Citizen Dashboard Hub (All modules listed upon logging in) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<UserDashboard />} />
        <Route path="profile" element={<UserProfilePage />} />
        <Route path="bookmarks" element={<BookmarksPage />} />
        <Route path="reminders" element={<RemindersPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="eligibility-history" element={<EligibilityHistoryPage />} />
      </Route>

      {/* Admin Console (All administrative modules listed upon admin login) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="schemes" element={<AdminSchemesPage />} />
        <Route path="departments" element={<AdminDepartmentsPage />} />
        <Route path="rules" element={<AdminRulesPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="feedback" element={<AdminFeedbackPage />} />
        <Route path="verification" element={<AdminVerificationPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
