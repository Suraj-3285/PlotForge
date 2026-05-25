import { BrowserRouter,Routes,Route,Navigate,Outlet, } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "./context/AuthContext";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import StoryCreate from "./pages/StoryCreate";
import StoryEdit from "./pages/StoryEdit";
import StoryRead from "./pages/StoryRead";
import BranchView from "./pages/BranchView";
import CommitHistory from "./pages/CommitHistory";
import Discover from "./pages/Discover";
import Collaborate from "./pages/Collaborate";
import Navbar from "./components/layout/Navbar";

//Protected Route
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-100 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

//Public Route
const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-100 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <>{children}</>
  );
};

//Layout with Navbar

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

//App

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-dark-100">
        <Routes>
          {/* no navbar in public routes */}
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

          {/* Routes with Navbar */}
          <Route element={<WithNavbar />}>
            {/* Public */}
            <Route path="/discover" element={<Discover />} />
            <Route path="/stories/:storyId/read" element={<StoryRead />} />
            <Route path="/u/:username" element={<Profile />} />

            {/* Protected */}
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}