import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen,GitBranch,Compass,LayoutDashboard,User,LogOut,Menu,X,Plus,ChevronDown,Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Scroll effect

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setIsProfileOpen(false);
  }, [location]);

  const navLinks = [
    {
      label: "Discover",
      href: "/discover",
      icon: <Compass size={16} />,
    },
    ...(isAuthenticated
      ? [
          {
            label: "Dashboard",
            href: "/dashboard",
            icon: <LayoutDashboard size={16} />,
          },
        ]
      : []),
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "glass border-b border-white/10 shadow-card"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/*Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ rotate: 20 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-8 h-8 rounded-lg bg-gradient-ai flex items-center justify-center shadow-glow"
              >
                <GitBranch size={16} className="text-white" />
              </motion.div>
              <span className="font-bold text-lg gradient-text">ForkTale</span>
            </Link>

            {/*  Desktop Nav Links  */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.href)
                      ? "bg-primary-600/20 text-primary-400 border border-primary-500/30"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>

            {/*  Right Side  */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {/* Create Story Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/stories/create")}
                    className="btn-primary py-2 px-4 text-sm"
                  >
                    <Plus size={16} />
                    New Story
                  </motion.button>

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-2 glass px-3 py-2 rounded-xl border border-white/10 hover:border-primary-500/30 transition-all"
                    >
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gradient-ai flex items-center justify-center text-xs font-bold">
                          {user?.username?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm text-white/80">
                        {user?.username}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`text-white/40 transition-transform ${
                          isProfileOpen ? "rotate-180" : ""
                        }`}
                      />
                    </motion.button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-52 glass-strong rounded-2xl border border-white/10 shadow-card overflow-hidden"
                        >
                          <div className="p-2">
                            <Link
                              to={`/u/${user?.username}`}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                            >
                              <User size={15} />
                              My Profile
                            </Link>
                            <Link
                              to="/dashboard"
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                            >
                              <BookOpen size={15} />
                              My Stories
                            </Link>
                            <Link
                              to="/discover"
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                            >
                              <Sparkles size={15} />
                              Discover
                            </Link>
                          </div>

                          <div className="border-t border-white/5 p-2">
                            <button
                              onClick={logout}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                            >
                              <LogOut size={15} />
                              Log Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost text-sm">
                    Log In
                  </Link>
                  <Link to="/register">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-primary py-2 px-4 text-sm"
                    >
                      Get Started
                    </motion.button>
                  </Link>
                </>
              )}
            </div>

            {/*  Mobile Menu Button  */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden glass p-2 rounded-xl border border-white/10"
            >
              <AnimatePresence mode="wait">
                {isMobileOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X size={20} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.nav>

      {/*  Mobile Menu  */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-16 left-0 right-0 z-40 glass-strong border-b border-white/10 md:hidden overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(link.href)
                      ? "bg-primary-600/20 text-primary-400"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <Link
                    to="/stories/create"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-primary-600/20 text-primary-400"
                  >
                    <Plus size={16} />
                    New Story
                  </Link>
                  <Link
                    to={`/u/${user?.username}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5"
                  >
                    <User size={16} />
                    My Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut size={16} />
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5"
                  >
                    Log In
                  </Link>
                  <Link to="/register" className="btn-primary text-sm py-3">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}