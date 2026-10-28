/**
 * Small drawing pieces for the storybook scenes. Original, simple flat shapes in an
 * 800×450 canvas (icons use 200×200). Nothing here copies existing artwork.
 */

export const C = {
  sky: "#cfe8f3",
  skyAutumn: "#f6e3c4",
  skyStorm: "#55607a",
  skyNight: "#26304a",
  grass: "#9cc47a",
  grassDark: "#6f9a52",
  hill: "#7fae5c",
  hillDark: "#5d8a43",
  earth: "#c8a679",
  hut: "#d9b48a",
  roof: "#a8753f",
  skin: "#c98e63",
  skinDark: "#9c6b47",
  krishna: "#3d6fb5",
  yellow: "#e8b923",
  cloth: "#e86f51",
  cloth2: "#6a9bd1",
  white: "#fffaf0",
  cloud: "#ffffff",
  stormCloud: "#3b4258",
  rain: "#a9c6e8",
  sun: "#f6c445",
  sea: "#3f8fbf",
  seaDark: "#2c6f99",
  stone: "#9a8f86",
  gold: "#d8a531",
  ink: "#2b2118",
} as const;

export function Ground({ y = 330, color: fill = C.grass }: { y?: number; color?: string }) {
  return <rect x="0" y={y} width="800" height={450 - y} fill={fill} />;
}

export function Hill({
  x,
  y,
  w,
  h,
  fill = C.hill,
  trees = true,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  fill?: string;
  trees?: boolean;
}) {
  const l = x - w / 2;
  const r = x + w / 2;
  return (
    <g>
      <path
        d={`M${l} ${y} C ${l + w * 0.2} ${y - h} ${r - w * 0.2} ${y - h} ${r} ${y} Z`}
        fill={fill}
      />
      {trees &&
        [0.3, 0.45, 0.6, 0.72].map((f, i) => (
          <circle
            key={i}
            cx={l + w * f}
            cy={y - h * (0.55 + (i % 2) * 0.12)}
            r={Math.max(6, w * 0.035)}
            fill={C.hillDark}
          />
        ))}
    </g>
  );
}

export function Cow({
  x,
  y,
  s = 1,
  flip = false,
  garland = false,
  fill = C.white,
}: {
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  garland?: boolean;
  fill?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {[-22, -8, 10, 22].map((lx) => (
        <rect key={lx} x={lx - 3} y="8" width="6" height="22" fill="#8a7a6a" />
      ))}
      <ellipse cx="0" cy="0" rx="32" ry="18" fill={fill} stroke="#8a7a6a" strokeWidth="1.5" />
      <ellipse cx="-8" cy="-4" rx="8" ry="6" fill="#b58d6a" />
      <ellipse cx="38" cy="-12" rx="11" ry="10" fill={fill} stroke="#8a7a6a" strokeWidth="1.5" />
      <path
        d="M33 -21 L29 -29 M43 -21 L47 -29"
        stroke="#8a7a6a"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="41" cy="-13" r="1.8" fill={C.ink} />
      <path d="M-32 -2 Q -42 6 -38 16" stroke="#8a7a6a" strokeWidth="2" fill="none" />
      {garland &&
        [0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={28 + i * 2} cy={-4 + i * 3} r="3" fill={i % 2 ? C.yellow : C.cloth} />
        ))}
    </g>
  );
}

export function Hut({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-35" y="-40" width="70" height="40" fill={C.hut} />
      <path d="M-45 -38 L0 -78 L45 -38 Z" fill={C.roof} />
      <rect x="-9" y="-26" width="18" height="26" fill="#7a5530" />
    </g>
  );
}

/** A simple standing person. `arm` raises the right arm (for waving or holding). */
export function Person({
  x,
  y,
  s = 1,
  skin = C.skin,
  cloth = C.cloth,
  arm = "down",
  pot = false,
}: {
  x: number;
  y: number;
  s?: number;
  skin?: string;
  cloth?: string;
  arm?: "down" | "up" | "wave";
  pot?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-9" y="-30" width="7" height="30" fill={skin} />
      <rect x="2" y="-30" width="7" height="30" fill={skin} />
      <path d="M-16 -32 L16 -32 L12 -76 L-12 -76 Z" fill={cloth} />
      {arm === "up" ? (
        <rect x="12" y="-120" width="7" height="48" rx="3" fill={skin} />
      ) : arm === "wave" ? (
        <rect
          x="12"
          y="-100"
          width="7"
          height="30"
          rx="3"
          fill={skin}
          transform="rotate(25 15 -74)"
        />
      ) : (
        <rect x="12" y="-74" width="7" height="34" rx="3" fill={skin} />
      )}
      <rect x="-19" y="-74" width="7" height="34" rx="3" fill={skin} />
      <circle cx="0" cy="-88" r="13" fill={skin} />
      <path d="M-13 -92 Q 0 -108 13 -92 Q 6 -100 -13 -92 Z" fill={C.ink} />
      {pot && (
        <g>
          <ellipse cx="0" cy="-110" rx="14" ry="11" fill="#b8693d" />
          <rect x="-7" y="-124" width="14" height="6" fill="#9a5530" />
        </g>
      )}
    </g>
  );
}

