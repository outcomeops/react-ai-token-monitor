interface Props {
  onRefresh?: () => void;
}

export function Header({ onRefresh }: Props) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      paddingBottom: 8,
    }}>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: "var(--radius-sm)",
        background: "linear-gradient(135deg, var(--accent-purple), var(--accent-pink))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
          <polyline points="4 7 8 3 12 7" stroke="white" strokeWidth="1.5" fill="none"/>
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 20,
          fontWeight: 800,
          letterSpacing: "-0.3px",
          color: "var(--text-primary)",
        }}>
          AI Token Monitor
        </div>
        <div style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          fontWeight: 600,
        }}>
          Claude Code Usage
        </div>
      </div>

      {onRefresh && (
        <button
          onClick={onRefresh}
          title="Refresh"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)",
            transition: "color 0.2s ease",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        </button>
      )}
    </div>
  );
}
