import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  GitCommit,
  GitBranch,
  Clock,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { storyService, branchService, commitService } from "../services/api";
import type { Branch, Commit } from "../types";

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "just now";
};

function CommitCard({
  commit,
  isLatest,
  storyId,
  branchId,
}: {
  commit: Commit;
  isLatest: boolean;
  storyId: string;
  branchId: string;
}) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        position: "relative",
        display: "flex",
        gap: 16,
        marginBottom: 4,
      }}
    >
      {/* Timeline line */}
      <div
        style={{
          position: "absolute",
          left: 13,
          top: 36,
          bottom: 0,
          width: 1,
          background: "var(--border)",
        }}
      />

      {/* Dot */}
      <div
        style={{
          flexShrink: 0,
          marginTop: 12,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isLatest ? "var(--accent-subtle)" : "var(--bg-subtle)",
            border: `1.5px solid ${isLatest ? "var(--accent-border)" : "var(--border)"}`,
          }}
        >
          <GitCommit
            size={12}
            style={{ color: isLatest ? "var(--accent)" : "var(--text-muted)" }}
          />
        </div>
      </div>

      {/* Card */}
      <div
        style={{
          flex: 1,
          marginBottom: 12,
          borderRadius: 10,
          background: "var(--bg)",
          border: "1.5px solid var(--border)",
          boxShadow: "var(--shadow-xs)",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor =
            "var(--border-strong)";
          (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
          (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-xs)";
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            padding: "14px 16px",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              {isLatest && (
                <span className="badge badge-accent" style={{ fontSize: 10 }}>
                  latest
                </span>
              )}
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-body)",
                  letterSpacing: "-0.01em",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {commit.message}
              </h3>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {commit.author?.avatar ? (
                  <img
                    src={commit.author.avatar}
                    alt={commit.author.username}
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "var(--accent)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 8,
                      fontWeight: 700,
                    }}
                  >
                    {commit.author?.username?.[0]?.toUpperCase()}
                  </div>
                )}
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {commit.author?.username}
                </span>
              </div>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-body)",
                }}
              >
                <Clock size={11} />
                {timeAgo(commit.createdAt)}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {commit.wordCount}w
              </span>
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => setExpanded(!expanded)}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 12, padding: "5px 10px" }}
            >
              {expanded ? "Hide" : "Preview"}
            </button>
            {isLatest && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  navigate(`/stories/${storyId}/branches/${branchId}`)
                }
                className="btn btn-primary btn-sm"
                style={{ fontSize: 12, gap: 4 }}
              >
                Edit <ChevronRight size={11} />
              </motion.button>
            )}
          </div>
        </div>

        {/* Preview */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              borderTop: "1px solid var(--border)",
              padding: "14px 16px",
            }}
          >
            <p
              style={{
                fontSize: 14,
                color: "var(--text-secondary)",
                lineHeight: 1.75,
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                display: "-webkit-box",
                WebkitLineClamp: 6,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {commit.content}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default function CommitHistory() {
  const { storyId } = useParams<{ storyId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeBranchId, setActiveBranchId] = useState<string>(
    searchParams.get("branch") || "",
  );

  const { data: storyData } = useQuery<any>({
    queryKey: ["story", storyId],
    queryFn: () => storyService.getMyStory(storyId!),
  });
  const { data: branchesData } = useQuery<any>({
    queryKey: ["branches", storyId],
    queryFn: () => branchService.getBranches(storyId!),
  });
  const { data: commitsData, isLoading: commitsLoading } = useQuery<any>({
    queryKey: ["commits", storyId, activeBranchId],
    queryFn: () => commitService.getCommits(storyId!, activeBranchId),
    enabled: !!activeBranchId,
  });

  const story = storyData?.data?.story;
  const branches: Branch[] = branchesData?.data?.branches || [];
  const commits: Commit[] = commitsData?.data?.commits || [];
  const activeBranch = branches.find((b) => b.id === activeBranchId);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Page header */}
      <div style={{ borderBottom: "1px solid var(--border)" }}>
        <div
          style={{ maxWidth: 800, margin: "0 auto", padding: "32px 32px 0" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 28,
            }}
          >
            <button
              onClick={() => navigate(-1)}
              className="btn btn-secondary btn-sm"
              style={{ padding: "7px 10px" }}
            >
              <ArrowLeft size={14} />
            </button>
            <div>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  marginBottom: 3,
                  fontFamily: "var(--font-body)",
                }}
              >
                Commit history
              </p>
              <h1
                style={{
                  fontSize: "clamp(18px,2.5vw,26px)",
                  fontWeight: 400,
                  fontStyle: "italic",
                  letterSpacing: "-0.03em",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-display)",
                  lineHeight: 1,
                }}
              >
                {story?.title}
              </h1>
            </div>
          </motion.div>

          {/* Branch tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            style={{ display: "flex", gap: 0, flexWrap: "wrap" }}
          >
            {branches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => setActiveBranchId(branch.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 14px",
                  fontSize: 13,
                  fontWeight: 500,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  color:
                    activeBranchId === branch.id
                      ? "var(--text-primary)"
                      : "var(--text-muted)",
                  borderBottom: `2px solid ${activeBranchId === branch.id ? "var(--text-primary)" : "transparent"}`,
                  marginBottom: -1,
                  transition: "all 0.15s",
                }}
              >
                <GitBranch size={12} />
                {branch.name}
                {branch.isDefault && (
                  <span
                    className="badge badge-default"
                    style={{ fontSize: 10 }}
                  >
                    default
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div
        style={{ maxWidth: 800, margin: "0 auto", padding: "28px 32px 80px" }}
      >
        {/* Stats bar */}
        {activeBranch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.08 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 28,
              padding: "12px 16px",
              borderRadius: 10,
              background: "var(--bg-subtle)",
              border: "1.5px solid var(--border)",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                color: "var(--text-secondary)",
                fontFamily: "var(--font-body)",
              }}
            >
              <GitCommit size={13} style={{ color: "var(--accent)" }} />
              {commits.length} commits
            </span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                color: "var(--text-secondary)",
                fontFamily: "var(--font-body)",
              }}
            >
              <GitBranch size={13} style={{ color: "var(--accent)" }} />
              {activeBranch.name}
            </span>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                navigate(`/stories/${storyId}/branches/${activeBranchId}`)
              }
              className="btn btn-primary btn-sm"
              style={{ marginLeft: "auto", gap: 5 }}
            >
              Open editor <ChevronRight size={12} />
            </motion.button>
          </motion.div>
        )}

        {/* Commits */}
        {commitsLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "64px 0",
            }}
          >
            <Loader2
              size={20}
              style={{
                color: "var(--text-muted)",
                animation: "spin 0.7s linear infinite",
              }}
            />
          </div>
        ) : commits.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: "center", padding: "80px 0" }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                background: "var(--bg-muted)",
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
              }}
            >
              <GitCommit size={22} style={{ color: "var(--text-muted)" }} />
            </div>
            <h3
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: 6,
                fontFamily: "var(--font-body)",
              }}
            >
              No commits yet
            </h3>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                fontFamily: "var(--font-body)",
              }}
            >
              Start writing to create your first commit
            </p>
          </motion.div>
        ) : (
          <div style={{ position: "relative" }}>
            {commits.map((commit, index) => (
              <CommitCard
                key={commit.id}
                commit={commit}
                isLatest={index === 0}
                storyId={storyId!}
                branchId={activeBranchId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}