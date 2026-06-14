import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, type Variants } from 'framer-motion';
import {
  GitBranch,
  GitFork,
  Sparkles,
  BookOpen,
  Users,
  ArrowRight,
  Zap,
  Globe,
} from 'lucide-react';

const fadeUp : Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const features = [
  {
    icon: <GitBranch size={16} />,
    title: 'Branch your story',
    description: 'Create alternate timelines. Every "what if" becomes its own narrative path.',
    accent: '#8dd6ff',
  },
  {
    icon: <GitFork size={16} />,
    title: 'Fork & continue',
    description: 'Clone any published story and take it somewhere completely new.',
    accent: '#8c93fb',
  },
  {
    icon: <Sparkles size={16} />,
    title: 'AI co-author',
    description: 'Real-time suggestions, plot twists and grammar fixes as you write.',
    accent: '#5fed83',
  },
  {
    icon: <Users size={16} />,
    title: 'Collaborate',
    description: 'Invite co-authors with role-based access. You stay in control.',
    accent: '#8dd6ff',
  },
  {
    icon: <BookOpen size={16} />,
    title: 'Multiple endings',
    description: 'Publish different branches as different endings. Readers choose their path.',
    accent: '#8c93fb',
  },
  {
    icon: <Globe size={16} />,
    title: 'Discover',
    description: 'Browse collaborative fiction. Rate endings, fork favourites.',
    accent: '#5fed83',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: '#08090a' }}>

      {/* ════════════════════════════════
          HERO
      ════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-14">

        {/* Subtle background gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(141, 214, 255, 0.05) 0%, transparent 60%)',
          }}
        />

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <span
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: 'rgba(141, 214, 255, 0.06)',
              border: '1px solid rgba(141, 214, 255, 0.15)',
              color: '#8dd6ff',
              letterSpacing: '-0.1px',
            }}
          >
            <Zap size={11} />
            Git-inspired collaborative storytelling
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="text-center font-semibold max-w-3xl mb-5"
          style={{
            fontSize: 'clamp(40px, 7vw, 72px)',
            lineHeight: '1',
            letterSpacing: '-0.22px',
            color: '#f7f8f8',
          }}
        >
          Where stories
          <br />
          <span style={{ color: '#8dd6ff' }}>branch and evolve</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16 }}
          className="text-center max-w-lg mb-10"
          style={{
            color: '#8a8f98',
            fontSize: '15px',
            lineHeight: '1.6',
            letterSpacing: '-0.1px',
          }}
        >
          ForkTale brings Git version control to collaborative fiction.
          Branch timelines, fork stories, commit chapters — and let AI
          help you write what comes next.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.22 }}
          className="flex flex-col sm:flex-row gap-3 mb-20"
        >
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary px-5 py-2.5 text-sm font-semibold flex items-center gap-2"
            >
              Start writing free
              <ArrowRight size={14} />
            </motion.button>
          </Link>
          <Link to="/discover">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary px-5 py-2.5 text-sm flex items-center gap-2"
            >
              <BookOpen size={14} />
              Browse stories
            </motion.button>
          </Link>
        </motion.div>

        {/* Hero terminal */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-2xl"
        >
          <div
            className="rounded-lg overflow-hidden"
            style={{
              background: '#0f1011',
              border: '1px solid #23252a',
              boxShadow: 'rgba(8, 9, 10, 0.6) 0px 4px 32px 0px',
            }}
          >
            {/* Terminal bar */}
            <div
              className="flex items-center gap-2 px-4 py-3"
              style={{ borderBottom: '1px solid #23252a' }}
            >
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#383b3f' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#383b3f' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#383b3f' }} />
              <span
                className="ml-3 font-mono"
                style={{ color: '#62666d', fontSize: '12px' }}
              >
                forktale — story-editor
              </span>
            </div>

            {/* Branch commits */}
            <div className="p-5 space-y-3">
              {[
                { branch: 'main', color: '#8dd6ff', msg: 'The kingdom falls into darkness' },
                { branch: 'main', color: '#8dd6ff', msg: 'The prince sets out on his journey' },
                { branch: 'dark-ending', color: '#8c93fb', msg: 'The witch claims her final victory' },
                { branch: 'main', color: '#8dd6ff', msg: 'Light returns to the kingdom' },
                { branch: 'hero-ending', color: '#5fed83', msg: 'The prince breaks the curse forever' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: item.color }}
                  />
                  <span
                    className="font-mono text-xs w-24 flex-shrink-0"
                    style={{ color: item.color }}
                  >
                    {item.branch}
                  </span>
                  <span style={{ color: '#62666d', fontSize: '13px' }}>
                    {item.msg}
                  </span>
                </motion.div>
              ))}

              {/* AI line */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="flex items-center gap-3 pt-3"
                style={{ borderTop: '1px solid #23252a' }}
              >
                <Sparkles size={12} style={{ color: '#5fed83' }} />
                <span style={{ color: '#8a8f98', fontSize: '12px', fontFamily: 'monospace' }}>
                  AI: "A mysterious stranger appears at the gate..."
                </span>
                <span
                  className="inline-block w-0.5 h-3.5"
                  style={{ background: '#5fed83', animation: 'pulse 1s infinite' }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════
          FEATURES
      ════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <Section>
            <motion.div variants={fadeUp} className="mb-12">
              <p
                className="text-xs font-medium uppercase tracking-widest mb-3"
                style={{ color: '#8dd6ff' }}
              >
                Features
              </p>
              <h2
                className="font-semibold max-w-md"
                style={{
                  fontSize: '32px',
                  lineHeight: '1.2',
                  letterSpacing: '-0.22px',
                  color: '#f7f8f8',
                }}
              >
                Everything a story needs
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px"
              style={{ background: '#23252a', border: '1px solid #23252a', borderRadius: '8px', overflow: 'hidden' }}
            >
              {features.map((f) => (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  className="p-6 group transition-colors duration-150"
                  style={{ background: '#0f1011' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#161718')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#0f1011')}
                >
                  <div
                    className="w-7 h-7 rounded flex items-center justify-center mb-4"
                    style={{
                      background: `${f.accent}12`,
                      border: `1px solid ${f.accent}25`,
                      color: f.accent,
                    }}
                  >
                    {f.icon}
                  </div>
                  <h3
                    className="font-medium mb-2"
                    style={{ color: '#f7f8f8', fontSize: '14px' }}
                  >
                    {f.title}
                  </h3>
                  <p style={{ color: '#8a8f98', fontSize: '13px', lineHeight: '1.5' }}>
                    {f.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* ════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <Section>
            <motion.div variants={fadeUp} className="mb-12">
              <p
                className="text-xs font-medium uppercase tracking-widest mb-3"
                style={{ color: '#8dd6ff' }}
              >
                How it works
              </p>
              <h2
                className="font-semibold"
                style={{
                  fontSize: '32px',
                  lineHeight: '1.2',
                  letterSpacing: '-0.22px',
                  color: '#f7f8f8',
                }}
              >
                Like Git, but for your imagination
              </h2>
            </motion.div>

            <div className="space-y-2">
              {[
                {
                  step: '01',
                  title: 'Create a story',
                  desc: 'Start a new story. A main branch is created automatically.',
                },
                {
                  step: '02',
                  title: 'Write and commit',
                  desc: 'Save chapters as commits with a message. Every version preserved.',
                },
                {
                  step: '03',
                  title: 'Branch alternate paths',
                  desc: 'Explore a different direction without affecting your main story.',
                },
                {
                  step: '04',
                  title: 'Publish your endings',
                  desc: 'Publish any branch as an ending. Readers choose their path.',
                },
              ].map((item) => (
                <motion.div
                  key={item.step}
                  variants={fadeUp}
                  className="flex items-start gap-6 px-5 py-4 rounded transition-colors duration-150"
                  style={{ border: '1px solid #23252a' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#0f1011')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span
                    className="font-mono text-sm flex-shrink-0 mt-0.5"
                    style={{ color: '#383b3f' }}
                  >
                    {item.step}
                  </span>
                  <div>
                    <h3
                      className="font-medium mb-1"
                      style={{ color: '#f7f8f8', fontSize: '14px' }}
                    >
                      {item.title}
                    </h3>
                    <p style={{ color: '#8a8f98', fontSize: '13px', lineHeight: '1.5' }}>
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* ════════════════════════════════
          CTA
      ════════════════════════════════ */}
      <section className="py-24 px-4">
        <Section className="max-w-2xl mx-auto">
          <motion.div
            variants={fadeUp}
            className="text-center p-12 rounded-lg"
            style={{
              background: '#0f1011',
              border: '1px solid #23252a',
              boxShadow: 'rgba(8, 9, 10, 0.6) 0px 4px 32px 0px',
            }}
          >
            <GitBranch
              size={28}
              className="mx-auto mb-6"
              style={{ color: '#8dd6ff' }}
            />
            <h2
              className="font-semibold mb-3"
              style={{
                fontSize: '28px',
                letterSpacing: '-0.22px',
                color: '#f7f8f8',
              }}
            >
              Ready to write your first branch?
            </h2>
            <p
              className="mb-8"
              style={{ color: '#8a8f98', fontSize: '14px', lineHeight: '1.6' }}
            >
              Join ForkTale and start building stories that live, breathe and evolve.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary px-5 py-2.5 text-sm font-semibold flex items-center gap-2"
                >
                  Start writing free
                  <ArrowRight size={14} />
                </motion.button>
              </Link>
              <Link to="/discover">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-secondary px-5 py-2.5 text-sm flex items-center gap-2"
                >
                  Browse stories
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </Section>
      </section>

      {/* Footer */}
      <footer
        className="py-8 px-4"
        style={{ borderTop: '1px solid #23252a' }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch size={13} style={{ color: '#8dd6ff' }} />
            <span style={{ color: '#62666d', fontSize: '13px' }}>
              ForkTale — Where stories branch and evolve
            </span>
          </div>
          <div className="flex items-center gap-5">
            {[
              { label: 'Discover', to: '/discover' },
              { label: 'Sign up', to: '/register' },
              { label: 'Log in', to: '/login' },
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                style={{ color: '#62666d', fontSize: '13px' }}
                onMouseEnter={e => ((e.target as HTMLElement).style.color = '#8a8f98')}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = '#62666d')}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}