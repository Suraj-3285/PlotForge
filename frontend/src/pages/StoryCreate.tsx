import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  Tag,
  X,
  Loader2,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { storyService } from '../services/api';

// ─────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────
const schema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  genre: z.string().optional(),
});
type Form = z.infer<typeof schema>;

const genres = [
  'Fantasy', 'Sci-Fi', 'Romance', 'Thriller',
  'Horror', 'Mystery', 'Adventure', 'Drama',
];

// ─────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────
export default function StoryCreate() {
  const navigate = useNavigate();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const selectedGenre = watch('genre');

  // ── Tag helpers ──
  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  const handleTagKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); addTag(); }
  };

  // ── Submit ──
  const onSubmit = async (data: Form) => {
    try {
      setLoading(true);
      setError('');
      const res = await storyService.create({
        ...data,
        tags,
      });
      const story = res.data.story;
      const branch = story.branches?.[0];
      if (branch) {
        navigate(`/stories/${story.id}/branches/${branch.id}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen px-4 py-8"
      style={{ background: '#08090a' }}
    >
      <div className="max-w-2xl mx-auto">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded transition-colors duration-150"
            style={{ color: '#62666d', border: '1px solid #23252a' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = '#f7f8f8';
              (e.currentTarget as HTMLElement).style.borderColor = '#383b3f';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = '#62666d';
              (e.currentTarget as HTMLElement).style.borderColor = '#23252a';
            }}
          >
            <ArrowLeft size={14} />
          </button>
          <div>
            <h1
              className="font-semibold"
              style={{
                fontSize: '18px',
                letterSpacing: '-0.22px',
                color: '#f7f8f8',
              }}
            >
              New story
            </h1>
            <p style={{ color: '#62666d', fontSize: '12px' }}>
              A main branch will be created automatically
            </p>
          </div>
        </motion.div>

        {/* ── Form ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-md p-6"
          style={{
            background: '#0f1011',
            border: '1px solid #23252a',
            boxShadow: 'rgba(255, 255, 255, 0.03) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0.6) 0px 0px 0px 1px',
          }}
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 px-3 py-2.5 rounded text-xs"
              style={{
                background: 'rgba(235, 87, 87, 0.08)',
                border: '1px solid rgba(235, 87, 87, 0.2)',
                color: '#eb5757',
              }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Title */}
            <div>
              <label
                className="block mb-1.5 text-xs font-medium"
                style={{ color: '#8a8f98' }}
              >
                Title <span style={{ color: '#eb5757' }}>*</span>
              </label>
              <input
                {...register('title')}
                type="text"
                placeholder="The Lost Kingdom"
                className="input"
                style={{ fontSize: '14px' }}
              />
              {errors.title && (
                <p className="mt-1 text-xs" style={{ color: '#eb5757' }}>
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                className="block mb-1.5 text-xs font-medium"
                style={{ color: '#8a8f98' }}
              >
                Description
                <span className="ml-1.5" style={{ color: '#62666d', fontWeight: 400 }}>
                  optional
                </span>
              </label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="A short description of your story..."
                className="input resize-none"
                style={{ fontSize: '13px', lineHeight: '1.5' }}
              />
              {errors.description && (
                <p className="mt-1 text-xs" style={{ color: '#eb5757' }}>
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Genre */}
            <div>
              <label
                className="block mb-2 text-xs font-medium"
                style={{ color: '#8a8f98' }}
              >
                Genre
                <span className="ml-1.5" style={{ color: '#62666d', fontWeight: 400 }}>
                  optional
                </span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {genres.map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() =>
                      setValue('genre', selectedGenre === g ? '' : g)
                    }
                    className="px-2.5 py-1 rounded text-xs transition-all duration-150"
                    style={
                      selectedGenre === g
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
                      if (selectedGenre !== g) {
                        (e.currentTarget as HTMLElement).style.borderColor = '#383b3f';
                        (e.currentTarget as HTMLElement).style.color = '#f7f8f8';
                      }
                    }}
                    onMouseLeave={e => {
                      if (selectedGenre !== g) {
                        (e.currentTarget as HTMLElement).style.borderColor = '#23252a';
                        (e.currentTarget as HTMLElement).style.color = '#8a8f98';
                      }
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label
                className="block mb-1.5 text-xs font-medium"
                style={{ color: '#8a8f98' }}
              >
                Tags
                <span className="ml-1.5" style={{ color: '#62666d', fontWeight: 400 }}>
                  up to 5
                </span>
              </label>

              {/* Tag pills */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs"
                      style={{
                        background: '#23252a',
                        color: '#8a8f98',
                        border: '1px solid #383b3f',
                      }}
                    >
                      <Tag size={9} />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-0.5 transition-colors"
                        style={{ color: '#62666d' }}
                        onMouseEnter={e =>
                          ((e.currentTarget as HTMLElement).style.color = '#eb5757')
                        }
                        onMouseLeave={e =>
                          ((e.currentTarget as HTMLElement).style.color = '#62666d')
                        }
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKey}
                  placeholder="Add a tag..."
                  disabled={tags.length >= 5}
                  className="input flex-1"
                  style={{ fontSize: '13px' }}
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={!tagInput.trim() || tags.length >= 5}
                  className="btn-secondary px-3 py-2 text-xs"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: '#23252a' }} />

            {/* Info box */}
            <div
              className="flex items-start gap-3 px-3 py-2.5 rounded text-xs"
              style={{
                background: 'rgba(141, 214, 255, 0.04)',
                border: '1px solid rgba(141, 214, 255, 0.1)',
              }}
            >
              <BookOpen size={13} style={{ color: '#8dd6ff', flexShrink: 0, marginTop: '1px' }} />
              <p style={{ color: '#8a8f98', lineHeight: '1.5' }}>
                A <span style={{ color: '#8dd6ff' }}>main</span> branch will be
                created automatically. You can add more branches and commits from
                the editor.
              </p>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-ghost text-xs px-3 py-2"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
              >
                {loading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <BookOpen size={13} />
                )}
                {loading ? 'Creating...' : 'Create story'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}