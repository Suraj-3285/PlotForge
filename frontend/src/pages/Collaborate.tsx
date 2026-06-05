import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  UserPlus,
  Crown,
  Eye,
  Edit3,
  Trash2,
  Loader2,
  GitBranch,
  Globe,
  Lock,
  ChevronDown,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  storyService,
  collaborateService,
  publishService,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Collaborator } from '../types';

// ─────────────────────────────────────────
// INVITE FORM
// ─────────────────────────────────────────
function InviteForm({
  storyId,
  onSuccess,
}: {
  storyId: string;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'VIEWER' | 'EDITOR'>('EDITOR');
  const [error, setError] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const inviteMutation = useMutation({
    mutationFn: () =>
      collaborateService.invite(storyId, { username, role }),
    onSuccess: async () => {
      // invalidate all relevant queries (from 2nd file)
      await queryClient.invalidateQueries({ queryKey: ['collaborators', storyId] });
      await queryClient.invalidateQueries({ queryKey: ['myCollaborations'] });
      await queryClient.invalidateQueries({ queryKey: ['story', storyId] });
      setUsername('');
      setError('');
      onSuccess();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Could not invite user.');
    },
  });

  return (
    <div
      className="rounded-md p-4 mb-6"
      style={{
        background: '#0f1011',
        border: '1px solid #23252a',
      }}
    >
      <h3
        className="font-medium text-xs mb-3 flex items-center gap-2"
        style={{ color: '#8a8f98' }}
      >
        <UserPlus size={13} style={{ color: '#8dd6ff' }} />
        Invite collaborator
      </h3>

      {error && (
        <div
          className="mb-3 px-3 py-2 rounded text-xs"
          style={{
            background: 'rgba(235, 87, 87, 0.08)',
            border: '1px solid rgba(235, 87, 87, 0.2)',
            color: '#eb5757',
          }}
        >
          {error}
        </div>
      )}

      <div className="flex gap-2">
        {/* Username input */}
        <div className="relative flex-1">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: '#62666d' }}
          >
            @
          </span>
          <input
            type="text"
            placeholder="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && username.trim()) {
                inviteMutation.mutate();
              }
            }}
            className="input pl-7"
            style={{ fontSize: '13px', height: '34px', padding: '0 12px 0 24px' }}
          />
        </div>

        {/* Role selector */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-1.5 px-3 rounded text-xs transition-colors duration-150"
            style={{
              background: '#161718',
              border: '1px solid #23252a',
              color: '#8a8f98',
              height: '34px',
              minWidth: '90px',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#383b3f';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#23252a';
            }}
          >
            {role === 'EDITOR' ? (
              <Edit3 size={11} style={{ color: '#8dd6ff' }} />
            ) : (
              <Eye size={11} style={{ color: '#5fed83' }} />
            )}
            {role}
            <ChevronDown
              size={10}
              style={{
                color: '#62666d',
                transform: showRoleDropdown ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 0.15s',
              }}
            />
          </button>

          <AnimatePresence>
            {showRoleDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.97 }}
                transition={{ duration: 0.1 }}
                className="absolute right-0 mt-1 w-40 rounded-md overflow-hidden z-10"
                style={{
                  background: '#161718',
                  border: '1px solid #23252a',
                  boxShadow: 'rgba(8, 9, 10, 0.6) 0px 4px 32px 0px',
                }}
              >
                <div className="p-1">
                  {(['EDITOR', 'VIEWER'] as const).map(r => (
                    <button
                      key={r}
                      onClick={() => {
                        setRole(r);
                        setShowRoleDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs transition-colors duration-100"
                      style={{
                        color: role === r ? '#f7f8f8' : '#8a8f98',
                        background: role === r ? '#23252a' : 'transparent',
                      }}
                      onMouseEnter={e => {
                        if (role !== r) {
                          (e.currentTarget as HTMLElement).style.background = '#23252a';
                          (e.currentTarget as HTMLElement).style.color = '#f7f8f8';
                        }
                      }}
                      onMouseLeave={e => {
                        if (role !== r) {
                          (e.currentTarget as HTMLElement).style.background = 'transparent';
                          (e.currentTarget as HTMLElement).style.color = '#8a8f98';
                        }
                      }}
                    >
                      {r === 'EDITOR' ? (
                        <Edit3 size={11} style={{ color: '#8dd6ff' }} />
                      ) : (
                        <Eye size={11} style={{ color: '#5fed83' }} />
                      )}
                      <div>
                        <p>{r}</p>
                        <p style={{ color: '#62666d', fontSize: '10px' }}>
                          {r === 'EDITOR' ? 'Can write and commit' : 'Can read only'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Invite button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => username.trim() && inviteMutation.mutate()}
          disabled={!username.trim() || inviteMutation.isPending}
          className="btn-primary text-xs px-3 flex items-center gap-1.5"
          style={{ height: '34px' }}
        >
          {inviteMutation.isPending ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <UserPlus size={12} />
          )}
          Invite
        </motion.button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// COLLABORATOR ROW
// ─────────────────────────────────────────
function CollaboratorRow({
  collaborator,
  storyId,
  isAuthor,
}: {
  collaborator: Collaborator;
  storyId: string;
  isAuthor: boolean;
}) {
  const queryClient = useQueryClient();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const updateRoleMutation = useMutation({
    mutationFn: (role: 'VIEWER' | 'EDITOR') =>
      collaborateService.updateRole(storyId, collaborator.id, role),
    onSuccess: async () => {
      // also invalidate story query (from 2nd file)
      await queryClient.invalidateQueries({ queryKey: ['collaborators', storyId] });
      await queryClient.invalidateQueries({ queryKey: ['story', storyId] });
      setShowRoleDropdown(false);
    },
  });

  const removeMutation = useMutation({
    mutationFn: () =>
      collaborateService.remove(storyId, collaborator.id),
    onSuccess: async () => {
      // also invalidate story query (from 2nd file)
      await queryClient.invalidateQueries({ queryKey: ['collaborators', storyId] });
      await queryClient.invalidateQueries({ queryKey: ['story', storyId] });
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-3 py-2.5 rounded-md transition-colors duration-150"
      style={{
        background: '#0f1011',
        border: '1px solid #23252a',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#383b3f')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#23252a')}
    >
      {/* User info */}
      <div className="flex items-center gap-3">
        {collaborator.user.avatar ? (
          <img
            src={collaborator.user.avatar}
            alt={collaborator.user.username}
            className="w-7 h-7 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
            style={{
              background: '#8dd6ff',
              color: '#08090a',
              fontSize: '10px',
            }}
          >
            {collaborator.user.username[0].toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-xs font-medium" style={{ color: '#d0d6e0' }}>
            {collaborator.user.name || collaborator.user.username}
          </p>
          <p style={{ color: '#62666d', fontSize: '11px' }}>
            @{collaborator.user.username}
          </p>
        </div>
      </div>

      {/* Role + actions */}
      <div className="flex items-center gap-2">
        {/* Role badge / dropdown */}
        {isAuthor ? (
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors duration-150"
              style={{
                background: '#161718',
                border: '1px solid #23252a',
                color: collaborator.role === 'EDITOR' ? '#8dd6ff' : '#5fed83',
              }}
              onMouseEnter={e =>
                ((e.currentTarget as HTMLElement).style.borderColor = '#383b3f')
              }
              onMouseLeave={e =>
                ((e.currentTarget as HTMLElement).style.borderColor = '#23252a')
              }
            >
              {collaborator.role === 'EDITOR' ? (
                <Edit3 size={10} />
              ) : (
                <Eye size={10} />
              )}
              {collaborator.role}
              <ChevronDown size={10} style={{ color: '#62666d' }} />
            </button>

            <AnimatePresence>
              {showRoleDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 mt-1 w-36 rounded-md overflow-hidden z-10"
                  style={{
                    background: '#161718',
                    border: '1px solid #23252a',
                    boxShadow: 'rgba(8, 9, 10, 0.6) 0px 4px 32px 0px',
                  }}
                >
                  <div className="p-1">
                    {(['EDITOR', 'VIEWER'] as const).map(r => (
                      <button
                        key={r}
                        onClick={() => updateRoleMutation.mutate(r)}
                        disabled={updateRoleMutation.isPending}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs transition-colors duration-100"
                        style={{
                          color: collaborator.role === r ? '#f7f8f8' : '#8a8f98',
                          background: collaborator.role === r ? '#23252a' : 'transparent',
                        }}
                        onMouseEnter={e => {
                          if (collaborator.role !== r) {
                            (e.currentTarget as HTMLElement).style.background = '#23252a';
                            (e.currentTarget as HTMLElement).style.color = '#f7f8f8';
                          }
                        }}
                        onMouseLeave={e => {
                          if (collaborator.role !== r) {
                            (e.currentTarget as HTMLElement).style.background = 'transparent';
                            (e.currentTarget as HTMLElement).style.color = '#8a8f98';
                          }
                        }}
                      >
                        {r === 'EDITOR' ? (
                          <Edit3 size={10} style={{ color: '#8dd6ff' }} />
                        ) : (
                          <Eye size={10} style={{ color: '#5fed83' }} />
                        )}
                        {r}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <span
            className="flex items-center gap-1 px-2 py-0.5 rounded text-xs"
            style={{
              background: '#161718',
              border: '1px solid #23252a',
              color: collaborator.role === 'EDITOR' ? '#8dd6ff' : '#5fed83',
            }}
          >
            {collaborator.role === 'EDITOR' ? (
              <Edit3 size={10} />
            ) : (
              <Eye size={10} />
            )}
            {collaborator.role}
          </span>
        )}

        {/* Remove */}
        {isAuthor && (
          <button
            onClick={() => {
              if (confirm('Remove this collaborator?')) {
                removeMutation.mutate();
              }
            }}
            disabled={removeMutation.isPending}
            className="p-1.5 rounded transition-colors duration-100"
            style={{ color: '#62666d' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = '#eb5757';
              (e.currentTarget as HTMLElement).style.background = 'rgba(235, 87, 87, 0.08)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = '#62666d';
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            {removeMutation.isPending ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Trash2 size={12} />
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────
export default function Collaborate() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [publishingBranchId, setPublishingBranchId] = useState('');

  // ── Fetch story ──
  const { data: storyData } = useQuery({
    queryKey: ['story', storyId],
    queryFn: () => storyService.getMyStory(storyId!),
  });

  // ── Fetch collaborators ──
  const { data: collabData, isLoading } = useQuery({
    queryKey: ['collaborators', storyId],
    queryFn: () => collaborateService.getCollaborators(storyId!),
  });

  // ── Fetch endings ──
  const { data: endingsData } = useQuery({
    queryKey: ['endings', storyId],
    queryFn: () => publishService.getEndings(storyId!),
  });

  const story = storyData?.data?.story;
  const collaborators: Collaborator[] = collabData?.data?.collaborators || [];
  const endings = endingsData?.data?.endings || [];
  const isAuthor = story?.authorId === user?.id;
  const branches = story?.branches || [];

  // ── Publish mutation (with onSuccess from 2nd file) ──
  const publishMutation = useMutation({
    mutationFn: () =>
      publishService.publish(storyId!, publishingBranchId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['endings', storyId] });
      await queryClient.invalidateQueries({ queryKey: ['story', storyId] });
      setPublishingBranchId('');
    },
  });

  // ── Unpublish mutation (with extra invalidations from 2nd file) ──
  const unpublishMutation = useMutation({
    mutationFn: (publishingId: string) =>
      publishService.unpublish(storyId!, publishingId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['endings', storyId] });
      await queryClient.invalidateQueries({ queryKey: ['story', storyId] });
      await queryClient.invalidateQueries({ queryKey: ['myStories'] });
      await queryClient.invalidateQueries({ queryKey: ['discover'] });
    },
  });

  return (
    <div
      className="min-h-screen px-4 py-8"
      style={{ background: '#08090a' }}
    >
      <div className="max-w-3xl mx-auto">

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
              Collaborate
            </h1>
            <p style={{ color: '#62666d', fontSize: '12px' }}>
              {story?.title}
            </p>
          </div>
        </motion.div>

        {/* ── Invite (author only) ── */}
        {isAuthor && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <InviteForm storyId={storyId!} onSuccess={() => {}} />
          </motion.div>
        )}

        {/* ── Collaborators list ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <Users size={13} style={{ color: '#8dd6ff' }} />
            <h2 className="font-medium text-xs" style={{ color: '#8a8f98' }}>
              Collaborators
              <span
                className="ml-2 px-1.5 py-0.5 rounded"
                style={{
                  background: '#23252a',
                  color: '#62666d',
                  fontSize: '11px',
                }}
              >
                {collaborators.length}
              </span>
            </h2>
          </div>

          {/* Author row */}
          {story && (
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-md mb-2"
              style={{
                background: '#0f1011',
                border: '1px solid #23252a',
              }}
            >
              {story.author?.avatar ? (
                <img
                  src={story.author.avatar}
                  alt={story.author.username}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{
                    background: '#8dd6ff',
                    color: '#08090a',
                    fontSize: '10px',
                  }}
                >
                  {story.author?.username?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <p className="text-xs font-medium" style={{ color: '#d0d6e0' }}>
                  {story.author?.name || story.author?.username}
                </p>
                <p style={{ color: '#62666d', fontSize: '11px' }}>
                  @{story.author?.username}
                </p>
              </div>
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded text-xs"
                style={{
                  background: 'rgba(141, 214, 255, 0.08)',
                  border: '1px solid rgba(141, 214, 255, 0.15)',
                  color: '#8dd6ff',
                }}
              >
                <Crown size={10} />
                Author
              </span>
            </div>
          )}

          {/* Collaborator rows */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={16} className="animate-spin" style={{ color: '#8a8f98' }} />
            </div>
          ) : collaborators.length === 0 ? (
            <div
              className="text-center py-8 rounded-md"
              style={{ background: '#0f1011', border: '1px solid #23252a' }}
            >
              <Users size={24} className="mx-auto mb-2" style={{ color: '#383b3f' }} />
              <p className="text-xs" style={{ color: '#62666d' }}>
                No collaborators yet
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {collaborators.map(c => (
                <CollaboratorRow
                  key={c.id}
                  collaborator={c}
                  storyId={storyId!}
                  isAuthor={isAuthor}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Publish endings (author only) ── */}
        {isAuthor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <div style={{ height: '1px', background: '#23252a' }} className="mb-6" />

            <div className="flex items-center gap-2 mb-4">
              <GitBranch size={13} style={{ color: '#8dd6ff' }} />
              <h2 className="font-medium text-xs" style={{ color: '#8a8f98' }}>
                Publish endings
              </h2>
            </div>

            {/* Publish a branch */}
            <div
              className="rounded-md p-4 mb-4"
              style={{ background: '#0f1011', border: '1px solid #23252a' }}
            >
              <p className="text-xs mb-3" style={{ color: '#8a8f98' }}>
                Publish a branch as a story ending
              </p>
              <div className="flex gap-2">
                <select
                  value={publishingBranchId}
                  onChange={e => setPublishingBranchId(e.target.value)}
                  className="input flex-1"
                  style={{ fontSize: '13px', height: '34px', padding: '0 8px' }}
                >
                  <option value="">Select a branch...</option>
                  {branches.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.name}{b.isDefault ? ' (default)' : ''}
                    </option>
                  ))}
                </select>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => publishMutation.mutate()}
                  disabled={!publishingBranchId || publishMutation.isPending}
                  className="btn-primary text-xs px-3 flex items-center gap-1.5"
                  style={{ height: '34px' }}
                >
                  {publishMutation.isPending ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Globe size={12} />
                  )}
                  Publish
                </motion.button>
              </div>
              {publishMutation.isError && (
                <p className="mt-2 text-xs" style={{ color: '#eb5757' }}>
                  {(publishMutation.error as any)?.response?.data?.message ||
                    'Could not publish.'}
                </p>
              )}
            </div>

            {/* Published endings */}
            {endings.length > 0 && (
              <div className="space-y-1.5">
                {endings.map((ending: any) => (
                  <div
                    key={ending.id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-md"
                    style={{
                      background: '#0f1011',
                      border: '1px solid rgba(95, 237, 131, 0.15)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Globe size={12} style={{ color: '#5fed83' }} />
                      <span className="text-xs font-medium" style={{ color: '#d0d6e0' }}>
                        {ending.branch?.name}
                      </span>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{
                          background: 'rgba(95, 237, 131, 0.08)',
                          border: '1px solid rgba(95, 237, 131, 0.15)',
                          color: '#5fed83',
                        }}
                      >
                        Published
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Unpublish this ending?')) {
                          unpublishMutation.mutate(ending.id);
                        }
                      }}
                      disabled={unpublishMutation.isPending}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors duration-100"
                      style={{ color: '#62666d', border: '1px solid #23252a' }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.color = '#eb5757';
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(235, 87, 87, 0.2)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.color = '#62666d';
                        (e.currentTarget as HTMLElement).style.borderColor = '#23252a';
                      }}
                    >
                      <Lock size={10} />
                      Unpublish
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
