import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PermissionNotice from "../components/PermissionNotice";
import {
  ArrowLeft,
  BookOpen,
  GitFork,
  GitBranch,
  Star,
  Globe,
  Loader2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  storyService,
  publishService,
  ratingService,
  forkService,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Publishing } from "../types";
import { timeAgo } from "../utils/format";

/*Star Rating*/
function StarRating({
  publishingId,
  avgRating,
  totalRatings,
  userRating,
  isAuthor,
}: {
  publishingId: string;
  avgRating: number;
  totalRatings: number;
  userRating: number | null;
  isAuthor: boolean;
}) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const ratingDisabled = !isAuthenticated || isAuthor;
  const [hovered, setHovered] = useState(0);

  const rateMutation = useMutation({
    mutationFn: (stars: number) => ratingService.rate(publishingId, stars),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["ending", publishingId] }),
    onError: (err: any) => {
      alert(err.response?.data?.message || "Could not save rating");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => ratingService.deleteRating(publishingId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["ending", publishingId] }),
    onError: (err: any) => {
      alert(err.response?.data?.message || "Could not remove rating");
    },
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              disabled={ratingDisabled}
              onClick={() =>
                userRating === star
                  ? deleteMutation.mutate()
                  : rateMutation.mutate(star)
              }
              onMouseEnter={() => isAuthenticated && setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              style={{
                background: "none",
                border: "none",
                cursor: ratingDisabled ? "default" : "pointer",
                padding: 1,
                transform: hovered >= star ? "scale(1.18)" : "scale(1)",
                transition: "transform 0.1s",
              }}
            >
              <Star
                size={16}
                style={{
                  color:
                    hovered >= star || (userRating ?? 0) >= star
                      ? "#f59e0b"
                      : "var(--border-strong)",
                  fill:
                    hovered >= star || (userRating ?? 0) >= star
                      ? "#f59e0b"
                      : "transparent",
                  transition: "all 0.1s",
                }}
              />
            </button>
          ))}
        </div>
        <span
          style={{
            fontSize: 13,
            color: "var(--text-muted)",
            fontFamily: "var(--font-body)",
          }}
        >
          {avgRating > 0 ? avgRating.toFixed(1) : "—"}
          {totalRatings > 0 && ` (${totalRatings})`}
        </span>
        {userRating && (
          <span
            style={{
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 99,
              fontFamily: "var(--font-body)",
              background: "#fffbeb",
              border: "1px solid #fde68a",
              color: "#92400e",
            }}
          >
            Your rating: {userRating}★
          </span>
        )}
      </div>

      {isAuthor && (
        <div style={{ marginTop: 8 }}>
          <PermissionNotice
            title="Authors cannot rate their own stories"
            message="Ratings are only available to readers."
          />
        </div>
      )}
    </div>
  );
}

/*Ending sidebar card*/
function EndingCard({
  ending,
  isActive,
  onClick,
}: {
  ending: Publishing;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "10px 12px",
        borderRadius: 8,
        cursor: "pointer",
        border: `1.5px solid ${isActive ? "var(--accent-border)" : "var(--border)"}`,
        background: isActive ? "var(--accent-subtle)" : "var(--bg)",
        transition: "all 0.15s",
        display: "block",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.borderColor =
            "var(--border-strong)";
          (e.currentTarget as HTMLElement).style.background =
            "var(--bg-subtle)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
          (e.currentTarget as HTMLElement).style.background = "var(--bg)";
        }
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 3,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: isActive ? "var(--accent)" : "var(--text-primary)",
            fontFamily: "var(--font-body)",
          }}
        >
          {ending.branch.name}
        </span>
        {ending.avgRating && ending.avgRating > 0 ? (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              fontSize: 12,
              color: "#f59e0b",
              fontFamily: "var(--font-body)",
            }}
          >
            <Star size={10} fill="#f59e0b" style={{ color: "#f59e0b" }} />
            {ending.avgRating.toFixed(1)}
          </span>
        ) : null}
      </div>
      <p
        style={{
          fontSize: 12,
          color: "var(--text-muted)",
          fontFamily: "var(--font-body)",
        }}
      >
        {timeAgo(ending.publishedAt)}
        {ending.totalRatings ? ` · ${ending.totalRatings} ratings` : ""}
      </p>
    </button>
  );
}

