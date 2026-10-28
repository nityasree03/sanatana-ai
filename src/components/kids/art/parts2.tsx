import { C, Person } from "./parts";

/** More drawing pieces (original, simple shapes). */

export const C2 = {
  hanuman: "#c9623a",
  hanumanFace: "#f0c9a0",
  uma: "#e9b44c",
  sari: "#c23b5c",
  sari2: "#2e8b7a",
  yama: "#3e6b5a",
  fire: "#e8622c",
  wind: "#8fc1e3",
  glow: "#fff2b3",
  snow: "#f7f7fb",
  rock: "#8c95a8",
  palace: "#e4c27a",
  palaceDark: "#b8923e",
  night: "#22304f",
  red: "#d9483b",
} as const;

export function Sea({ y = 300, fill = C.sea }: { y?: number; fill?: string }) {
  return (
    <g>
      <rect x="0" y={y} width="800" height={450 - y} fill={fill} />
      {[0, 1, 2].map((row) =>
        Array.from({ length: 9 }, (_, i) => (
          <path
            key={`${row}-${i}`}
            d={`M${i * 95 + (row % 2) * 40} ${y + 30 + row * 40} q 15 -10 30 0 q 15 10 30 0`}
            stroke={C.seaDark}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        )),
      )}
    </g>
  );
}

/** Hanuman: reddish-orange, light face with a rounded muzzle, a curling tail. */
export function Hanuman({
  x,
  y,
  s = 1,
  pose = "stand",
}: {
  x: number;
  y: number;
  s?: number;
  pose?: "stand" | "pray" | "fly" | "kneel" | "wave";
}) {
  if (pose === "fly")
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <path
          d="M-70 10 Q -100 -20 -80 -40"
          stroke={C2.hanuman}
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
        />
        <rect x="-70" y="-6" width="80" height="24" rx="12" fill={C.yellow} />
        <rect x="-110" y="0" width="45" height="9" rx="4" fill={C2.hanuman} />
        <rect x="-110" y="12" width="45" height="9" rx="4" fill={C2.hanuman} />
        <rect x="5" y="-10" width="60" height="9" rx="4" fill={C2.hanuman} />
        <rect x="5" y="14" width="55" height="9" rx="4" fill={C2.hanuman} />
        <circle cx="25" cy="4" r="17" fill={C2.hanuman} />
        <ellipse cx="33" cy="9" rx="10" ry="8" fill={C2.hanumanFace} />
        <circle cx="29" cy="-1" r="2" fill={C.ink} />
        <path d="M14 -14 L22 -24 L30 -14 Z" fill={C.gold} />
      </g>
    );
  const arm = pose === "wave" ? "wave" : "down";
  const kneel = pose === "kneel";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d="M-14 -30 Q -50 -30 -48 -70 Q -46 -90 -30 -86"
        stroke={C2.hanuman}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      <g transform={kneel ? "translate(0 22) scale(1 0.75)" : undefined}>
        <Person x={0} y={0} skin={C2.hanuman} cloth={C.yellow} arm={arm} />
      </g>
      <ellipse cx="4" cy={kneel ? -60 : -82} rx="9" ry="7" fill={C2.hanumanFace} />
      <circle cx="-3" cy={kneel ? -70 : -92} r="1.8" fill={C.ink} />
      <circle cx="7" cy={kneel ? -70 : -92} r="1.8" fill={C.ink} />
      <path
        d={`M-9 ${kneel ? -88 : -110} L0 ${kneel ? -100 : -122} L9 ${kneel ? -88 : -110} Z`}
        fill={C.gold}
      />
      {pose === "pray" && (
        <path
          d="M-6 -78 L0 -64 L6 -78 Z"
          fill={C2.hanumanFace}
          stroke={C2.hanuman}
          strokeWidth="2"
        />
      )}
    </g>
  );
}

/** A woman in a sari (Sita, Uma). */
export function Woman({
  x,
  y,
  s = 1,
  sari = C2.sari,
  skin = C.skin,
  glow = false,
  arm = "down",
}: {
  x: number;
  y: number;
  s?: number;
  sari?: string;
  skin?: string;
  glow?: boolean;
  arm?: "down" | "wave";
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {glow && <circle cx="0" cy="-60" r="80" fill={C2.glow} opacity="0.7" />}
      <path d="M-22 0 L22 0 L14 -78 L-14 -78 Z" fill={sari} />
      <path d="M-14 -78 L14 -78 L20 -40 Z" fill={C.yellow} opacity="0.8" />
      {arm === "wave" ? (
        <rect
          x="12"
          y="-104"
          width="7"
          height="30"
          rx="3"
          fill={skin}
          transform="rotate(25 15 -76)"
        />
      ) : (
        <rect x="12" y="-76" width="7" height="34" rx="3" fill={skin} />
      )}
      <rect x="-19" y="-76" width="7" height="34" rx="3" fill={skin} />
      <path d="M-15 -86 Q -18 -60 -10 -50 L10 -50 Q 18 -60 15 -86 Z" fill={C.ink} />
      <circle cx="0" cy="-90" r="13" fill={skin} />
      <path d="M-14 -94 Q 0 -110 14 -94 Q 6 -104 -14 -94 Z" fill={C.ink} />
      <circle cx="0" cy="-95" r="2" fill={C2.red} />
    </g>
  );
}

/** A dignified king (Indra, Yama). */
export function King({
  x,
  y,
  s = 1,
  skin = C.skin,
  cloth = C.cloth2,
  arm = "down",
}: {
  x: number;
  y: number;
  s?: number;
  skin?: string;
  cloth?: string;
  arm?: "down" | "up" | "wave";
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Person x={0} y={0} skin={skin} cloth={cloth} arm={arm} />
      <path d="M-13 -100 L-13 -116 L-6 -108 L0 -120 L6 -108 L13 -116 L13 -100 Z" fill={C.gold} />
    </g>
  );
}

