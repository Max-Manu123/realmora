import { useCallback, useEffect, useImperativeHandle, useRef, useState, type RefObject } from "react";
import { MapDefs, MapElementView, roadPath } from "./MapArt";
import type { MapElement } from "@/lib/map-types";

export const MIN_SCALE = 0.25;
export const MAX_SCALE = 4;

export type CanvasHandle = {
  zoomBy: (factor: number) => void;
  resetView: () => void;
};

function contentBounds(elements: MapElement[]) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const el of elements) {
    if (el.type === "road") {
      for (const p of el.points ?? []) {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      }
      continue;
    }
    minX = Math.min(minX, el.x - el.width / 2);
    minY = Math.min(minY, el.y - el.height / 2);
    maxX = Math.max(maxX, el.x + el.width / 2);
    maxY = Math.max(maxY, el.y + el.height / 2);
  }
  if (!Number.isFinite(minX)) return null;
  return { minX, minY, maxX, maxY };
}

type Props = {
  elements: MapElement[];
  backgroundColor: string;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onPlace?: (point: { x: number; y: number }) => void;
  onMove?: (id: string, x: number, y: number) => void;
  onMoveCommit?: () => void;
  readOnly?: boolean;
  placing?: boolean;
  draftPoints?: { x: number; y: number }[];
  handleRef?: RefObject<CanvasHandle | null>;
  className?: string;
  autoFit?: boolean;
};

export function MapCanvas({
  elements,
  backgroundColor,
  selectedId = null,
  onSelect,
  onPlace,
  onMove,
  onMoveCommit,
  readOnly = false,
  placing = false,
  draftPoints,
  handleRef,
  className,
  autoFit = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 1200, height: 800 });
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const panRef = useRef<{ x: number; y: number; vx: number; vy: number; moved: boolean } | null>(
    null,
  );
  const dragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const update = () =>
      setSize({ width: node.clientWidth || 1200, height: node.clientHeight || 800 });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const zoomAt = useCallback(
    (factor: number, clientX?: number, clientY?: number) => {
      setView((prev) => {
        const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale * factor));
        if (nextScale === prev.scale) return prev;
        const rect = containerRef.current?.getBoundingClientRect();
        const px = clientX != null && rect ? clientX - rect.left : size.width / 2;
        const py = clientY != null && rect ? clientY - rect.top : size.height / 2;
        const worldX = prev.x + px / prev.scale;
        const worldY = prev.y + py / prev.scale;
        return {
          scale: nextScale,
          x: worldX - px / nextScale,
          y: worldY - py / nextScale,
        };
      });
    },
    [size.width, size.height],
  );

  useImperativeHandle(
    handleRef,
    () => ({
      zoomBy: (factor: number) => zoomAt(factor),
      resetView: () => setView({ x: 0, y: 0, scale: 1 }),
    }),
    [zoomAt],
  );

  const toWorld = useCallback(
    (clientX: number, clientY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: view.x + (clientX - rect.left) / view.scale,
        y: view.y + (clientY - rect.top) / view.scale,
      };
    },
    [view],
  );

  const onBackgroundPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0 && e.button !== 1) return;
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
    panRef.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (drag && onMove) {
      const dx = (e.clientX - drag.startX) / view.scale;
      const dy = (e.clientY - drag.startY) / view.scale;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) drag.moved = true;
      onMove(drag.id, Math.round(drag.originX + dx), Math.round(drag.originY + dy));
      return;
    }
    const pan = panRef.current;
    if (!pan) return;
    const dx = e.clientX - pan.x;
    const dy = e.clientY - pan.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) pan.moved = true;
    setView((prev) => ({ ...prev, x: pan.vx - dx / prev.scale, y: pan.vy - dy / prev.scale }));
  };

  const endPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    const pan = panRef.current;
    dragRef.current = null;
    panRef.current = null;
    try {
      (e.currentTarget as SVGSVGElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    if (drag) {
      if (drag.moved) onMoveCommit?.();
      return;
    }
    if (pan && !pan.moved) {
      // Treat as a background click.
      if (placing && onPlace && !readOnly) {
        onPlace(toWorld(e.clientX, e.clientY));
      } else {
        onSelect?.(null);
      }
    }
  };

  const onElementPointerDown = (e: React.PointerEvent, element: MapElement) => {
    if (placing) return; // let the click fall through to placement
    e.stopPropagation();
    onSelect?.(element.id);
    if (readOnly || !onMove || element.type === "road") return;
    (e.currentTarget as Element).closest("svg")?.setPointerCapture(e.pointerId);
    dragRef.current = {
      id: element.id,
      startX: e.clientX,
      startY: e.clientY,
      originX: element.x,
      originY: element.y,
      moved: false,
    };
  };

  const viewBox = `${view.x} ${view.y} ${size.width / view.scale} ${size.height / view.scale}`;
  const cursor = placing ? "crosshair" : panRef.current ? "grabbing" : "grab";

  return (
    <div ref={containerRef} className={className ?? "relative h-full w-full overflow-hidden"}>
      <svg
        className="h-full w-full touch-none select-none"
        style={{ backgroundColor, cursor }}
        viewBox={viewBox}
        onPointerDown={onBackgroundPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onWheel={(e) => {
          zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX, e.clientY);
        }}
      >
        <MapDefs />
        <rect
          x={view.x - 4000}
          y={view.y - 4000}
          width={size.width / view.scale + 8000}
          height={size.height / view.scale + 8000}
          fill="url(#mc-grid)"
        />
        {elements
          .slice()
          .sort((a, b) => (a.type === "water" ? -1 : 0) - (b.type === "water" ? -1 : 0) || a.y - b.y)
          .map((element) => (
            <g
              key={element.id}
              style={{ cursor: readOnly ? "pointer" : placing ? "crosshair" : "move" }}
              onPointerDown={(e) => onElementPointerDown(e, element)}
            >
              {element.type === "road" && (
                <path
                  d={roadPath(element.points ?? [])}
                  stroke="transparent"
                  strokeWidth={26}
                  fill="none"
                />
              )}
              <MapElementView element={element} selected={element.id === selectedId} />
            </g>
          ))}
        {draftPoints && draftPoints.length > 0 && (
          <g pointerEvents="none">
            <path
              d={roadPath(draftPoints)}
              fill="none"
              stroke="#7c5cfc"
              strokeWidth={6}
              strokeDasharray="12 8"
              strokeLinecap="round"
            />
            {draftPoints.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={6} fill="#7c5cfc" stroke="#fff" strokeWidth={2} />
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}