/*Page*/
export default function StoryRead() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeEndingId, setActiveEndingId] = useState<string | null>(null);
  const [forking, setForking] = useState(false);

  const { data: storyData, isLoading: storyLoading } = useQuery<any>({
    queryKey: ["story", storyId],
    queryFn: () => storyService.getMyStory(storyId!),
  });
  const { data: endingsData } = useQuery<any>({
    queryKey: ["endings", storyId],
    queryFn: () => publishService.getEndings(storyId!),
    onSuccess: (data: any) => {
      const endings = data?.data?.endings || [];
      if (!activeEndingId && endings.length > 0)
        setActiveEndingId(endings[0].id);
    },
  } as any);
  const { data: endingData, isLoading: endingLoading } = useQuery<any>({
    queryKey: ["ending", activeEndingId],
    queryFn: () => publishService.readEnding(activeEndingId!),
    enabled: !!activeEndingId,
  });

  const story = storyData?.data?.story;
  const endings: Publishing[] = endingsData?.data?.endings || [];
  const ending = endingData?.data?.ending;

  const handleFork = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      setForking(true);
      await forkService.forkStory(storyId!);
      navigate("/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.message || "Could not fork.");
    } finally {
      setForking(false);
    }
  };

  if (storyLoading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
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
    );

  if (!story)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: "var(--bg-muted)",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <BookOpen size={24} style={{ color: "var(--text-muted)" }} />
          </div>
          <p
            style={{
              fontSize: 14,
              color: "var(--text-secondary)",
              fontFamily: "var(--font-body)",
            }}
          >
            Story not found.
          </p>
        </div>
      </div>
    );

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div
        style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 32px 80px" }}
      >
        {/* Back */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate(-1)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 28,
            fontSize: 13,
            color: "var(--text-muted)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            padding: "6px 0",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.color =
              "var(--text-primary)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")
          }
        >
          <ArrowLeft size={14} /> Back
        </motion.button>

        {/* Layout */}
        <div style={{ display: "flex", gap: 48, alignItems: "flex-start" }}>
          {/* Main*/}
          <div style={{ flex: 1, minWidth: 0 }}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginBottom: 40 }}
            >
              {/* Cover */}
              {story.coverImage && (
                <div
                  style={{
                    width: "100%",
                    height: 260,
                    borderRadius: 12,
                    overflow: "hidden",
                    marginBottom: 28,
                    border: "1px solid var(--border)",
                  }}
                >
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}

              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 20,
                  marginBottom: 20,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h1
                    style={{
                      fontSize: "clamp(24px,3vw,36px)",
                      fontWeight: 400,
                      fontStyle: "italic",
                      letterSpacing: "-0.03em",
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-display)",
                      lineHeight: 1.1,
                      marginBottom: 14,
                    }}
                  >
                    {story.title}
                  </h1>

                  {/* Author */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 14,
                    }}
                  >
                    {story.author.avatar ? (
                      <img
                        src={story.author.avatar}
                        alt={story.author.username}
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: "var(--accent)",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          fontWeight: 700,
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {story.author.username[0].toUpperCase()}
                      </div>
                    )}
                    <button
                      onClick={() => navigate(`/u/${story.author.username}`)}
                      style={{
                        fontSize: 13,
                        color: "var(--text-secondary)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "var(--font-body)",
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.color =
                          "var(--accent)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.color =
                          "var(--text-secondary)")
                      }
                    >
                      {story.author.name || story.author.username}
                    </button>
                  </div>

                  {/* Tags */}
                  {story.tags?.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 6,
                        marginBottom: 14,
                      }}
                    >
                      {story.tags.map((tag: string) => (
                        <span key={tag} className="badge badge-default">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stats row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    {story.genre && (
                      <span className="badge badge-accent">{story.genre}</span>
                    )}
                    {[
                      {
                        icon: <GitBranch size={12} />,
                        val: `${story._count?.branches || 0} branches`,
                      },
                      {
                        icon: <GitFork size={12} />,
                        val: `${story._count?.forks || 0} forks`,
                      },
                      {
                        icon: <Globe size={12} />,
                        val: `${story.wordCount} words`,
                      },
                    ].map((s, i) => (
                      <span
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 13,
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {s.icon}
                        {s.val}
                      </span>
                    ))}
                  </div>
                </div>

                {story.authorId !== user?.id && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleFork}
                    disabled={forking}
                    className="btn btn-secondary"
                    style={{ flexShrink: 0, gap: 6 }}
                  >
                    {forking ? (
                      <Loader2
                        size={13}
                        style={{ animation: "spin 0.7s linear infinite" }}
                      />
                    ) : (
                      <GitFork size={13} />
                    )}
                    Fork story
                  </motion.button>
                )}
              </div>

              {story.description && (
                <p
                  style={{
                    fontSize: 15,
                    color: "var(--text-secondary)",
                    lineHeight: 1.7,
                    fontFamily: "var(--font-body)",
                    maxWidth: 640,
                  }}
                >
                  {story.description}
                </p>
              )}
            </motion.div>

            {/*Reading area*/}
            {endings.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "64px 0",
                  background: "var(--bg-subtle)",
                  borderRadius: 12,
                  border: "1.5px solid var(--border)",
                }}
              >
                <BookOpen
                  size={28}
                  style={{ color: "var(--text-muted)", margin: "0 auto 12px" }}
                />
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  No published endings yet
                </p>
              </div>
            ) : endingLoading ? (
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
            ) : ending ? (
              <motion.div
                key={activeEndingId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
              >
                {/* Reading header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: 20,
                    marginBottom: 32,
                    borderBottom: "1px solid var(--border)",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--text-muted)",
                        marginBottom: 3,
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      Reading ending
                    </p>
                    <h2
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "var(--accent)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {ending.branch?.name}
                    </h2>
                  </div>
                  <StarRating
                    publishingId={ending.id}
                    avgRating={ending.avgRating || 0}
                    totalRatings={ending.totalRatings || 0}
                    userRating={ending.userRating || null}
                    isAuthor={story.authorId === user?.id}
                  />
                </div>
                {/* Prose */}

                <div
                  style={{
                    maxWidth: 760,
                    margin: "0 auto",
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontSize: 19,
                    lineHeight: 2,
                    color: "#1f2937",
                    letterSpacing: "0.01em",
                  }}
                >
                  {ending.finalContent
                    .split("\n\n")
                    .filter(Boolean)
                    .map((para: string, i: number) => (
                      <p
                        key={i}
                        style={{
                          marginBottom: 24,
                        }}
                      >
                        {para}
                      </p>
                    ))}
                </div>
                {/* End marker */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    margin: "48px 0 24px",
                    borderTop: "1px solid var(--border)",
                    paddingTop: 24,
                  }}
                >
                  <div
                    style={{ flex: 1, height: 1, background: "var(--border)" }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-mono)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    end of {ending.branch?.name}
                  </span>
                  <div
                    style={{ flex: 1, height: 1, background: "var(--border)" }}
                  />
                </div>
                {/* Post-read actions */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <StarRating
                    publishingId={ending.id}
                    avgRating={ending.avgRating || 0}
                    totalRatings={ending.totalRatings || 0}
                    userRating={ending.userRating || null}
                    isAuthor={story.authorId === user?.id}
                  />
                  {story.authorId !== user?.id && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleFork}
                      disabled={forking}
                      className="btn btn-secondary"
                      style={{ gap: 6 }}
                    >
                      <GitFork size={13} /> Fork and continue
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ) : null}
          </div>

          {/*Sidebar*/}
          <div style={{ width: 220, flexShrink: 0 }} className="hide-mobile">
            <div style={{ position: "sticky", top: 80 }}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  marginBottom: 12,
                  fontFamily: "var(--font-body)",
                }}
              >
                {endings.length} ending{endings.length !== 1 ? "s" : ""}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {endings.map((e) => (
                  <EndingCard
                    key={e.id}
                    ending={e}
                    isActive={activeEndingId === e.id}
                    onClick={() => setActiveEndingId(e.id)}
                  />
                ))}
              </div>

              {story.forkedFrom && (
                <div
                  style={{
                    marginTop: 24,
                    padding: "14px 16px",
                    borderRadius: 10,
                    background: "var(--bg-subtle)",
                    border: "1.5px solid var(--border)",
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                      marginBottom: 8,
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    Forked from
                  </p>
                  <button
                    onClick={() =>
                      navigate(`/stories/${story.forkedFrom!.id}/read`)
                    }
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--accent)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                      padding: 0,
                      transition: "color 0.15s",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.color =
                        "var(--accent-hover)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.color =
                        "var(--accent)")
                    }
                  >
                    {story.forkedFrom.title}
                  </button>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      marginTop: 3,
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    by {story.forkedFrom.author.username}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .hide-mobile { display: none !important; } }
      `}</style>
    </div>
  );
}