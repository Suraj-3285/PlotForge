import { useState,useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  BookOpen,
  GitFork,
  GitBranch,
  Globe,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { storyService, forkService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Story } from '../types';
import { useDebounce } from '../hooks/useDebounce';

const genres = [
  'All', 'Fantasy', 'Sci-Fi', 'Romance',
  'Thriller', 'Horror', 'Mystery', 'Adventure', 'Drama',
];

//discover card
function DiscoverCard({ story }: { story: Story }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [forking, setForking] = useState(false);

  const handleFork = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      setForking(true);
      await forkService.forkStory(story.id);
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not fork story.');
    } finally {
      setForking(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-md overflow-hidden cursor-pointer transition-colors duration-150"
      style={{ background: '#0f1011', border: '1px solid #23252a' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#383b3f')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#23252a')}
      onClick={() => navigate(`/stories/${story.id}/read`)}
    >
      {/* Cover */}
      <div className="w-full h-36 overflow-hidden">
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
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3
            className="font-medium text-sm line-clamp-1 transition-colors duration-100"
            style={{ color: '#d0d6e0', letterSpacing: '-0.1px' }}
          >
            {story.title}
          </h3>
          {story.genre && (
            <span
              className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
              style={{ background: '#23252a', color: '#8a8f98' }}
            >
              {story.genre}
            </span>
          )}
        </div>

        {/* Author */}
        <div className="flex items-center gap-1.5 mb-2">
          {story.author.avatar ? (
            <img
              src={story.author.avatar}
              alt={story.author.username}
              className="w-4 h-4 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{ background: '#8dd6ff', color: '#08090a', fontSize: '9px' }}
            >
              {story.author.username[0].toUpperCase()}
            </div>
          )}
          <span style={{ color: '#62666d', fontSize: '12px' }}>
            {story.author.name || story.author.username}
          </span>
        </div>

        {/* Description */}
        {story.description && (
          <p
            className="text-xs line-clamp-2 mb-3"
            style={{ color: '#62666d', lineHeight: '1.5' }}
          >
            {story.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs" style={{ color: '#62666d' }}>
              <GitBranch size={10} /> {story._count?.branches || 0}
            </span>
            <span className="flex items-center gap-1 text-xs" style={{ color: '#62666d' }}>
              <GitFork size={10} /> {story._count?.forks || 0}
            </span>
            <span className="flex items-center gap-1 text-xs" style={{ color: '#62666d' }}>
              <Globe size={10} /> {story.wordCount}w
            </span>
          </div>

          {/* Fork button */}
          <button
            onClick={handleFork}
            disabled={forking}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-all duration-150"
            style={{
              background: 'transparent',
              border: '1px solid #23252a',
              color: '#8a8f98',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(141, 214, 255, 0.3)';
              (e.currentTarget as HTMLElement).style.color = '#8dd6ff';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#23252a';
              (e.currentTarget as HTMLElement).style.color = '#8a8f98';
            }}
          >
            {forking ? (
              <div
                className="w-3 h-3 border rounded-full animate-spin"
                style={{ borderColor: '#383b3f', borderTopColor: '#8a8f98' }}
              />
            ) : (
              <GitFork size={11} />
            )}
            Fork
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// skeleton
function SkeletonCard() {
  return (
    <div
      className="rounded-md overflow-hidden"
      style={{ background: '#0f1011', border: '1px solid #23252a' }}
    >
      <div className="shimmer w-full h-36" />
      <div className="p-3 space-y-2">
        <div className="shimmer h-3.5 w-3/4 rounded" />
        <div className="shimmer h-3 w-1/3 rounded" />
        <div className="shimmer h-3 w-full rounded" />
        <div className="shimmer h-3 w-2/3 rounded" />
      </div>
    </div>
  );
}

// discover page
export default function Discover() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [genre, setGenre] = useState('All');
  const [sort, setSort] = useState<'latest' | 'top'>('latest');
  const [showSortDrop, setShowSortDrop] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setShowSortDrop(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['discover',debouncedSearch , genre, sort],
    queryFn: () =>
      storyService.discover({
        search: search || undefined,
        genre: genre === 'All' ? undefined : genre,
        sort,
      }),
  });

  const stories: Story[] = data?.data?.stories || [];

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
          className="mb-8"
        >
          <h1
            className="font-semibold mb-1"
            style={{
              fontSize: '22px',
              letterSpacing: '-0.22px',
              color: '#f7f8f8',
            }}
          >
            Discover
          </h1>
          <p style={{ color: '#62666d', fontSize: '13px' }}>
            Explore published stories, fork your favourites.
          </p>
        </motion.div>

        {/* ── Search + Sort ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
          className="flex gap-2 mb-4"
        >
          <div className="relative flex-1">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: '#62666d' }}
            />
            <input
              type="text"
              placeholder="Search stories..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-9"
              style={{ fontSize: '13px', height: '34px', padding: '0 12px 0 32px' }}
            />
          </div>

          <div className="flex items-center gap-1.5" ref={sortRef} style={{ position: 'relative' }}>
            <SlidersHorizontal size={12} style={{ color: '#62666d' }} />
            <button
              onClick={() => setShowSortDrop(v => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '13px',
                height: '34px',
                padding: '0 10px',
                width: '120px',
                background: '#0f1011',
                border: '1px solid #23252a',
                borderRadius: 6,
                color: '#f7f8f8',
                cursor: 'pointer',
                justifyContent: 'space-between',
              }}
            >
              {sort === 'latest' ? 'Latest' : 'Top rated'}
              <ChevronDown size={12} style={{ color: '#62666d', transform: showSortDrop ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            </button>
            {showSortDrop && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                right: 0,
                background: '#0f1011',
                border: '1px solid #23252a',
                borderRadius: 6,
                overflow: 'hidden',
                zIndex: 50,
                width: '120px',
                boxShadow: 'rgba(0,0,0,0.6) 0px 8px 24px',
              }}>
                {([['latest', 'Latest'], ['top', 'Top rated']] as const).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => { setSort(val); setShowSortDrop(false); }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '13px',
                      textAlign: 'left',
                      background: sort === val ? 'rgba(141,214,255,0.07)' : 'transparent',
                      color: sort === val ? '#8dd6ff' : '#8a8f98',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'block',
                    }}
                    onMouseEnter={e => { if (sort !== val) (e.currentTarget as HTMLElement).style.background = '#161718'; }}
                    onMouseLeave={e => { if (sort !== val) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Genre Pills ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.12 }}
          className="flex gap-1.5 flex-wrap mb-6"
        >
          {genres.map(g => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className="px-2.5 py-1 rounded text-xs font-medium transition-all duration-150"
              style={
                genre === g
                  ? {
                      background: 'rgba(141, 214, 255, 0.1)',
                      border: '1px solid rgba(141, 214, 255, 0.25)',
                      color: '#8dd6ff',
                    }
                  : {
                      background: 'transparent',
                      border: '1px solid #23252a',
                      color: '#8a8f98',
                    }
              }
              onMouseEnter={e => {
                if (genre !== g) {
                  (e.currentTarget as HTMLElement).style.borderColor = '#383b3f';
                  (e.currentTarget as HTMLElement).style.color = '#f7f8f8';
                }
              }}
              onMouseLeave={e => {
                if (genre !== g) {
                  (e.currentTarget as HTMLElement).style.borderColor = '#23252a';
                  (e.currentTarget as HTMLElement).style.color = '#8a8f98';
                }
              }}
            >
              {g}
            </button>
          ))}
        </motion.div>

        {/* ── Results ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
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
              No stories found
            </h3>
            <p className="text-xs" style={{ color: '#62666d' }}>
              {search
                ? `No results for "${search}"`
                : 'No published stories yet'}
            </p>
          </motion.div>
        ) : (
          <>
            <p
              className="text-xs mb-4"
              style={{ color: '#62666d' }}
            >
              {stories.length} {stories.length === 1 ? 'story' : 'stories'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {stories.map(story => (
                <DiscoverCard key={story.id} story={story} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}