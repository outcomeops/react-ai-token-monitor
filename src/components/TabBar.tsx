export type TabType = "overview" | "analytics";

interface Props {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
}

export function TabBar({ activeTab, onChange }: Props) {
  return (
    <div style={{
      display: "flex",
      background: "var(--heat-0)",
      borderRadius: "var(--radius-sm)",
      padding: 3,
      gap: 2,
    }}>
      <TabButton label="Overview" active={activeTab === "overview"} onClick={() => onChange("overview")} />
      <TabButton label="Analytics" active={activeTab === "analytics"} onClick={() => onChange("analytics")} />
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "8px 12px",
        fontSize: 14,
        fontWeight: 700,
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        background: active ? "var(--bg-card)" : "transparent",
        color: active ? "var(--accent-purple)" : "var(--text-secondary)",
        boxShadow: active ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
        transition: "all 0.15s ease",
      }}
    >
      {label}
    </button>
  );
}
