import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { GitBranch,GitFork,Sparkles,BookOpen,Users,ArrowRight,Zap,Globe, } from "lucide-react";

//Animation Variants
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

//Feature Card

const features = [
  {
    icon: <GitBranch size={24} />,
    title: "Branch Your Story",
    description:
      'Create alternate timelines and narrative branches. Every "what if" becomes its own story path.',
    color: "from-blue-500 to-indigo-600",
    glow: "shadow-blue-500/20",
  },
  {
    icon: <GitFork size={24} />,
    title: "Fork & Continue",
    description:
      "Love a story but want to take it somewhere new? Fork it and write your own ending.",
    color: "from-purple-500 to-pink-600",
    glow: "shadow-purple-500/20",
  },
  {
    icon: <Sparkles size={24} />,
    title: "AI Co-Author",
    description:
      "Get real-time AI suggestions, plot twists, grammar fixes and writing improvements as you type.",
    color: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/20",
  },
  {
    icon: <Users size={24} />,
    title: "Collaborate",
    description:
      "Invite co-authors with role-based access. Editors write, viewers read — you stay in control.",
    color: "from-green-500 to-teal-600",
    glow: "shadow-green-500/20",
  },
  {
    icon: <BookOpen size={24} />,
    title: "Multiple Endings",
    description:
      "Publish different branches as different endings. Let readers choose their own adventure.",
    color: "from-red-500 to-rose-600",
    glow: "shadow-red-500/20",
  },
  {
    icon: <Globe size={24} />,
    title: "Discover Stories",
    description:
      "Browse a world of collaborative fiction. Rate endings, fork favourites, join the community.",
    color: "from-cyan-500 to-blue-600",
    glow: "shadow-cyan-500/20",
  },
];

//Stats

const stats = [
  { value: "Git-Inspired", label: "Version Control" },
  { value: "AI-Powered", label: "Writing Assistant" },
  { value: "Multi-Ending", label: "Story Branches" },
  { value: "Real-Time", label: "Collaboration" },
];

//Section Wrapper
function AnimatedSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

