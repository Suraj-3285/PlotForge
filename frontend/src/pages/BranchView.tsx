import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import PermissionNotice from "../components/PermissionNotice";
import {
  GitBranch,
  GitCommit,
  Plus,
  ChevronDown,
  Save,
  Sparkles,
  History,
  ArrowLeft,
  Loader2,
  X,
  Check,
  AlertCircle,
  Globe,
  Type,
  Users,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  storyService,
  branchService,
  commitService,
  aiService,
  publishService,
  collaborateService,
} from "../services/api";
import type { Branch, Commit } from "../types";

/*Font & size options */
const FONTS = [
  { label: "Georgia", value: "Georgia, 'Times New Roman', serif" },
  { label: "Merriweather", value: "'Merriweather', Georgia, serif" },
  { label: "System", value: "system-ui, -apple-system, sans-serif" },
  { label: "Mono", value: "'JetBrains Mono', 'Courier New', monospace" },
];
const SIZES = [
  { label: "S", value: 15 },
  { label: "M", value: 17 },
  { label: "L", value: 19 },
];

/*Commit Modal */
function CommitModal({
  onCommit,
  onClose,
  loading,
}: {
  onCommit: (msg: string) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [message, setMessage] = useState("");
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 16px",
        background: "rgba(0,0,0,0.45)",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.15 }}
        style={{
          width: "100%",
          maxWidth: 440,
          background: "var(--bg)",
          border: "1.5px solid var(--border)",
          borderRadius: 14,
          padding: 24,
          boxShadow: "var(--shadow-xl)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <GitCommit size={15} style={{ color: "var(--accent)" }} />
            <h3
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "var(--text-primary)",
                fontFamily: "var(--font-body)",
              }}
            >
              Save commit
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              display: "flex",
              padding: 2,
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color =
                "var(--text-primary)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color =
                "var(--text-muted)")
            }
          >
            <X size={15} />
          </button>
        </div>
        <input
          autoFocus
          type="text"
          placeholder="Describe what changed..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && message.trim()) onCommit(message.trim());
          }}
          className="input"
          style={{ marginBottom: 16, fontSize: 14 }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => message.trim() && onCommit(message.trim())}
            disabled={!message.trim() || loading}
            className="btn btn-primary"
            style={{ gap: 6 }}
          >
            {loading ? (
              <Loader2
                size={13}
                style={{ animation: "spin 0.7s linear infinite" }}
              />
            ) : (
              <Check size={13} />
            )}
            Commit
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* New Branch Modal */
function NewBranchModal({
  onCreate,
  onClose,
  loading,
}: {
  onCreate: (name: string) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [name, setName] = useState("");
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 16px",
        background: "rgba(0,0,0,0.45)",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.15 }}
        style={{
          width: "100%",
          maxWidth: 440,
          background: "var(--bg)",
          border: "1.5px solid var(--border)",
          borderRadius: 14,
          padding: 24,
          boxShadow: "var(--shadow-xl)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <GitBranch size={15} style={{ color: "var(--accent)" }} />
            <h3
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "var(--text-primary)",
                fontFamily: "var(--font-body)",
              }}
            >
              New branch
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              display: "flex",
              padding: 2,
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color =
                "var(--text-primary)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color =
                "var(--text-muted)")
            }
          >
            <X size={15} />
          </button>
        </div>
        <input
          autoFocus
          type="text"
          placeholder="branch-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && name.trim()) onCreate(name.trim());
          }}
          className="input"
          style={{ marginBottom: 6, fontSize: 14 }}
        />
        <p
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            marginBottom: 16,
            fontFamily: "var(--font-body)",
          }}
        >
          Letters, numbers, hyphens and underscores only
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => name.trim() && onCreate(name.trim())}
            disabled={!name.trim() || loading}
            className="btn btn-primary"
            style={{ gap: 6 }}
          >
            {loading ? (
              <Loader2
                size={13}
                style={{ animation: "spin 0.7s linear infinite" }}
              />
            ) : (
              <Plus size={13} />
            )}
            Create
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/*AI Panel*/
function AIPanel({
  content,
  genre,
  onInsert,
  onClose,
}: {
  content: string;
  genre?: string;
  onInsert: (text: string) => void;
  onClose: () => void;
}) {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [streamedText, setStreamedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [fixedText, setFixedText] = useState("");

  const actions = [
    { key: "next", label: "Continue story" },
    { key: "twist", label: "Plot twist" },
    { key: "improve", label: "Improve writing" },
    { key: "grammar", label: "Fix grammar" },
  ];

  const runAction = async (key: string) => {
    setActiveAction(key);
    setStreamedText("");
    setFixedText("");
    if (key === "grammar") {
      try {
        const res = await aiService.fixGrammar(content);
        setFixedText(res.data.fixed);
      } catch {
        setFixedText("Error — please try again.");
      }
      return;
    }
    setIsStreaming(true);
    try {
      let response;
      if (key === "next")
        response = await aiService.suggestNext(content, genre);
      else if (key === "twist")
        response = await aiService.suggestTwist(content, genre);
      else response = await aiService.improveWriting(content);
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const p = JSON.parse(data);
              if (p.text) setStreamedText((prev) => prev + p.text);
            } catch {}
          }
        }
      }
    } catch {
      setStreamedText("Error — please try again.");
    } finally {
      setIsStreaming(false);
    }
  };

  const result = fixedText || streamedText;

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.2 }}
      style={{
        width: 264,
        flexShrink: 0,
        borderLeft: "1px solid var(--border)",
        background: "var(--bg-subtle)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Sparkles size={14} style={{ color: "#16a34a" }} />
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
            }}
          >
            AI Assistant
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            display: "flex",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.color =
              "var(--text-primary)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")
          }
        >
          <X size={14} />
        </button>
      </div>
      <div style={{ padding: "10px 10px 0" }}>
        {actions.map((action) => (
          <button
            key={action.key}
            onClick={() => runAction(action.key)}
            disabled={isStreaming}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "9px 12px",
              borderRadius: 8,
              fontSize: 13,
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              cursor: "pointer",
              border: "none",
              marginBottom: 4,
              transition: "all 0.15s",
              background:
                activeAction === action.key
                  ? "var(--accent-subtle)"
                  : "transparent",
              color:
                activeAction === action.key
                  ? "var(--accent)"
                  : "var(--text-secondary)",
            }}
            onMouseEnter={(e) => {
              if (activeAction !== action.key) {
                (e.currentTarget as HTMLElement).style.background =
                  "var(--bg-muted)";
                (e.currentTarget as HTMLElement).style.color =
                  "var(--text-primary)";
              }
            }}
            onMouseLeave={(e) => {
              if (activeAction !== action.key) {
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
                (e.currentTarget as HTMLElement).style.color =
                  "var(--text-secondary)";
              }
            }}
          >
            {action.label}
          </button>
        ))}
      </div>
      {result && (
        <>
          <div
            style={{
              height: 1,
              background: "var(--border)",
              margin: "8px 12px",
            }}
          />
          <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 12px" }}>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                marginBottom: 12,
                fontFamily: "var(--font-body)",
              }}
            >
              {result}
              {isStreaming && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 0.9 }}
                  style={{
                    display: "inline-block",
                    width: 2,
                    height: 13,
                    background: "#16a34a",
                    marginLeft: 2,
                    verticalAlign: "middle",
                  }}
                />
              )}
            </p>
            {!isStreaming && result && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onInsert(result)}
                className="btn btn-primary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  fontSize: 13,
                }}
              >
                Insert into editor
              </motion.button>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}

