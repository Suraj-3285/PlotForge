import { Lock, Eye } from "lucide-react";

type Props = {
  type?: "warning" | "info";
  title: string;
  message: string;
};

export default function PermissionNotice({
  type = "warning",
  title,
  message,
}: Props) {
  const Icon = type === "warning" ? Lock : Eye;

  return (
    <div
      style={{
        margin: "12px 24px",
        padding: "12px 16px",
        borderRadius: 10,
        border: type === "warning" ? "1px solid #fde68a" : "1px solid #bfdbfe",
        background: type === "warning" ? "#fffbeb" : "#eff6ff",
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
      }}
    >
      <Icon
        size={18}
        style={{
          color: type === "warning" ? "#d97706" : "#2563eb",
          flexShrink: 0,
          marginTop: 2,
        }}
      />

      <div>
        <div
          style={{
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 14,
            color: "var(--text-secondary)",
          }}
        >
          {message}
        </div>
      </div>
    </div>
  );
}