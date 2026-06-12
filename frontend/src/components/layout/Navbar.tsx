import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitBranch,
  Compass,
  LayoutDashboard,
  User,
  LogOut,
  Menu,
  X,
  Plus,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setIsProfileOpen(false);
  }, [location]);

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: isScrolled
            ? 'rgba(8, 9, 10, 0.92)'
            : 'transparent',
          borderBottom: isScrolled
            ? '1px solid #23252a'
            : '1px solid transparent',
          backdropFilter: isScrolled ? 'blur(12px)' : 'none',
        }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">

            {/* ── Logo ── */}
            <Link
              to="/"
              className="flex items-center gap-2 group"
            >
              <div
                className="w-7 h-7 rounded flex items-center justify-center"
                style={{ background: '#8dd6ff' }}
              >
                <GitBranch size={14} className="text-pitch-black" />
              </div>
              <span
                className="font-semibold text-sm tracking-tight"
                style={{ color: '#f7f8f8', letterSpacing: '-0.13px' }}
              >
                ForkTale
              </span>
            </Link>

            {/* ── Desktop Nav ── */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/discover"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-body-sm transition-all duration-150"
                style={{
                  color: isActive('/discover') ? '#f7f8f8' : '#8a8f98',
                  background: isActive('/discover') ? '#161718' : 'transparent',
                  fontSize: '13px',
                }}
              >
                <Compass size={13} />
                Discover
              </Link>

              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-all duration-150"
                  style={{
                    color: isActive('/dashboard') ? '#f7f8f8' : '#8a8f98',
                    background: isActive('/dashboard') ? '#161718' : 'transparent',
                    fontSize: '13px',
                  }}
                >
                  <LayoutDashboard size={13} />
                  Dashboard
                </Link>
              )}
            </div>

            {/* ── Right Side ── */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  {/* New Story */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/stories/create')}
                    className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
                  >
                    <Plus size={13} />
                    New Story
                  </motion.button>

                  {/* Profile */}
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded transition-all duration-150"
                      style={{
                        border: '1px solid #23252a',
                        background: isProfileOpen ? '#161718' : 'transparent',
                      }}
                    >
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold"
                          style={{ background: '#8dd6ff', color: '#08090a' }}
                        >
                          {user?.username?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <span
                        className="text-xs"
                        style={{ color: '#d0d6e0', letterSpacing: '-0.1px' }}
                      >
                        {user?.username}
                      </span>
                      <ChevronDown
                        size={12}
                        style={{
                          color: '#62666d',
                          transform: isProfileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.15s',
                        }}
                      />
                    </button>

                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 4, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.97 }}
                          transition={{ duration: 0.12 }}
                          className="absolute right-0 mt-1.5 w-48"
                          style={{
                            background: '#0f1011',
                            border: '1px solid #23252a',
                            borderRadius: '6px',
                            boxShadow: 'rgba(8, 9, 10, 0.6) 0px 4px 32px 0px',
                          }}
                        >
                          <div className="p-1">
                            <Link
                              to={`/u/${user?.username}`}
                              className="flex items-center gap-2.5 px-2.5 py-2 rounded transition-all duration-100"
                              style={{ color: '#8a8f98', fontSize: '13px' }}
                              onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.background = '#161718';
                                (e.currentTarget as HTMLElement).style.color = '#f7f8f8';
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.background = 'transparent';
                                (e.currentTarget as HTMLElement).style.color = '#8a8f98';
                              }}
                            >
                              <User size={13} />
                              Profile
                            </Link>
                            <Link
                              to="/dashboard"
                              className="flex items-center gap-2.5 px-2.5 py-2 rounded transition-all duration-100"
                              style={{ color: '#8a8f98', fontSize: '13px' }}
                              onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.background = '#161718';
                                (e.currentTarget as HTMLElement).style.color = '#f7f8f8';
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.background = 'transparent';
                                (e.currentTarget as HTMLElement).style.color = '#8a8f98';
                              }}
                            >
                              <LayoutDashboard size={13} />
                              Dashboard
                            </Link>
                          </div>

                          <div style={{ borderTop: '1px solid #23252a' }} className="p-1">
                            <button
                              onClick={logout}
                              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded transition-all duration-100"
                              style={{ color: '#eb5757', fontSize: '13px' }}
                              onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.background = 'rgba(235, 87, 87, 0.08)';
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.background = 'transparent';
                              }}
                            >
                              <LogOut size={13} />
                              Log out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn-ghost text-xs px-3 py-1.5"
                    style={{ fontSize: '13px' }}
                  >
                    Log in
                  </Link>
                  <Link to="/register">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-primary text-xs px-3 py-1.5"
                    >
                      Get started
                    </motion.button>
                  </Link>
                </>
              )}
            </div>

            {/* ── Mobile Toggle ── */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-1.5 rounded transition-colors"
              style={{ color: '#8a8f98', border: '1px solid #23252a' }}
            >
              <AnimatePresence mode="wait">
                {isMobileOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.12 }}
                  >
                    <X size={16} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.12 }}
                  >
                    <Menu size={16} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-14 left-0 right-0 z-40 md:hidden overflow-hidden"
            style={{
              background: '#0f1011',
              borderBottom: '1px solid #23252a',
            }}
          >
            <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
              <Link
                to="/discover"
                className="flex items-center gap-2 px-3 py-2 rounded"
                style={{
                  color: isActive('/discover') ? '#f7f8f8' : '#8a8f98',
                  background: isActive('/discover') ? '#161718' : 'transparent',
                  fontSize: '13px',
                }}
              >
                <Compass size={13} /> Discover
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 rounded"
                    style={{
                      color: isActive('/dashboard') ? '#f7f8f8' : '#8a8f98',
                      background: isActive('/dashboard') ? '#161718' : 'transparent',
                      fontSize: '13px',
                    }}
                  >
                    <LayoutDashboard size={13} /> Dashboard
                  </Link>
                  <Link
                    to="/stories/create"
                    className="flex items-center gap-2 px-3 py-2 rounded"
                    style={{ color: '#8dd6ff', fontSize: '13px' }}
                  >
                    <Plus size={13} /> New Story
                  </Link>
                  <Link
                    to={`/u/${user?.username}`}
                    className="flex items-center gap-2 px-3 py-2 rounded"
                    style={{ color: '#8a8f98', fontSize: '13px' }}
                  >
                    <User size={13} /> Profile
                  </Link>
                  <div style={{ borderTop: '1px solid #23252a' }} className="pt-1 mt-1">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded"
                      style={{ color: '#eb5757', fontSize: '13px' }}
                    >
                      <LogOut size={13} /> Log out
                    </button>
                  </div>
                </>
              )}

              {!isAuthenticated && (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-3 py-2 rounded"
                    style={{ color: '#8a8f98', fontSize: '13px' }}
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-2 px-3 py-2 rounded"
                    style={{ color: '#8dd6ff', fontSize: '13px' }}
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-14" />
    </>
  );
}