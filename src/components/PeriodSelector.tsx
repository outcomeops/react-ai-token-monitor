interface Props {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  canNext: boolean;
}

export function PeriodSelector({ label, onPrev, onNext, canNext }: Props) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <NavButton onClick={onPrev} direction="prev" />
      <span style={{
        fontSize: 12,
        fontWeight: 700,
        color: "var(--text-secondary)",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        minWidth: 60,
        textAlign: "center",
      }}>
        {label}
      </span>
      <NavButton onClick={onNext} direction="next" disabled={!canNext} />
    </div>
  );
}

function NavButton({ onClick, direction, disabled = false }: { onClick: () => void; direction: "prev" | "next"; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 24,
        height: 24,
        borderRadius: 4,
        border: "none",
        background: disabled ? "transparent" : "var(--heat-0)",
        color: disabled ? "transparent" : "var(--text-secondary)",
        cursor: disabled ? "default" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 700,
        transition: "all 0.15s ease",
        padding: 0,
      }}
    >
      {direction === "prev" ? "\u2039" : "\u203A"}
    </button>
  );
}
