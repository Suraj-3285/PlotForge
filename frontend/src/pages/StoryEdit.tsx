import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Tag,
  X,
  ImagePlus,
  Loader2,
  Trash2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storyService } from "../services/api";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  genre: z.string().optional(),
  isPublished: z.boolean().optional(),
});
type Form = z.infer<typeof schema>;

const genres = [
  "Fantasy",
  "Sci-Fi",
  "Romance",
  "Thriller",
  "Horror",
  "Mystery",
  "Adventure",
  "Drama",
];

export default function StoryEdit() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState("");
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<Form>({ resolver: zodResolver(schema) });
  const selectedGenre = watch("genre");

  const { data, isLoading } = useQuery({
    queryKey: ["story", storyId],
    queryFn: () => storyService.getMyStory(storyId!),
  });
  const story = data?.data?.story;

  useEffect(() => {
    if (story) {
      reset({
        title: story.title,
        description: story.description || "",
        genre: story.genre || "",
        isPublished: story.isPublished,
      });
      setTags(story.tags || []);
      setCoverPreview(story.coverImage || null);
    }
  }, [story, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: Form) =>
      storyService.updateStory(storyId!, { ...data, tags }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["story", storyId] });
      queryClient.invalidateQueries({ queryKey: ["myStories"] });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: () => storyService.deleteStory(storyId!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["myStories"],
      });
      navigate("/dashboard");
    },
  });

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };
  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));
  const handleTagKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: Form) => {
    try {
      setError("");
      if (coverFile) {
        setUploadingCover(true);
        await storyService.uploadCover(storyId!, coverFile);
        setUploadingCover(false);
        setCoverFile(null);
      }
      await updateMutation.mutateAsync(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong.");
      setUploadingCover(false);
    }
  };

  const isSaving = updateMutation.isPending || uploadingCover;
  const isSaved = updateMutation.isSuccess && !isDirty;

  if (isLoading)
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
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div
        style={{ maxWidth: 680, margin: "0 auto", padding: "40px 32px 80px" }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 40,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              onClick={() => navigate(-1)}
              className="btn btn-secondary btn-sm"
              style={{ padding: "7px 10px" }}
            >
              <ArrowLeft size={14} />
            </button>
            <div>
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 400,
                  fontStyle: "italic",
                  letterSpacing: "-0.03em",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-display)",
                  lineHeight: 1,
                }}
              >
                Edit story
              </h1>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  marginTop: 3,
                  fontFamily: "var(--font-body)",
                }}
              >
                {story?.title}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (confirm("Delete this story? This cannot be undone."))
                deleteMutation.mutate();
            }}
            disabled={deleteMutation.isPending}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 8,
              background: "transparent",
              border: "1.5px solid #fecaca",
              color: "#dc2626",
              fontSize: 13,
              fontFamily: "var(--font-body)",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "#fef2f2")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background =
                "transparent")
            }
          >
            {deleteMutation.isPending ? (
              <Loader2
                size={13}
                style={{ animation: "spin 0.7s linear infinite" }}
              />
            ) : (
              <Trash2 size={13} />
            )}
            Delete story
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="alert alert-danger"
              style={{ marginBottom: 24 }}
            >
              {error}
            </motion.div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{ display: "flex", flexDirection: "column", gap: 24 }}
          >
            {/* Cover */}
            <div>
              <label className="label">Cover image</label>
              <div
                onClick={() => document.getElementById("cover-input")?.click()}
                style={{
                  width: "100%",
                  height: 180,
                  borderRadius: 10,
                  overflow: "hidden",
                  border: "1.5px dashed var(--border-strong)",
                  cursor: "pointer",
                  position: "relative",
                  background: "var(--bg-subtle)",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.borderColor =
                    "var(--accent)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.borderColor =
                    "var(--border-strong)")
                }
              >
                {coverPreview ? (
                  <>
                    <img
                      src={coverPreview}
                      alt="Cover"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(0,0,0,0.45)",
                        opacity: 0,
                        transition: "opacity 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.opacity = "1")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.opacity = "0")
                      }
                    >
                      <ImagePlus
                        size={20}
                        style={{ color: "white", marginBottom: 6 }}
                      />
                      <span
                        style={{
                          fontSize: 12,
                          color: "white",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        Change cover
                      </span>
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <ImagePlus
                      size={22}
                      style={{ color: "var(--text-muted)" }}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      Click to upload cover image
                    </span>
                  </div>
                )}
                <input
                  id="cover-input"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleCoverChange}
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="label">
                Title <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                {...register("title")}
                type="text"
                className={`input ${errors.title ? "input-error" : ""}`}
                style={{ fontSize: 15 }}
              />
              {errors.title && (
                <p className="field-error">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="label">Description</label>
              <textarea
                {...register("description")}
                rows={3}
                className="input"
                style={{ resize: "none", lineHeight: 1.6, fontSize: 14 }}
              />
            </div>

            {/* Genre */}
            <div>
              <label className="label">Genre</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {genres.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() =>
                      setValue("genre", selectedGenre === g ? "" : g, {
                        shouldDirty: true,
                      })
                    }
                    style={{
                      padding: "6px 14px",
                      borderRadius: 99,
                      fontSize: 13,
                      fontFamily: "var(--font-body)",
                      fontWeight: 500,
                      cursor: "pointer",
                      border: "1.5px solid",
                      transition: "all 0.15s",
                      background:
                        selectedGenre === g
                          ? "var(--text-primary)"
                          : "transparent",
                      borderColor:
                        selectedGenre === g
                          ? "var(--text-primary)"
                          : "var(--border-strong)",
                      color:
                        selectedGenre === g ? "white" : "var(--text-secondary)",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedGenre !== g) {
                        (e.currentTarget as HTMLElement).style.borderColor =
                          "var(--text-primary)";
                        (e.currentTarget as HTMLElement).style.color =
                          "var(--text-primary)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedGenre !== g) {
                        (e.currentTarget as HTMLElement).style.borderColor =
                          "var(--border-strong)";
                        (e.currentTarget as HTMLElement).style.color =
                          "var(--text-secondary)";
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
              <label className="label">
                Tags{" "}
                <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
                  — up to 5
                </span>
              </label>
              {tags.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginBottom: 10,
                  }}
                >
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "4px 10px",
                        borderRadius: 99,
                        background: "var(--bg-muted)",
                        border: "1px solid var(--border-strong)",
                        fontSize: 12,
                        color: "var(--text-secondary)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      <Tag size={9} style={{ color: "var(--text-muted)" }} />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--text-muted)",
                          display: "flex",
                          padding: 0,
                          marginLeft: 2,
                        }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLElement).style.color =
                            "var(--danger)")
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLElement).style.color =
                            "var(--text-muted)")
                        }
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKey}
                  placeholder="Add a tag..."
                  disabled={tags.length >= 5}
                  className="input"
                  style={{ flex: 1, fontSize: 13 }}
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={!tagInput.trim() || tags.length >= 5}
                  className="btn btn-secondary"
                  style={{ flexShrink: 0, fontSize: 13 }}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                paddingTop: 8,
                borderTop: "1px solid var(--border)",
              }}
            >
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn btn-ghost"
                style={{ fontSize: 14 }}
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSaving}
                className="btn btn-primary"
                style={{
                  fontSize: 14,
                  minWidth: 140,
                  justifyContent: "center",
                }}
              >
                {isSaving ? (
                  <>
                    <Loader2
                      size={14}
                      style={{ animation: "spin 0.7s linear infinite" }}
                    />
                    {uploadingCover ? "Uploading..." : "Saving..."}
                  </>
                ) : isSaved ? (
                  <>
                    <Save size={14} /> Saved
                  </>
                ) : (
                  <>
                    <Save size={14} /> Save changes
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}