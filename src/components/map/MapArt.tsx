import type { MapElement, ElementType } from "@/lib/map-types";

/** Shared SVG defs (textures/gradients) used by the fantasy artwork. */
export function MapDefs() {
  return (
    <defs>
      <linearGradient id="mc-rock" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#b9b2a4" />
        <stop offset="55%" stopColor="#8b8375" />
        <stop offset="100%" stopColor="#5f594e" />
      </linearGradient>
      <linearGradient id="mc-snow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#dfe6ee" />
      </linearGradient>
      <linearGradient id="mc-tree" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3f9463" />
        <stop offset="100%" stopColor="#1f5b3a" />
      </linearGradient>
      <linearGradient id="mc-water" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#5fb2e8" />
        <stop offset="100%" stopColor="#2a6fa8" />
      </linearGradient>
      <linearGradient id="mc-stone" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#d8d2c4" />
        <stop offset="100%" stopColor="#9a9282" />
      </linearGradient>
      <linearGradient id="mc-roof" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#8e4b66" />
        <stop offset="100%" stopColor="#5d2c42" />
      </linearGradient>
      <pattern id="mc-grid" width="80" height="80" patternUnits="userSpaceOnUse">
        <path
          d="M80 0H0V80"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />
      </pattern>
    </defs>
  );
}

function Mountain({ w, h }: { w: number; h: number }) {
  return (
    <g>
      <path d={`M0 ${h} L${w * 0.3} ${h * 0.18} L${w * 0.52} ${h} Z`} fill="url(#mc-rock)" />
      <path
        d={`M${w * 0.3} ${h * 0.18} L${w * 0.38} ${h * 0.42} L${w * 0.3} ${h * 0.38} L${w * 0.22} ${h * 0.45} Z`}
        fill="url(#mc-snow)"
      />
      <path
        d={`M${w * 0.34} ${h} L${w * 0.66} ${h * 0.05} L${w} ${h} Z`}
        fill="url(#mc-rock)"
      />
      <path
        d={`M${w * 0.66} ${h * 0.05} L${w * 0.78} ${h * 0.36} L${w * 0.66} ${h * 0.3} L${w * 0.56} ${h * 0.38} Z`}
        fill="url(#mc-snow)"
      />
      <path
        d={`M${w * 0.66} ${h * 0.05} L${w * 0.66} ${h}`}
        stroke="rgba(0,0,0,0.18)"
        strokeWidth={Math.max(1, w * 0.012)}
        fill="none"
      />
      <ellipse cx={w * 0.5} cy={h} rx={w * 0.5} ry={h * 0.06} fill="rgba(0,0,0,0.18)" />
    </g>
  );
}

function Forest({ w, h }: { w: number; h: number }) {
  const trees = [
    { x: 0.16, y: 0.95, s: 0.85 },
    { x: 0.42, y: 1.0, s: 1 },
    { x: 0.68, y: 0.92, s: 0.8 },
    { x: 0.86, y: 1.0, s: 0.68 },
    { x: 0.3, y: 0.7, s: 0.62 },
    { x: 0.58, y: 0.68, s: 0.58 },
  ];
  return (
    <g>
      {trees.map((tree, i) => {
        const th = h * 0.6 * tree.s;
        const tw = w * 0.3 * tree.s;
        const cx = w * tree.x;
        const cy = h * tree.y;
        return (
          <g key={i}>
            <rect
              x={cx - tw * 0.08}
              y={cy - th * 0.28}
              width={tw * 0.16}
              height={th * 0.3}
              rx={tw * 0.06}
              fill="#5b3f27"
            />
            <path
              d={`M${cx} ${cy - th} L${cx + tw * 0.5} ${cy - th * 0.45} L${cx - tw * 0.5} ${cy - th * 0.45} Z`}
              fill="url(#mc-tree)"
            />
            <path
              d={`M${cx} ${cy - th * 0.78} L${cx + tw * 0.56} ${cy - th * 0.2} L${cx - tw * 0.56} ${cy - th * 0.2} Z`}
              fill="url(#mc-tree)"
            />
          </g>
        );
      })}
    </g>
  );
}

