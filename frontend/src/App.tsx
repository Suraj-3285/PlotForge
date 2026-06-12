import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const StoryCreate = lazy(() => import("./pages/StoryCreate"));
const StoryEdit = lazy(() => import("./pages/StoryEdit"));
const StoryRead = lazy(() => import("./pages/StoryRead"));
const BranchView = lazy(() => import("./pages/BranchView"));
const CommitHistory = lazy(() => import("./pages/CommitHistory"));
const Discover = lazy(() => import("./pages/Discover"));
const Collaborate = lazy(() => import("./pages/Collaborate"));
const NotFound = lazy(() => import("./pages/NotFound"));

import Navbar from "./components/layout/Navbar";
import { Outlet } from "react-router-dom";

const PageLoader = () => (
  <div
    className="min-h-screen flex items-center justify-center"
    style={{ background: "#08090a" }}
  >
    <Loader2 size={18} className="animate-spin" style={{ color: "#8a8f98" }} />
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <>{children}</>
  );
};

function WithNavbar() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <div className="min-h-screen" style={{ background: "#08090a" }}>
          <Routes>
            {/* Public */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <Home />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* With navbar */}
            <Route element={<WithNavbar />}>
              {/* Public */}
              <Route path="/discover" element={<Discover />} />
              <Route path="/stories/:storyId/read" element={<StoryRead />} />
              <Route path="/u/:username" element={<Profile />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stories/create"
                element={
                  <ProtectedRoute>
                    <StoryCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stories/:storyId/edit"
                element={
                  <ProtectedRoute>
                    <StoryEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stories/:storyId/branches/:branchId"
                element={
                  <ProtectedRoute>
                    <BranchView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stories/:storyId/commits"
                element={
                  <ProtectedRoute>
                    <CommitHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stories/:storyId/collaborate"
                element={
                  <ProtectedRoute>
                    <Collaborate />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Suspense>
    </BrowserRouter>
  );
}