/** Young Krishna: blue skin, yellow cloth, a peacock feather. */
export function Krishna({
  x,
  y,
  s = 1,
  arm = "down",
}: {
  x: number;
  y: number;
  s?: number;
  arm?: "down" | "up" | "wave";
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Person x={0} y={0} skin={C.krishna} cloth={C.yellow} arm={arm} />
      <ellipse cx="6" cy="-112" rx="5" ry="12" fill="#2f8f6f" transform="rotate(20 6 -112)" />
      <circle cx="8" cy="-117" r="3.5" fill="#1d4f8f" />
    </g>
  );
}

export function Cloud({
  x,
  y,
  s = 1,
  fill = C.cloud,
}: {
  x: number;
  y: number;
  s?: number;
  fill?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
      <circle cx="-30" cy="0" r="22" />
      <circle cx="0" cy="-12" r="30" />
      <circle cx="32" cy="0" r="22" />
      <rect x="-52" y="0" width="106" height="20" rx="10" />
    </g>
  );
}

/** Rain lines between x1..x2, y1..y2. Gently falls unless reduced motion is on. */
export function Rain({ x1, x2, y1, y2 }: { x1: number; x2: number; y1: number; y2: number }) {
  const lines = [];
  for (let x = x1; x < x2; x += 22)
    for (let y = y1 + ((x / 22) % 3) * 14; y < y2; y += 46)
      lines.push(<line key={`${x}-${y}`} x1={x} y1={y} x2={x - 6} y2={y + 18} />);
  return (
    <g className="kids-rain" stroke={C.rain} strokeWidth="3" strokeLinecap="round">
      {lines}
    </g>
  );
}

export function Sun({ x, y, r = 34 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={x + Math.cos(a) * (r + 8)}
            y1={y + Math.sin(a) * (r + 8)}
            x2={x + Math.cos(a) * (r + 22)}
            y2={y + Math.sin(a) * (r + 22)}
            stroke={C.sun}
            strokeWidth="5"
            strokeLinecap="round"
          />
        );
      })}
      <circle cx={x} cy={y} r={r} fill={C.sun} />
    </g>
  );
}

export function Elephant({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${s})`}
      fill="#f2f0ea"
      stroke="#9c958a"
      strokeWidth="2"
    >
      {[-40, -15, 15, 38].map((lx) => (
        <rect key={lx} x={lx - 9} y="10" width="18" height="40" rx="4" />
      ))}
      <ellipse cx="0" cy="0" rx="58" ry="40" />
      <circle cx="58" cy="-18" r="28" />
      <ellipse cx="48" cy="-18" rx="16" ry="22" fill="#e6e2d9" />
      <path d="M80 -10 Q 96 20 84 46" fill="none" strokeWidth="10" strokeLinecap="round" />
      <circle cx="68" cy="-24" r="3" fill={C.ink} stroke="none" />
      <path d="M-30 -38 L-20 -46 L30 -46 L40 -38 Z" fill={C.cloth} stroke="none" />
    </g>
  );
}

export function Garland({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  const n = Math.floor((x2 - x1) / 18);
  return (
    <g>
      <path
        d={`M${x1} ${y} Q ${(x1 + x2) / 2} ${y + 30} ${x2} ${y}`}
        stroke="#7a5530"
        strokeWidth="1.5"
        fill="none"
      />
      {Array.from({ length: n + 1 }, (_, i) => {
        const t = i / n;
        const px = x1 + (x2 - x1) * t;
        const py = y + 2 * 30 * t * (1 - t);
        return <circle key={i} cx={px} cy={py} r="5" fill={i % 2 ? C.yellow : C.cloth} />;
      })}
    </g>
  );
}