//HomePage

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden">
      {/*BackGround Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-600/5 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 glass border border-primary-500/30 text-primary-400 text-sm font-medium px-4 py-2 rounded-full">
            <Zap size={14} className="animate-pulse" />
            Git-Inspired Collaborative Storytelling
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold text-center max-w-4xl leading-tight mb-6"
        >
          Where Stories
          <span className="block gradient-text">Branch & Evolve</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-white/50 text-center max-w-2xl mb-10 leading-relaxed"
        >
          ForkTale brings the power of Git version control to collaborative
          fiction. Branch timelines, fork stories, commit chapters — and let AI
          help you write what comes next.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mb-16"
        >
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary text-base px-8 py-4 shadow-glow-lg"
            >
              Start Writing Free
              <ArrowRight size={18} />
            </motion.button>
          </Link>

          <Link to="/discover">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-secondary text-base px-8 py-4"
            >
              <BookOpen size={18} />
              Browse Stories
            </motion.button>
          </Link>
        </motion.div>

        {/* Git Branch Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative w-full max-w-3xl"
        >
          <div className="glass rounded-3xl border border-white/10 p-8 shadow-card">
            {/* Fake terminal header */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-3 text-white/30 text-xs font-mono">
                forktale — story-editor
              </span>
            </div>

            {/* Branch visualization */}
            <div className="font-mono text-sm space-y-3">
              {[
                {
                  color: "text-blue-400",
                  dot: "bg-blue-400",
                  line: true,
                  text: "main",
                  msg: "The kingdom falls into darkness",
                },
                {
                  color: "text-blue-400",
                  dot: "bg-blue-400",
                  line: true,
                  text: "main",
                  msg: "The prince sets out on his journey",
                },
                {
                  color: "text-purple-400",
                  dot: "bg-purple-400",
                  line: false,
                  text: "dark-ending",
                  msg: "The witch claims her final victory",
                },
                {
                  color: "text-blue-400",
                  dot: "bg-blue-400",
                  line: true,
                  text: "main",
                  msg: "Light returns to the kingdom",
                },
                {
                  color: "text-green-400",
                  dot: "bg-green-400",
                  line: false,
                  text: "hero-ending",
                  msg: "The prince breaks the curse forever",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div
                    className={`w-3 h-3 rounded-full ${item.dot} shadow-lg flex-shrink-0`}
                  />

                  <span className={`text-xs ${item.color} w-24 flex-shrink-0`}>
                    {item.text}
                  </span>

                  <span className="text-white/40 text-xs truncate">
                    {item.msg}
                  </span>
                </motion.div>
              ))}

              {/* AI suggestion line */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5"
              >
                <Sparkles size={12} className="text-purple-400 animate-pulse" />

                <span className="text-purple-400/70 text-xs">
                  AI suggesting: "A mysterious stranger appears at the gate..."
                </span>

                <span className="w-1 h-4 bg-purple-400 animate-pulse ml-1" />
              </motion.div>
            </div>
          </div>

          {/* Floating badges */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut" as const,
            }}
            className="absolute -top-4 -right-4 glass border border-green-500/30 text-green-400 text-xs px-3 py-1.5 rounded-full shadow-lg"
          >
            ✓ Committed
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut" as const,
              delay: 1,
            }}
            className="absolute -bottom-4 -left-4 glass border border-purple-500/30 text-purple-400 text-xs px-3 py-1.5 rounded-full shadow-lg"
          >
            ⎇ Branched
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center pt-2"
          >
            <div className="w-1 h-2 bg-white/40 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 px-4">
        <AnimatedSection className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              className="card text-center"
            >
              <div className="text-2xl font-bold gradient-text mb-1">
                {stat.value}
              </div>

              <div className="text-white/40 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </AnimatedSection>
      </section>

      {/* Feature Section */}
      <section className="relative py-24 px-4">
        <AnimatedSection className="max-w-7xl mx-auto">
          {/* Section header */}
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything a story needs
            </h2>

            <p className="text-white/40 text-lg max-w-xl mx-auto">
              Built for writers who think in possibilities, not just chapters.
            </p>
          </motion.div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="card group cursor-default"
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg ${feature.glow} group-hover:scale-110 transition-transform duration-300`}
                >
                  <span className="text-white">{feature.icon}</span>
                </div>

                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>

                <p className="text-white/40 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* How it works */}
      <section className="relative py-24 px-4">
        <AnimatedSection className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How it works
            </h2>

            <p className="text-white/40 text-lg">
              Like Git, but for your imagination.
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                step: "01",
                title: "Create a story",
                description:
                  "Start a new story. A main branch is created automatically — just like a Git repo.",
                color: "text-blue-400",
                border: "border-blue-500/20",
                bg: "bg-blue-500/5",
              },
              {
                step: "02",
                title: "Write and commit",
                description:
                  "Write your chapters and save them as commits with a message. Every version is preserved forever.",
                color: "text-purple-400",
                border: "border-purple-500/20",
                bg: "bg-purple-500/5",
              },
              {
                step: "03",
                title: "Branch for alternate paths",
                description:
                  "Create a branch to explore a different direction without affecting your main story.",
                color: "text-green-400",
                border: "border-green-500/20",
                bg: "bg-green-500/5",
              },
              {
                step: "04",
                title: "Publish your endings",
                description:
                  "Publish any branch as a story ending. Readers can choose which path to follow.",
                color: "text-amber-400",
                border: "border-amber-500/20",
                bg: "bg-amber-500/5",
              },
            ].map((item) => (
              <motion.div
                key={item.step}
                variants={fadeUp}
                whileHover={{ x: 4 }}
                className={`flex items-start gap-6 p-6 rounded-2xl border ${item.border} ${item.bg} transition-all duration-200`}
              >
                <span
                  className={`text-4xl font-bold ${item.color} opacity-40 flex-shrink-0 font-mono`}
                >
                  {item.step}
                </span>

                <div>
                  <h3 className="text-lg font-semibold mb-1">{item.title}</h3>

                  <p className="text-white/40 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* CTA Section */}

      <section className="relative py-24 px-4">
        <AnimatedSection className="max-w-3xl mx-auto text-center">
          <motion.div
            variants={fadeUp}
            className="glass rounded-3xl border border-white/10 p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-purple-600/10 pointer-events-none" />

            <motion.div variants={fadeUp}>
              <GitBranch
                size={48}
                className="text-primary-400 mx-auto mb-6 animate-float"
              />
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Ready to write your
              <span className="gradient-text"> first branch?</span>
            </motion.h2>

            <motion.p variants={fadeUp} className="text-white/40 text-lg mb-8">
              Join ForkTale and start building stories that live, breathe and
              evolve.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary text-base px-8 py-4 shadow-glow-lg"
                >
                  Start Writing Free
                  <ArrowRight size={18} />
                </motion.button>
              </Link>

              <Link to="/discover">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-secondary text-base px-8 py-4"
                >
                  Browse Stories
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GitBranch size={16} className="text-primary-400" />

            <span className="text-white/40 text-sm">
              ForkTale — Where stories branch and evolve
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              to="/discover"
              className="text-white/30 hover:text-white/60 text-sm transition-colors"
            >
              Discover
            </Link>

            <Link
              to="/register"
              className="text-white/30 hover:text-white/60 text-sm transition-colors"
            >
              Sign Up
            </Link>

            <Link
              to="/login"
              className="text-white/30 hover:text-white/60 text-sm transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}