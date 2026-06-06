import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion,AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  Globe,
  Edit2,
  Camera,
  Save,
  Loader2,
  User,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userServices } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Story } from '../types';

// ─────────────────────────────────────────
// STORY CARD
// ─────────────────────────────────────────
function ProfileStoryCard({ story }: { story: Story }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-md overflow-hidden cursor-pointer transition-colors duration-150"
      style={{ background: '#0f1011', border: '1px solid #23252a' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#383b3f')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#23252a')}
      onClick={() => navigate(`/stories/${story.id}/read`)}
    >
      {/* Cover */}
      <div className="w-full h-28 overflow-hidden">
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
            <BookOpen size={20} style={{ color: '#383b3f' }} />
          </div>
        )}
      </div>

      <div className="p-3">
        <h3
          className="font-medium text-sm line-clamp-1 mb-1 transition-colors duration-100"
          style={{ color: '#d0d6e0', letterSpacing: '-0.1px' }}
        >
          {story.title}
        </h3>

        {story.description && (
          <p
            className="text-xs line-clamp-2 mb-2"
            style={{ color: '#62666d', lineHeight: '1.5' }}
          >
            {story.description}
          </p>
        )}

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
            <Globe size={10} />
            {story.wordCount}w
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────
// EDIT PROFILE FORM
// ─────────────────────────────────────────
function EditProfileForm({
  user,
  onClose,
}: {
  user: any;
  onClose: () => void;
}) {
  const { updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [username, setUsername] = useState(user.username || '');
  const [error, setError] = useState('');

  const updateMutation = useMutation({
    mutationFn: () =>
      userServices.updateProfile({ name, bio, username }),
    onSuccess: res => {
      updateUser(res.data.user);
      queryClient.invalidateQueries({ queryKey: ['profile', username] });
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Something went wrong.');
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(8, 9, 10, 0.85)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-md rounded-md p-5"
        style={{
          background: '#0f1011',
          border: '1px solid #23252a',
          boxShadow: 'rgba(8, 9, 10, 0.6) 0px 4px 32px 0px',
        }}
      >
        <h3
          className="font-medium text-sm mb-4"
          style={{ color: '#f7f8f8', letterSpacing: '-0.1px' }}
        >
          Edit profile
        </h3>

        {error && (
          <div
            className="mb-4 px-3 py-2.5 rounded text-xs"
            style={{
              background: 'rgba(235, 87, 87, 0.08)',
              border: '1px solid rgba(235, 87, 87, 0.2)',
              color: '#eb5757',
            }}
          >
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label
              className="block mb-1.5 text-xs font-medium"
              style={{ color: '#8a8f98' }}
            >
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input"
              style={{ fontSize: '13px' }}
            />
          </div>

          <div>
            <label
              className="block mb-1.5 text-xs font-medium"
              style={{ color: '#8a8f98' }}
            >
              Username
            </label>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs"
                style={{ color: '#62666d' }}
              >
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="input pl-7"
                style={{ fontSize: '13px' }}
              />
            </div>
          </div>

          <div>
            <label
              className="block mb-1.5 text-xs font-medium"
              style={{ color: '#8a8f98' }}
            >
              Bio
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              placeholder="Tell the world about yourself..."
              className="input resize-none"
              style={{ fontSize: '13px', lineHeight: '1.5' }}
              maxLength={200}
            />
            <p
              className="text-xs mt-1 text-right"
              style={{ color: '#62666d' }}
            >
              {bio.length}/200
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="btn-ghost text-xs px-3 py-1.5"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5"
          >
            {updateMutation.isPending ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Save size={12} />
            )}
            Save
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────
export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: authUser, updateUser } = useAuth();
  const queryClient = useQueryClient();

  const [showEdit, setShowEdit] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const isOwnProfile = authUser?.username === username;

  // ── Fetch profile ──
  const { data, isLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => userServices.getPublicProfile(username!),
  });

  const profile = data?.data?.user;
  const stories: Story[] = profile?.stories || [];

  // ── Avatar upload ──
  const handleAvatarChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingAvatar(true);
      const res = await userServices.updateAvatar(file);
      updateUser(res.data.user);
      queryClient.invalidateQueries({ queryKey: ['profile', username] });
    } catch {
      alert('Failed to upload avatar.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#08090a' }}
      >
        <Loader2
          size={18}
          className="animate-spin"
          style={{ color: '#8a8f98' }}
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#08090a' }}
      >
        <div className="text-center">
          <User size={28} className="mx-auto mb-3" style={{ color: '#383b3f' }} />
          <p style={{ color: '#8a8f98', fontSize: '14px' }}>
            User not found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-4 py-8"
      style={{ background: '#08090a' }}
    >
      <div className="max-w-4xl mx-auto">

        {/* ── Back ── */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 mb-6 text-xs transition-colors duration-150"
          style={{ color: '#62666d' }}
          onMouseEnter={e =>
            ((e.currentTarget as HTMLElement).style.color = '#f7f8f8')
          }
          onMouseLeave={e =>
            ((e.currentTarget as HTMLElement).style.color = '#62666d')
          }
        >
          <ArrowLeft size={13} />
          Back
        </motion.button>

        {/* ── Profile Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-6 mb-8 pb-8"
          style={{ borderBottom: '1px solid #23252a' }}
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.username}
                className="w-16 h-16 rounded-full object-cover"
                style={{ border: '2px solid #23252a' }}
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold"
                style={{
                  background: '#8dd6ff',
                  color: '#08090a',
                  border: '2px solid #23252a',
                }}
              >
                {profile.username[0].toUpperCase()}
              </div>
            )}

            {/* Avatar upload button */}
            {isOwnProfile && (
              <label
                htmlFor="avatar-input"
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-150"
                style={{
                  background: '#161718',
                  border: '1px solid #23252a',
                  color: '#8a8f98',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = '#23252a';
                  (e.currentTarget as HTMLElement).style.color = '#f7f8f8';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = '#161718';
                  (e.currentTarget as HTMLElement).style.color = '#8a8f98';
                }}
              >
                {uploadingAvatar ? (
                  <Loader2 size={10} className="animate-spin" />
                ) : (
                  <Camera size={10} />
                )}
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1
                  className="font-semibold mb-0.5"
                  style={{
                    fontSize: '20px',
                    letterSpacing: '-0.22px',
                    color: '#f7f8f8',
                  }}
                >
                  {profile.name || profile.username}
                </h1>
                <p
                  className="text-sm mb-2"
                  style={{ color: '#62666d' }}
                >
                  @{profile.username}
                </p>
                {profile.bio && (
                  <p
                    className="text-sm mb-3"
                    style={{
                      color: '#8a8f98',
                      lineHeight: '1.5',
                      maxWidth: '480px',
                    }}
                  >
                    {profile.bio}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-5">
                  <div>
                    <span
                      className="font-semibold text-sm"
                      style={{ color: '#f7f8f8' }}
                    >
                      {profile._count?.stories || 0}
                    </span>
                    <span
                      className="text-xs ml-1"
                      style={{ color: '#62666d' }}
                    >
                      stories
                    </span>
                  </div>
                  <div>
                    <span
                      className="font-semibold text-sm"
                      style={{ color: '#f7f8f8' }}
                    >
                      {profile._count?.collaborations || 0}
                    </span>
                    <span
                      className="text-xs ml-1"
                      style={{ color: '#62666d' }}
                    >
                      collaborations
                    </span>
                  </div>
                  <div>
                    <span
                      className="text-xs"
                      style={{ color: '#62666d' }}
                    >
                      Joined{' '}
                      {new Date(profile.createdAt).toLocaleDateString(
                        'en-US',
                        { month: 'short', year: 'numeric' }
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit button */}
              {isOwnProfile && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowEdit(true)}
                  className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0"
                >
                  <Edit2 size={12} />
                  Edit profile
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Stories ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="font-medium text-sm"
              style={{ color: '#f7f8f8' }}
            >
              Published stories
              <span
                className="ml-2 px-1.5 py-0.5 rounded text-xs"
                style={{
                  background: '#23252a',
                  color: '#62666d',
                  fontSize: '11px',
                }}
              >
                {stories.length}
              </span>
            </h2>
          </div>

          {stories.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen
                size={28}
                className="mx-auto mb-3"
                style={{ color: '#383b3f' }}
              />
              <p
                className="text-sm"
                style={{ color: '#8a8f98' }}
              >
                {isOwnProfile
                  ? 'You have no published stories yet'
                  : 'No published stories yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {stories.map(story => (
                <ProfileStoryCard key={story.id} story={story} />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
      {showEdit && (
        <EditProfileForm
          user={profile}
          onClose={() => setShowEdit(false)}
        />
      )}
      </AnimatePresence>
    </div>
  );
}