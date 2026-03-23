import type { RefObject, ReactNode } from "react";
import { useMemo } from "react";
import type { CellData } from "./ActivityGraph";

interface Props {
  grid: CellData[][];
  totalWeeks: number;
  thresholds: number[];
  onHover: (cell: CellData | null, x: number, y: number) => void;
  containerRef: RefObject<HTMLDivElement | null>;
}

const HEAT_COLORS = [
  "var(--heat-0)", "var(--heat-1)", "var(--heat-2)", "var(--heat-3)", "var(--heat-4)",
];

function getHeatLevel(value: number, thresholds: number[]): number {
  if (value === 0) return 0;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (value >= thresholds[i]) return i + 1;
  }
  return 1;
}

const HALF_W = 3.5;
const HALF_H = 1.5;
const MAX_BAR_H = 22;
const MIN_BAR_H = 1.5;

function iso(col: number, row: number): { x: number; y: number } {
  return { x: (col - row) * HALF_W, y: (col + row) * HALF_H };
}

export function Heatmap3D({ grid, totalWeeks, thresholds, onHover, containerRef }: Props) {
  const maxTokens = useMemo(() => {
    let max = 0;
    for (const row of grid) {
      for (const cell of row) {
        if (cell.tokens > max) max = cell.tokens;
      }
    }
    return max || 1;
  }, [grid]);

  const rows = 7;
  const topLeft = iso(0, 0);
  const topRight = iso(totalWeeks, 0);
  const bottomLeft = iso(0, rows);
  const bottomRight = iso(totalWeeks, rows);

  const minX = Math.min(topLeft.x, bottomLeft.x) - 2;
  const maxX = Math.max(topRight.x, bottomRight.x) + 2;
  const minY = topLeft.y - MAX_BAR_H - 5;
  const maxY = Math.max(bottomLeft.y, bottomRight.y) + 2;

  const vbW = maxX - minX;
  const vbH = maxY - minY;

  const bars: ReactNode[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < totalWeeks; col++) {
      const cell = grid[row]?.[col];
      if (!cell) continue;

      const level = getHeatLevel(cell.tokens, thresholds);
      const color = HEAT_COLORS[level];

      const A = iso(col, row);
      const B = iso(col + 1, row);
      const C = iso(col + 1, row + 1);
      const D = iso(col, row + 1);

      if (cell.tokens === 0) {
        bars.push(
          <polygon
            key={`${row}-${col}`}
            points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y} ${D.x},${D.y}`}
            style={{ fill: color }}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={0.2}
          />
        );
        continue;
      }

      const h = MIN_BAR_H + (cell.tokens / maxTokens) * (MAX_BAR_H - MIN_BAR_H);

      const At = { x: A.x, y: A.y - h };
      const Bt = { x: B.x, y: B.y - h };
      const Ct = { x: C.x, y: C.y - h };
      const Dt = { x: D.x, y: D.y - h };

      const topFace = `${At.x},${At.y} ${Bt.x},${Bt.y} ${Ct.x},${Ct.y} ${Dt.x},${Dt.y}`;
      const leftFace = `${Dt.x},${Dt.y} ${D.x},${D.y} ${C.x},${C.y} ${Ct.x},${Ct.y}`;
      const rightFace = `${Ct.x},${Ct.y} ${C.x},${C.y} ${B.x},${B.y} ${Bt.x},${Bt.y}`;

      bars.push(
        <g
          key={`${row}-${col}`}
          style={{ cursor: "pointer" }}
          onMouseEnter={(e) => {
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;
            const svgEl = e.currentTarget.closest("svg");
            if (!svgEl) return;
            const svgRect = svgEl.getBoundingClientRect();
            const topCenter = { x: (At.x + Bt.x + Ct.x + Dt.x) / 4, y: Math.min(At.y, Bt.y, Ct.y, Dt.y) };
            const scaleX = svgRect.width / vbW;
            const scaleY = svgRect.height / vbH;
            const screenX = (topCenter.x - minX) * scaleX + svgRect.left - rect.left;
            const screenY = (topCenter.y - minY) * scaleY + svgRect.top - rect.top;
            onHover(cell, screenX, screenY);
          }}
          onMouseLeave={() => onHover(null, 0, 0)}
        >
          <polygon points={leftFace} style={{ fill: color }} />
          <polygon points={leftFace} fill="rgba(0,0,0,0.12)" />
          <polygon points={rightFace} style={{ fill: color }} />
          <polygon points={rightFace} fill="rgba(0,0,0,0.25)" />
          <polygon points={topFace} style={{ fill: color }} stroke="rgba(255,255,255,0.2)" strokeWidth={0.2} />
        </g>
      );
    }
  }

  return (
    <svg
      viewBox={`${minX} ${minY} ${vbW} ${vbH}`}
      width="100%"
      style={{ display: "block" }}
      preserveAspectRatio="xMidYMid meet"
    >
      {bars}
    </svg>
  );
}