/*Main Editor */
export default function BranchView() {
  const { storyId, branchId } = useParams<{
    storyId: string;
    branchId: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [content, setContent] = useState("");
  const [showCommitModal, setShowCommitModal] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showBranchDrop, setShowBranchDrop] = useState(false);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteRole, setInviteRole] = useState<"VIEWER" | "EDITOR">("EDITOR");
  const [hasChanges, setHasChanges] = useState(false);
  const [fontIdx, setFontIdx] = useState(0);
  const [sizeIdx, setSizeIdx] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fontMenuRef = useRef<HTMLDivElement>(null);

  const { data: storyData } = useQuery({
    queryKey: ["story", storyId],
    queryFn: () => storyService.getMyStory(storyId!),
  });
  const { data: branchesData } = useQuery({
    queryKey: ["branches", storyId],
    queryFn: () => branchService.getBranches(storyId!),
  });
  const { data: latestData, isLoading: commitLoading } = useQuery({
    queryKey: ["latestCommit", storyId, branchId],
    queryFn: () => commitService.getLatestCommit(storyId!, branchId!),
  });

  const { data: collaboratorsData } = useQuery({
    queryKey: ["collaborators", storyId],
    queryFn: () => collaborateService.getCollaborators(storyId!),
  });

  const story = storyData?.data?.story;
  console.log("STORY", story);
  const collaborators = collaboratorsData?.data?.collaborators || [];
  const branches: Branch[] = branchesData?.data?.branches || [];
  const currentBranch = branches.find((b) => b.id === branchId);
  const latestCommit: Commit | null = latestData?.data?.commit || null;
  const isAuthor = story?.authorId === user?.id;

  const myCollaboration = story?.collaborators?.find(
    (c: any) => c.userId === user?.id,
  );
  const role = isAuthor ? "AUTHOR" : myCollaboration?.role || "VIEWER";
  const isMainBranch = currentBranch?.isDefault;
  const canEditMainBranch = isAuthor;
  const mainBranchLocked =
    role === "EDITOR" && isMainBranch && !canEditMainBranch;
  const isViewer = role === "VIEWER";

  useEffect(() => {
    if (latestCommit?.content) {
      setContent(latestCommit.content);
      setHasChanges(false);
    }
  }, [latestCommit]);

  // close font menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        fontMenuRef.current &&
        !fontMenuRef.current.contains(e.target as Node)
      )
        setShowFontMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const commitMutation = useMutation({
    mutationFn: (message: string) =>
      commitService.createCommit(storyId!, branchId!, { message, content }),
    onSuccess: () => {
      setHasChanges(false);
      setShowCommitModal(false);
      queryClient.invalidateQueries({
        queryKey: ["latestCommit", storyId, branchId],
      });
      queryClient.invalidateQueries({
        queryKey: ["commits", storyId, branchId],
      });

      queryClient.invalidateQueries({
        queryKey: ["story", storyId],
      });

      queryClient.invalidateQueries({
        queryKey: ["branches", storyId],
      });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: () =>
      collaborateService.invite(storyId!, {
        username: inviteUsername,
        role: inviteRole,
      }),
    onSuccess: () => {
      setInviteUsername("");
      queryClient.invalidateQueries({
        queryKey: ["collaborators", storyId],
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => publishService.publish(storyId!, branchId!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["story", storyId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["myStories"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["discover"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["publishedStories"],
      });
    },
  });

  const branchMutation = useMutation({
    mutationFn: (name: string) =>
      branchService.createBranch(storyId!, {
        name,
        fromCommitId: latestCommit?.id,
      }),
    onSuccess: (res) => {
      setShowBranchModal(false);
      queryClient.invalidateQueries({ queryKey: ["branches", storyId] });
      navigate(`/stories/${storyId}/branches/${res.data.branch.id}`);
    },
  });

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  if (commitLoading)
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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "var(--bg)",
      }}
    >
      {/*Toolbar*/}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          height: 52,
          flexShrink: 0,
          borderBottom: "1px solid var(--border)",
          background: "var(--bg)",
        }}
      >
        {/* Left */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}
        >
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              padding: 6,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              display: "flex",
              borderRadius: 6,
              transition: "all 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "var(--bg-muted)";
              (e.currentTarget as HTMLElement).style.color =
                "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color =
                "var(--text-muted)";
            }}
          >
            <ArrowLeft size={15} />
          </button>

          <div
            style={{
              width: 1,
              height: 18,
              background: "var(--border)",
              flexShrink: 0,
            }}
          />

          <span
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
            {story?.title}
          </span>

          {/* Branch switcher */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <button
              onClick={() => setShowBranchDrop(!showBranchDrop)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 10px",
                borderRadius: 7,
                cursor: "pointer",
                background: "var(--bg-subtle)",
                border: "1.5px solid var(--border)",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--accent)",
                fontFamily: "var(--font-mono)",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor =
                  "var(--accent-border)")
              }
              onMouseLeave={(e) => {
                if (!showBranchDrop)
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "var(--border)";
              }}
            >
              <GitBranch size={11} />
              {currentBranch?.name || "main"}
              <ChevronDown
                size={11}
                style={{
                  color: "var(--text-muted)",
                  transform: showBranchDrop ? "rotate(180deg)" : "rotate(0)",
                  transition: "transform 0.15s",
                }}
              />
            </button>

            <AnimatePresence>
              {showBranchDrop && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "calc(100% + 4px)",
                    width: 200,
                    background: "var(--bg)",
                    border: "1.5px solid var(--border)",
                    borderRadius: 10,
                    boxShadow: "var(--shadow-xl)",
                    padding: 4,
                    zIndex: 30,
                  }}
                >
                  {branches.map((branch) => (
                    <button
                      key={branch.id}
                      onClick={() => {
                        navigate(`/stories/${storyId}/branches/${branch.id}`);
                        setShowBranchDrop(false);
                      }}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 10px",
                        border: "none",
                        cursor: "pointer",
                        borderRadius: 7,
                        fontSize: 12,
                        fontFamily: "var(--font-mono)",
                        fontWeight: 500,
                        background:
                          branch.id === branchId
                            ? "var(--accent-subtle)"
                            : "transparent",
                        color:
                          branch.id === branchId
                            ? "var(--accent)"
                            : "var(--text-secondary)",
                        transition: "all 0.12s",
                      }}
                      onMouseEnter={(e) => {
                        if (branch.id !== branchId) {
                          (e.currentTarget as HTMLElement).style.background =
                            "var(--bg-muted)";
                          (e.currentTarget as HTMLElement).style.color =
                            "var(--text-primary)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (branch.id !== branchId) {
                          (e.currentTarget as HTMLElement).style.background =
                            "transparent";
                          (e.currentTarget as HTMLElement).style.color =
                            "var(--text-secondary)";
                        }
                      }}
                    >
                      <GitBranch size={11} />
                      {branch.name}
                      {branch.isDefault && (
                        <span
                          className="badge badge-default"
                          style={{ fontSize: 10, marginLeft: "auto" }}
                        >
                          default
                        </span>
                      )}
                    </button>
                  ))}
                  <div
                    style={{
                      height: 1,
                      background: "var(--border)",
                      margin: "4px 0",
                    }}
                  />
                  <button
                    onClick={() => {
                      setShowBranchModal(true);
                      setShowBranchDrop(false);
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      border: "none",
                      cursor: "pointer",
                      borderRadius: 7,
                      fontSize: 12,
                      fontFamily: "var(--font-body)",
                      color: "var(--text-secondary)",
                      background: "transparent",
                      transition: "all 0.12s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "var(--bg-muted)";
                      (e.currentTarget as HTMLElement).style.color =
                        "var(--text-primary)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "transparent";
                      (e.currentTarget as HTMLElement).style.color =
                        "var(--text-secondary)";
                    }}
                  >
                    <Plus size={11} />
                    New branch
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          {/* Unsaved */}
          {hasChanges && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                color: "#d97706",
                fontFamily: "var(--font-body)",
                background: "#fffbeb",
                border: "1px solid #fde68a",
                padding: "3px 8px",
                borderRadius: 99,
              }}
            >
              <AlertCircle size={11} />
              Unsaved
            </span>
          )}

          {/* Font picker */}
          <div ref={fontMenuRef} style={{ position: "relative" }}>
            <button
              onClick={() => setShowFontMenu(!showFontMenu)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 10px",
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                border: "1.5px solid var(--border)",
                background: showFontMenu ? "var(--bg-muted)" : "transparent",
                color: "var(--text-secondary)",
                fontFamily: "var(--font-body)",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor =
                  "var(--border-strong)")
              }
              onMouseLeave={(e) => {
                if (!showFontMenu)
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "var(--border)";
              }}
            >
              <Type size={12} />
              {FONTS[fontIdx].label}
            </button>

            <AnimatePresence>
              {showFontMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 4px)",
                    width: 196,
                    background: "var(--bg)",
                    border: "1.5px solid var(--border)",
                    borderRadius: 10,
                    boxShadow: "var(--shadow-xl)",
                    padding: 4,
                    zIndex: 30,
                  }}
                >
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                      padding: "6px 10px 4px",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    Font
                  </p>
                  {FONTS.map((f, i) => (
                    <button
                      key={f.label}
                      onClick={() => {
                        setFontIdx(i);
                        setShowFontMenu(false);
                      }}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 10px",
                        border: "none",
                        cursor: "pointer",
                        borderRadius: 7,
                        fontSize: 14,
                        background:
                          i === fontIdx
                            ? "var(--accent-subtle)"
                            : "transparent",
                        color:
                          i === fontIdx
                            ? "var(--accent)"
                            : "var(--text-primary)",
                        fontFamily: f.value,
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={(e) => {
                        if (i !== fontIdx)
                          (e.currentTarget as HTMLElement).style.background =
                            "var(--bg-muted)";
                      }}
                      onMouseLeave={(e) => {
                        if (i !== fontIdx)
                          (e.currentTarget as HTMLElement).style.background =
                            "transparent";
                      }}
                    >
                      {f.label}
                      {i === fontIdx && <Check size={12} />}
                    </button>
                  ))}

                  <div
                    style={{
                      height: 1,
                      background: "var(--border)",
                      margin: "6px 4px 4px",
                    }}
                  />
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                      padding: "2px 10px 6px",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    Size
                  </p>
                  <div
                    style={{ display: "flex", gap: 4, padding: "0 6px 8px" }}
                  >
                    {SIZES.map((s, i) => (
                      <button
                        key={s.label}
                        onClick={() => setSizeIdx(i)}
                        style={{
                          flex: 1,
                          padding: "5px 0",
                          border: "none",
                          cursor: "pointer",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          fontFamily: "var(--font-body)",
                          background:
                            i === sizeIdx
                              ? "var(--text-primary)"
                              : "var(--bg-muted)",
                          color:
                            i === sizeIdx ? "white" : "var(--text-secondary)",
                          transition: "all 0.12s",
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div style={{ width: 1, height: 18, background: "var(--border)" }} />

          {/* History */}
          <button
            onClick={() =>
              navigate(`/stories/${storyId}/commits?branch=${branchId}`)
            }
            className="btn btn-ghost btn-sm"
            style={{ gap: 5 }}
          >
            <History size={13} />
            History
          </button>

          {/* Publish */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => publishMutation.mutate()}
            disabled={publishMutation.isPending}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 12px",
              borderRadius: 7,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              border: "1.5px solid #bbf7d0",
              background: "#f0fdf4",
              color: "#16a34a",
              fontFamily: "var(--font-body)",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "#dcfce7")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "#f0fdf4")
            }
          >
            {publishMutation.isPending ? (
              <Loader2
                size={13}
                style={{ animation: "spin 0.7s linear infinite" }}
              />
            ) : (
              <Globe size={13} />
            )}
            Publish
          </motion.button>

          <button
            onClick={() => setShowCollaborators(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 12px",
              borderRadius: 7,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              border: "1.5px solid var(--border)",
              background: "transparent",
              color: "var(--text-secondary)",
              fontFamily: "var(--font-body)",
            }}
          >
            <Users size={13} />
            Collaborators
          </button>

          {/* AI */}
          <button
            onClick={() => setShowAI(!showAI)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 12px",
              borderRadius: 7,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              border: "1.5px solid",
              transition: "all 0.15s",
              background: showAI ? "#f0fdf4" : "transparent",
              borderColor: showAI ? "#bbf7d0" : "var(--border)",
              color: showAI ? "#16a34a" : "var(--text-secondary)",
              fontFamily: "var(--font-body)",
            }}
            onMouseEnter={(e) => {
              if (!showAI)
                (e.currentTarget as HTMLElement).style.borderColor =
                  "var(--border-strong)";
            }}
            onMouseLeave={(e) => {
              if (!showAI)
                (e.currentTarget as HTMLElement).style.borderColor =
                  "var(--border)";
            }}
          >
            <Sparkles size={13} />
            AI
          </button>

          {/* Commit */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCommitModal(true)}
            disabled={!hasChanges || mainBranchLocked || isViewer}
            className="btn btn-primary btn-sm"
            style={{
              gap: 5,
              opacity: hasChanges ? 1 : 0.4,
              minWidth: 80,
              justifyContent: "center",
            }}
          >
            <Save size={13} />
            Commit
          </motion.button>
        </div>
      </div>

      {mainBranchLocked && (
        <PermissionNotice
          title="Main branch protected"
          message="You cannot edit the author's main branch. Create a new branch to contribute."
        />
      )}

      {isViewer && (
        <PermissionNotice
          type="info"
          title="Read-only access"
          message="You can view this story but cannot create commits or publish changes."
        />
      )}

      {/* ── Status bar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "5px 28px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-subtle)",
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {currentBranch?.name}
          {latestCommit ? ` / ${latestCommit.message}` : " / no commits yet"}
        </span>
        <span
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            fontFamily: "var(--font-body)",
          }}
        >
          {wordCount.toLocaleString()} {wordCount === 1 ? "word" : "words"}
        </span>
      </div>

      {/*Writing area + AI */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", background: "var(--bg)" }}>
          <textarea
            readOnly={mainBranchLocked || isViewer}
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setHasChanges(true);
            }}
            placeholder="Start writing your story…"
            style={{
              display: "block",
              width: "100%",
              maxWidth: 680,
              margin: "0 auto",
              minHeight: "100%",
              padding: "48px 32px 120px",
              background: "transparent",
              border: "none",
              outline: "none",
              resize: "none",
              fontFamily: FONTS[fontIdx].value,
              fontSize: SIZES[sizeIdx].value,
              lineHeight: 1.85,
              color: "#1c1c1c",
              caretColor: "var(--accent)",
              letterSpacing: "0.008em",
            }}
          />
        </div>

        <AnimatePresence>
          {showAI && (
            <AIPanel
              content={content}
              genre={story?.genre || undefined}
              onInsert={(text) => {
                setContent((prev) => prev + "\n\n" + text);
                setHasChanges(true);
                setShowAI(false);
              }}
              onClose={() => setShowAI(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/*Modals*/}
      <AnimatePresence>
        {showCommitModal && (
          <CommitModal
            onCommit={(msg) => commitMutation.mutate(msg)}
            onClose={() => setShowCommitModal(false)}
            loading={commitMutation.isPending}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showBranchModal && (
          <NewBranchModal
            onCreate={(name) => branchMutation.mutate(name)}
            onClose={() => setShowBranchModal(false)}
            loading={branchMutation.isPending}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCollaborators && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 60,
            }}
            onClick={() => setShowCollaborators(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 420,
                background: "var(--bg)",
                borderRadius: 12,
                padding: 24,
                border: "1px solid var(--border)",
              }}
            >
              <h3 style={{ marginBottom: 16 }}>Collaborators</h3>

              <input
                className="input"
                placeholder="Username"
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
              />

              <select
                className="input"
                value={inviteRole}
                onChange={(e) =>
                  setInviteRole(e.target.value as "VIEWER" | "EDITOR")
                }
                style={{ marginTop: 12 }}
              >
                <option value="EDITOR">EDITOR</option>
                <option value="VIEWER">VIEWER</option>
              </select>

              <button
                className="btn btn-primary"
                style={{ marginTop: 12 }}
                onClick={() => inviteMutation.mutate()}
              >
                Invite
              </button>

              <div style={{ marginTop: 24 }}>
                {collaborators.map((c: any) => (
                  <div
                    key={c.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <span>
                      {c.user.username} ({c.role})
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        textarea::placeholder { color: #c4c4c4; font-style: italic; }
        textarea:focus { outline: none; }
      `}</style>
    </div>
  );
}