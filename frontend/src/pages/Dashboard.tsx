import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  BookOpen,
  GitBranch,
  GitFork,
  Users,
  MoreHorizontal,
  Trash2,
  Edit,
  Eye,
  Globe,
  Lock,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storyService, forkService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Story } from '../types';

// ─────────────────────────────────────────
// STORY CARD
// ─────────────────────────────────────────
function StoryCard({ story }: { story: Story }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => storyService.deleteStory(story.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myStories'] });
    },
  });

  const defaultBranch = story.branches?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative rounded-md transition-colors duration-150"
      style={{
        background: '#0f1011',
        border: '1px solid #23252a',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#383b3f')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#23252a')}
    >
      {/* Cover */}
      <div
        className="w-full h-32 rounded-t-md overflow-hidden cursor-pointer"
        onClick={() =>
          defaultBranch &&
          navigate(`/stories/${story.id}/branches/${defaultBranch.id}`)
        }
      >
        {story.coverImage ? (
          <img
            src={story.coverImage}
            alt={story.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: '#161718' }}
          >
            <BookOpen size={24} style={{ color: '#383b3f' }} />
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium"
            style={
              story.isPublished
                ? {
                    background: 'rgba(95, 237, 131, 0.1)',
                    border: '1px solid rgba(95, 237, 131, 0.2)',
                    color: '#5fed83',
                  }
                : {
                    background: '#161718',
                    border: '1px solid #23252a',
                    color: '#62666d',
                  }
            }
          >
            {story.isPublished ? (
              <><Globe size={9} /> Published</>
            ) : (
              <><Lock size={9} /> Draft</>
            )}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3
            className="font-medium text-sm cursor-pointer line-clamp-1 transition-colors duration-100"
            style={{ color: '#d0d6e0', letterSpacing: '-0.1px' }}
            onClick={() =>
              defaultBranch &&
              navigate(`/stories/${story.id}/branches/${defaultBranch.id}`)
            }
            onMouseEnter={e => ((e.target as HTMLElement).style.color = '#f7f8f8')}
            onMouseLeave={e => ((e.target as HTMLElement).style.color = '#d0d6e0')}
          >
            {story.title}
          </h3>

          {/* Menu */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded transition-colors duration-100"
              style={{ color: '#62666d' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = '#161718';
                (e.currentTarget as HTMLElement).style.color = '#8a8f98';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = '#62666d';
              }}
            >
              <MoreHorizontal size={14} />
            </button>

            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 2 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.1 }}
                className="absolute right-0 top-7 w-44 z-10 rounded-md overflow-hidden"
                style={{
                  background: '#161718',
                  border: '1px solid #23252a',
                  boxShadow: 'rgba(8, 9, 10, 0.6) 0px 4px 32px 0px',
                }}
              >
                <div className="p-1">
                  {[
                    {
                      icon: <Edit size={12} />,
                      label: 'Edit story',
                      onClick: () => {
                        navigate(`/stories/${story.id}/edit`);
                        setMenuOpen(false);
                      },
                    },
                    ...(defaultBranch
                      ? [{
                          icon: <Eye size={12} />,
                          label: 'Open editor',
                          onClick: () => {
                            navigate(`/stories/${story.id}/branches/${defaultBranch.id}`);
                            setMenuOpen(false);
                          },
                        }]
                      : []),
                    {
                      icon: <Users size={12} />,
                      label: 'Collaborators',
                      onClick: () => {
                        navigate(`/stories/${story.id}/collaborate`);
                        setMenuOpen(false);
                      },
                    },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={item.onClick}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs transition-colors duration-100"
                      style={{ color: '#8a8f98' }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = '#23252a';
                        (e.currentTarget as HTMLElement).style.color = '#f7f8f8';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = '#8a8f98';
                      }}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid #23252a' }} className="p-1">
                  <button
                    onClick={() => {
                      if (confirm('Delete this story?')) deleteMutation.mutate();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs transition-colors duration-100"
                    style={{ color: '#eb5757' }}
                    onMouseEnter={e =>
                      ((e.currentTarget as HTMLElement).style.background = 'rgba(235, 87, 87, 0.08)')
                    }
                    onMouseLeave={e =>
                      ((e.currentTarget as HTMLElement).style.background = 'transparent')
                    }
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Description */}
        {story.description && (
          <p
            className="text-xs line-clamp-1 mb-2.5"
            style={{ color: '#62666d' }}
          >
            {story.description}
          </p>
        )}

        {/* Footer stats */}
        <div className="flex items-center gap-3">
          {story.genre && (
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ background: '#23252a', color: '#8a8f98' }}
            >
              {story.genre}
            </span>
          )}
          <span
            className="flex items-center gap-1 text-xs ml-auto"
            style={{ color: '#62666d' }}
          >
            <GitBranch size={10} />
            {story._count?.branches || 0}
          </span>
          <span
            className="flex items-center gap-1 text-xs"
            style={{ color: '#62666d' }}
          >
            <GitFork size={10} />
            {story._count?.forks || 0}
          </span>
          <span className="text-xs" style={{ color: '#62666d' }}>
            {story.wordCount}w
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      className="rounded-md overflow-hidden"
      style={{ background: '#0f1011', border: '1px solid #23252a' }}
    >
      <div className="shimmer w-full h-32" />
      <div className="p-3 space-y-2">
        <div className="shimmer h-3.5 w-3/4 rounded" />
        <div className="shimmer h-3 w-1/2 rounded" />
        <div className="flex gap-2 mt-3">
          <div className="shimmer h-3 w-12 rounded" />
          <div className="shimmer h-3 w-8 rounded ml-auto" />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'stories' | 'forks'>('stories');

  const { data: storiesData, isLoading: storiesLoading } = useQuery({
    queryKey: ['myStories'],
    queryFn: () => storyService.getMyStories(),
  });

  const { data: forksData, isLoading: forksLoading } = useQuery({
    queryKey: ['myForks'],
    queryFn: () => forkService.getMyForks(),
  });

  const stories: Story[] = storiesData?.data?.stories || [];
  const forks: Story[] = forksData?.data?.forks || [];

  return (
    <div
      className="min-h-screen px-4 py-8"
      style={{ background: '#08090a' }}
    >
      <div className="max-w-5xl mx-auto">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1
              className="font-semibold mb-0.5"
              style={{
                fontSize: '22px',
                letterSpacing: '-0.22px',
                color: '#f7f8f8',
              }}
            >
              {user?.name || user?.username}
            </h1>
            <p style={{ color: '#62666d', fontSize: '13px' }}>
              {stories.length} stories · {forks.length} forks
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/stories/create')}
            className="btn-primary text-xs px-3 py-2 flex items-center gap-1.5"
          >
            <Plus size={13} />
            New story
          </motion.button>
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-1 mb-6"
          style={{ borderBottom: '1px solid #23252a', paddingBottom: '0' }}
        >
          {[
            { key: 'stories', label: 'Stories', count: stories.length },
            { key: 'forks', label: 'Forked', count: forks.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium transition-all duration-150 relative"
              style={{
                color: activeTab === tab.key ? '#f7f8f8' : '#8a8f98',
                borderBottom: activeTab === tab.key
                  ? '1px solid #8dd6ff'
                  : '1px solid transparent',
                marginBottom: '-1px',
              }}
            >
              {tab.label}
              <span
                className="px-1.5 py-0.5 rounded text-xs"
                style={{
                  background: activeTab === tab.key ? '#161718' : '#0f1011',
                  color: activeTab === tab.key ? '#8dd6ff' : '#62666d',
                  border: '1px solid #23252a',
                  fontSize: '11px',
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </motion.div>

        {/* ── Stories Tab ── */}
        {activeTab === 'stories' && (
          storiesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : stories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <BookOpen
                size={32}
                className="mx-auto mb-3"
                style={{ color: '#383b3f' }}
              />
              <h3
                className="font-medium mb-1 text-sm"
                style={{ color: '#8a8f98' }}
              >
                No stories yet
              </h3>
              <p
                className="text-xs mb-5"
                style={{ color: '#62666d' }}
              >
                Create your first story and start branching
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/stories/create')}
                className="btn-primary text-xs px-3 py-2 inline-flex items-center gap-1.5"
              >
                <Plus size={13} />
                Create story
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {stories.map(story => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          )
        )}

        {/* ── Forks Tab ── */}
        {activeTab === 'forks' && (
          forksLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1, 2].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : forks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <GitFork
                size={32}
                className="mx-auto mb-3"
                style={{ color: '#383b3f' }}
              />
              <h3
                className="font-medium mb-1 text-sm"
                style={{ color: '#8a8f98' }}
              >
                No forks yet
              </h3>
              <p
                className="text-xs mb-5"
                style={{ color: '#62666d' }}
              >
                Fork a published story to continue it your way
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/discover')}
                className="btn-secondary text-xs px-3 py-2 inline-flex items-center gap-1.5"
              >
                Browse stories
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {forks.map(story => (
                <div key={story.id}>
                  <StoryCard story={story} />
                  {story.forkedFrom && (
                    <p
                      className="mt-1.5 px-1 text-xs flex items-center gap-1"
                      style={{ color: '#62666d' }}
                    >
                      <GitFork size={10} />
                      Forked from{' '}
                      <span style={{ color: '#8dd6ff' }}>
                        {story.forkedFrom.author.username}/{story.forkedFrom.title}
                      </span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}