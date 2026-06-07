import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GitBranch, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#08090a' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-6"
          style={{ background: '#161718', border: '1px solid #23252a' }}
        >
          <GitBranch size={20} style={{ color: '#8dd6ff' }} />
        </div>

        <p
          className="font-mono mb-2"
          style={{ color: '#383b3f', fontSize: '12px' }}
        >
          404
        </p>

        <h1
          className="font-semibold mb-2"
          style={{
            fontSize: '22px',
            letterSpacing: '-0.22px',
            color: '#f7f8f8',
          }}
        >
          Page not found
        </h1>

        <p
          className="mb-8 text-sm"
          style={{ color: '#62666d' }}
        >
          This branch doesn't exist.
        </p>

        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary text-xs px-4 py-2 flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={13} />
            Back to home
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}