export function Stars({ n = 18 }: { n?: number }) {
  return (
    <g fill="#fff6d0">
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} cx={((i * 137) % 790) + 5} cy={((i * 71) % 170) + 15} r={i % 3 ? 2 : 3} />
      ))}
    </g>
  );
}

export function Palace({
  x,
  y,
  s = 1,
  fill = C2.palace,
}: {
  x: number;
  y: number;
  s?: number;
  fill?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-90" y="-80" width="180" height="80" fill={fill} />
      <rect x="-110" y="-120" width="40" height="120" fill={fill} />
      <rect x="70" y="-120" width="40" height="120" fill={fill} />
      <path d="M-110 -120 Q -90 -160 -70 -120 Z" fill={C2.palaceDark} />
      <path d="M70 -120 Q 90 -160 110 -120 Z" fill={C2.palaceDark} />
      <path d="M-40 -80 Q 0 -150 40 -80 Z" fill={C2.palaceDark} />
      <path d="M-18 0 L-18 -40 Q 0 -60 18 -40 L18 0 Z" fill="#6b4a2a" />
    </g>
  );
}

export function SnowPeaks({ y = 300 }: { y?: number }) {
  return (
    <g>
      {[
        [130, 230],
        [330, 280],
        [560, 250],
        [740, 210],
      ].map(([px, h]) => (
        <g key={px}>
          <path d={`M${px - 170} ${y} L${px} ${y - h} L${px + 170} ${y} Z`} fill={C2.rock} />
          <path
            d={`M${px - 52} ${y - h * 0.7} L${px} ${y - h} L${px + 52} ${y - h * 0.7} L${px + 22} ${y - h * 0.62} L${px} ${y - h * 0.7} L${px - 24} ${y - h * 0.6} Z`}
            fill={C2.snow}
          />
        </g>
      ))}
    </g>
  );
}

export function FlowerTree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-8" y="-90" width="16" height="90" fill="#7a5530" />
      <circle cx="0" cy="-120" r="55" fill={C.hillDark} />
      {[
        [-30, -130],
        [10, -150],
        [30, -110],
        [-10, -100],
        [-35, -95],
        [25, -140],
      ].map(([fx, fy]) => (
        <circle key={`${fx}${fy}`} cx={fx} cy={fy} r="7" fill={C2.red} />
      ))}
    </g>
  );
}

export function Straw({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(-8)`}>
      <rect
        x="-45"
        y="-4"
        width="90"
        height="8"
        rx="4"
        fill="#e3c35a"
        stroke="#b3922c"
        strokeWidth="1.5"
      />
    </g>
  );
}

export function Glow({ x, y, r = 70 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r * 1.6} fill={C2.glow} opacity="0.35" />
      <circle cx={x} cy={y} r={r} fill={C2.glow} opacity="0.7" />
      <circle cx={x} cy={y} r={r * 0.45} fill="#fffbe6" />
    </g>
  );
}

/** Fire god: a person with flame hair. */
export function FireGod({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-18 -96 Q -22 -130 -6 -118 Q 0 -146 8 -120 Q 22 -132 18 -96 Z" fill={C2.fire} />
      <Person x={0} y={0} skin="#d9774a" cloth={C2.fire} arm="wave" />
    </g>
  );
}

/** Wind god: pale blue, with swirls. */
export function WindGod({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Person x={0} y={0} skin="#9fb7cf" cloth={C2.wind} arm="wave" />
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M30 ${-110 + i * 26} q 60 -10 90 10 q 20 16 -6 22`}
          stroke={C2.wind}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}

export function Lamp({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx="0" cy="-34" r="26" fill={C2.glow} opacity="0.8" />
      <path d="M-6 -24 Q 0 -54 6 -24 Z" fill={C.sun} />
      <path d="M-34 -18 Q 0 18 34 -18 Z" fill="#c4813b" />
    </g>
  );
}

export function GoldPile({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${s})`}
      fill={C.gold}
      stroke="#9a7420"
      strokeWidth="2"
    >
      {[
        [-30, 0],
        [0, 0],
        [30, 0],
        [-15, -16],
        [15, -16],
        [0, -32],
      ].map(([cx, cy]) => (
        <ellipse key={`${cx}${cy}`} cx={cx} cy={cy} rx="16" ry="8" />
      ))}
    </g>
  );
}

export function Horse({
  x,
  y,
  s = 1,
  flip = false,
}: {
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} fill="#a0704a">
      {[-24, -10, 12, 26].map((lx) => (
        <rect key={lx} x={lx - 3} y="8" width="6" height="30" />
      ))}
      <ellipse cx="0" cy="0" rx="34" ry="16" />
      <path d="M26 -6 L44 -40 L56 -36 L40 0 Z" />
      <ellipse cx="54" cy="-38" rx="12" ry="8" />
      <path d="M30 -10 L40 -40" stroke="#5a3a22" strokeWidth="6" />
      <path d="M-34 -4 Q -48 10 -42 26" stroke="#5a3a22" strokeWidth="5" fill="none" />
    </g>
  );
}

export function Fire({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-30" y="-6" width="60" height="12" rx="3" fill="#7a5530" />
      <path d="M-20 -6 Q -26 -40 -4 -30 Q 0 -60 10 -32 Q 26 -42 20 -6 Z" fill={C2.fire} />
      <path d="M-8 -6 Q -8 -26 2 -20 Q 10 -30 8 -6 Z" fill={C.sun} />
    </g>
  );
}