function Water({ w, h }: { w: number; h: number }) {
  return (
    <g>
      <path
        d={`M${w * 0.04} ${h * 0.5}
            C ${w * 0.05} ${h * 0.12}, ${w * 0.33} ${h * 0.02}, ${w * 0.55} ${h * 0.12}
            C ${w * 0.8} ${h * 0.23}, ${w} ${h * 0.35}, ${w * 0.94} ${h * 0.62}
            C ${w * 0.88} ${h * 0.92}, ${w * 0.5} ${h * 1.02}, ${w * 0.27} ${h * 0.9}
            C ${w * 0.1} ${h * 0.82}, ${w * 0.03} ${h * 0.72}, ${w * 0.04} ${h * 0.5} Z`}
        fill="url(#mc-water)"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth={Math.max(1, w * 0.008)}
      />
      {[0.35, 0.52, 0.69].map((ry, i) => (
        <path
          key={i}
          d={`M${w * (0.25 + i * 0.04)} ${h * ry} q ${w * 0.07} ${-h * 0.05} ${w * 0.14} 0 q ${w * 0.07} ${h * 0.05} ${w * 0.14} 0`}
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={Math.max(1, w * 0.007)}
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}

function City({ w, h }: { w: number; h: number }) {
  return (
    <g>
      <path
        d={`M${w * 0.06} ${h} L${w * 0.06} ${h * 0.55} L${w * 0.94} ${h * 0.55} L${w * 0.94} ${h} Z`}
        fill="url(#mc-stone)"
        stroke="rgba(0,0,0,0.25)"
        strokeWidth={Math.max(1, w * 0.012)}
      />
      {[0.06, 0.24, 0.42, 0.6, 0.78].map((bx, i) => (
        <rect
          key={i}
          x={w * bx}
          y={h * 0.48}
          width={w * 0.16}
          height={h * 0.08}
          fill="url(#mc-stone)"
        />
      ))}
      <rect x={w * 0.42} y={h * 0.72} width={w * 0.16} height={h * 0.28} fill="#4b3a26" rx={w * 0.07} />
      {[
        { x: 0.16, hh: 0.34 },
        { x: 0.66, hh: 0.4 },
      ].map((tower, i) => (
        <g key={i}>
          <rect
            x={w * tower.x}
            y={h * (0.55 - tower.hh)}
            width={w * 0.18}
            height={h * tower.hh}
            fill="url(#mc-stone)"
          />
          <path
            d={`M${w * (tower.x - 0.03)} ${h * (0.55 - tower.hh)} L${w * (tower.x + 0.09)} ${h * (0.55 - tower.hh - 0.16)} L${w * (tower.x + 0.21)} ${h * (0.55 - tower.hh)} Z`}
            fill="url(#mc-roof)"
          />
        </g>
      ))}
      <ellipse cx={w * 0.5} cy={h} rx={w * 0.52} ry={h * 0.05} fill="rgba(0,0,0,0.2)" />
    </g>
  );
}

function Castle({ w, h }: { w: number; h: number }) {
  const merlon = (x: number, y: number, bw: number) =>
    `M${x} ${y} l0 ${-h * 0.08} l${bw * 0.22} 0 l0 ${h * 0.05} l${bw * 0.18} 0 l0 ${-h * 0.05} l${bw * 0.2} 0 l0 ${h * 0.05} l${bw * 0.18} 0 l0 ${-h * 0.05} l${bw * 0.22} 0 l0 ${h * 0.08} Z`;
  return (
    <g>
      <rect x={w * 0.18} y={h * 0.42} width={w * 0.64} height={h * 0.58} fill="url(#mc-stone)" />
      <path d={merlon(w * 0.18, h * 0.42, w * 0.64)} fill="url(#mc-stone)" />
      {[0.04, 0.72].map((tx, i) => (
        <g key={i}>
          <rect x={w * tx} y={h * 0.26} width={w * 0.24} height={h * 0.74} fill="url(#mc-stone)" />
          <path
            d={`M${w * (tx - 0.04)} ${h * 0.26} L${w * (tx + 0.12)} ${h * 0.02} L${w * (tx + 0.28)} ${h * 0.26} Z`}
            fill="url(#mc-roof)"
          />
          <path
            d={`M${w * (tx + 0.12)} ${h * 0.04} l${w * 0.14} ${h * 0.04} l${-w * 0.14} ${h * 0.04} Z`}
            fill="#d9a441"
          />
        </g>
      ))}
      <path
        d={`M${w * 0.42} ${h} L${w * 0.42} ${h * 0.68} a ${w * 0.08} ${h * 0.08} 0 0 1 ${w * 0.16} 0 L${w * 0.58} ${h} Z`}
        fill="#3b2c1c"
      />
      <ellipse cx={w * 0.5} cy={h} rx={w * 0.54} ry={h * 0.05} fill="rgba(0,0,0,0.2)" />
    </g>
  );
}

function Marker({ w, h }: { w: number; h: number }) {
  return (
    <g>
      <rect x={w * 0.44} y={0} width={w * 0.1} height={h} rx={w * 0.05} fill="#6b5436" />
      <path
        d={`M${w * 0.52} ${h * 0.05} L${w} ${h * 0.14} L${w * 0.52} ${h * 0.24} Z`}
        fill="#7c5cfc"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth={Math.max(1, w * 0.02)}
      />
      <ellipse cx={w * 0.49} cy={h} rx={w * 0.22} ry={h * 0.04} fill="rgba(0,0,0,0.25)" />
    </g>
  );
}

function roadPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return "";
  const first = points[0]!;
  if (points.length === 1) return `M${first.x} ${first.y}`;
  let d = `M${first.x} ${first.y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!;
    const cur = points[i]!;
    const mx = (prev.x + cur.x) / 2;
    const my = (prev.y + cur.y) / 2;
    d += ` Q${prev.x} ${prev.y} ${mx} ${my}`;
  }
  const last = points[points.length - 1]!;
  d += ` L${last.x} ${last.y}`;
  return d;
}

export function ElementShape({ type, w, h }: { type: ElementType; w: number; h: number }) {
  switch (type) {
    case "mountain":
      return <Mountain w={w} h={h} />;
    case "forest":
      return <Forest w={w} h={h} />;
    case "water":
      return <Water w={w} h={h} />;
    case "city":
      return <City w={w} h={h} />;
    case "castle":
      return <Castle w={w} h={h} />;
    case "marker":
      return <Marker w={w} h={h} />;
    default:
      return null;
  }
}

/** Renders one persisted element, including roads (which use absolute points). */
export function MapElementView({
  element,
  selected,
  labelScale = 1,
}: {
  element: MapElement;
  selected?: boolean;
  labelScale?: number;
}) {
  if (element.type === "road") {
    const pts = element.points ?? [];
    const d = roadPath(pts);
    return (
      <g>
        <path
          d={d}
          fill="none"
          stroke="rgba(0,0,0,0.25)"
          strokeWidth={14}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={d}
          fill="none"
          stroke="#c9b083"
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={d}
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={2}
          strokeDasharray="10 14"
          strokeLinecap="round"
        />
        {selected &&
          pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={6} fill="#7c5cfc" stroke="#fff" strokeWidth={2} />
          ))}
      </g>
    );
  }

  const w = element.width;
  const h = element.height;
  return (
    <g transform={`translate(${element.x - w / 2}, ${element.y - h / 2})`}>
      {selected && (
        <rect
          x={-8}
          y={-8}
          width={w + 16}
          height={h + 16}
          rx={10}
          fill="rgba(124,92,252,0.12)"
          stroke="#7c5cfc"
          strokeWidth={2}
          strokeDasharray="6 5"
        />
      )}
      <ElementShape type={element.type} w={w} h={h} />
      {element.name ? (
        <text
          x={w / 2}
          y={h + 20 * labelScale}
          textAnchor="middle"
          fontSize={18 * labelScale}
          fontFamily="Cinzel, Georgia, serif"
          fill="#f5f7fa"
          stroke="rgba(0,0,0,0.65)"
          strokeWidth={3 * labelScale}
          paintOrder="stroke"
        >
          {element.name}
        </text>
      ) : null}
    </g>
  );
}

export { roadPath };
