import type { ReactNode } from "react";
import type { CompanionId } from "@/lib/companions";

/**
 * Original 2D portraits of the four companions (gentle grown-up style).
 *
 * All four share one face rig: eyes (blink), pupils (look up while thinking),
 * brows (normal / concerned for errors), and two mouths (closed / open for speaking).
 * The animation itself lives in globals.css and reacts to the
 * data-avatar-state attribute on the surrounding <figure>, so the same drawing
 * can show idle, listening, thinking, speaking and error states.
 *
 * Mouth movement while speaking is an approximate loop; it is NOT phoneme-accurate lip sync.
 */

interface FaceStyle {
  skin: string;
  skinShade: string;
  brow: string;
  lip: string;
  eyeY: number;
  mouthY: number;
  /** 1 = fully open eyes; lower = calmer, half-lidded look. */
  eyeOpen: number;
  liner?: boolean;
}

const STYLES: Record<CompanionId, FaceStyle> = {
  krishna: {
    skin: "#7393c9",
    skinShade: "#5d7bb3",
    brow: "#1e1a2e",
    lip: "#8a3a4a",
    eyeY: 114,
    mouthY: 146,
    eyeOpen: 1,
  },
  shiva: {
    skin: "#93a6c2",
    skinShade: "#7a8eac",
    brow: "#3a2a1e",
    lip: "#7a4048",
    eyeY: 114,
    mouthY: 146,
    eyeOpen: 0.72,
  },
  hanuman: {
    skin: "#c8743a",
    skinShade: "#a85e2c",
    brow: "#6b3a1a",
    lip: "#7a3020",
    eyeY: 108,
    mouthY: 153,
    eyeOpen: 1,
  },
  parvati: {
    skin: "#e2a77f",
    skinShade: "#c98d66",
    brow: "#2a1a14",
    lip: "#b0384c",
    eyeY: 114,
    mouthY: 146,
    eyeOpen: 1,
    liner: true,
  },
};

function Eye({ cx, cy, open, liner }: { cx: number; cy: number; open: number; liner?: boolean }) {
  return (
    // Outer group blinks (CSS animation); inner group sets how open the eyes are at rest.
    <g className="p-eye">
      <g transform={`translate(0 ${cy * (1 - open)}) scale(1 ${open})`}>
        <path
          d={`M${cx - 11} ${cy} Q${cx} ${cy - 8} ${cx + 11} ${cy} Q${cx} ${cy + 6.5} ${cx - 11} ${cy}Z`}
          fill="#fbf8f2"
        />
        <g className="p-pupil">
          <circle cx={cx} cy={cy} r="5" fill="#3b2314" />
          <circle cx={cx} cy={cy} r="2.4" fill="#120a06" />
          <circle cx={cx - 1.6} cy={cy - 1.8} r="1.4" fill="#ffffff" />
        </g>
        <path
          d={`M${cx - 12} ${cy} Q${cx} ${cy - 9.5} ${cx + 12} ${cy - 1}`}
          fill="none"
          stroke="#1a120c"
          strokeWidth={liner ? 2.6 : 1.8}
          strokeLinecap="round"
        />
      </g>
    </g>
  );
}

function Face({ s, children }: { s: FaceStyle; children?: ReactNode }) {
  const { eyeY, mouthY } = s;
  return (
    <>
      <g>
        <Eye cx={82} cy={eyeY} open={s.eyeOpen} liner={s.liner} />
        <Eye cx={118} cy={eyeY} open={s.eyeOpen} liner={s.liner} />
      </g>
      {/* Normal brows */}
      <g
        className="p-brow-normal"
        fill="none"
        stroke={s.brow}
        strokeWidth="2.6"
        strokeLinecap="round"
      >
        <path d={`M71 ${eyeY - 13} Q82 ${eyeY - 18} 93 ${eyeY - 14}`} />
        <path d={`M107 ${eyeY - 14} Q118 ${eyeY - 18} 129 ${eyeY - 13}`} />
      </g>
      {/* Concerned brows (error state) */}
      <g
        className="p-brow-error"
        fill="none"
        stroke={s.brow}
        strokeWidth="2.6"
        strokeLinecap="round"
      >
        <path d={`M71 ${eyeY - 12} Q82 ${eyeY - 14} 93 ${eyeY - 19}`} />
        <path d={`M107 ${eyeY - 19} Q118 ${eyeY - 14} 129 ${eyeY - 12}`} />
      </g>
      {children}
      {/* Cheeks */}
      <ellipse cx="73" cy={mouthY - 13} rx="7" ry="4" fill="#e58a9a" opacity="0.3" />
      <ellipse cx="127" cy={mouthY - 13} rx="7" ry="4" fill="#e58a9a" opacity="0.3" />
      {/* Mouths */}
      <path
        className="p-mouth-closed"
        d={`M90 ${mouthY} Q100 ${mouthY + 6} 110 ${mouthY}`}
        fill="none"
        stroke={s.lip}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <g className="p-mouth-open">
        <ellipse cx="100" cy={mouthY + 2} rx="7" ry="5" fill="#5a1f22" />
        <ellipse cx="100" cy={mouthY + 4.5} rx="4" ry="2" fill="#c8606a" />
      </g>
    </>
  );
}

const Nose = ({ shade }: { shade: string }) => (
  <path
    d="M100 119 Q97 130 100 133 Q103 134 105 132"
    fill="none"
    stroke={shade}
    strokeWidth="1.8"
    strokeLinecap="round"
  />
);

function HeadBase({ s, ears = true }: { s: FaceStyle; ears?: boolean }) {
  return (
    <>
      <rect x="88" y="158" width="24" height="42" rx="8" fill={s.skinShade} />
      {ears && (
        <>
          <ellipse cx="55" cy="118" rx="7" ry="11" fill={s.skinShade} />
          <ellipse cx="145" cy="118" rx="7" ry="11" fill={s.skinShade} />
        </>
      )}
      <ellipse cx="100" cy="112" rx="46" ry="54" fill={s.skin} />
    </>
  );
}

/* ---------------- Krishna ---------------- */
function Krishna() {
  const s = STYLES.krishna;
  return (
    <>
      <path
        d="M52 100 C48 150 54 196 66 214 L134 214 C146 196 152 150 148 100 C140 66 60 66 52 100Z"
        fill="#1e1a2e"
      />
      <path d="M20 250 C24 214 56 196 100 194 C144 196 176 214 180 250 Z" fill="#e9b83a" />
      <path
        d="M58 250 C66 226 80 214 100 212 C120 214 134 226 142 250"
        fill="none"
        stroke="#c98f14"
        strokeWidth="3"
      />
      <g className="p-head">
        <HeadBase s={s} />
        <path
          d="M55 104 C58 76 80 66 100 66 C120 66 142 76 145 104 C134 88 116 78 100 80 C84 78 66 88 55 104Z"
          fill="#1e1a2e"
        />
        {/* Peacock feather */}
        <path d="M126 64 Q138 36 154 14" fill="none" stroke="#2e7d4f" strokeWidth="2.5" />
        <ellipse cx="153" cy="22" rx="12" ry="18" fill="#2e8b57" transform="rotate(30 153 22)" />
        <ellipse cx="153" cy="22" rx="7.5" ry="11" fill="#1f7a8c" transform="rotate(30 153 22)" />
        <ellipse cx="154" cy="21" rx="4" ry="5.5" fill="#1b3a6b" transform="rotate(30 154 21)" />
        <circle cx="155" cy="20" r="1.8" fill="#e0b23a" />
        {/* Crown */}
        <path
          d="M58 82 L64 52 L80 64 L100 38 L120 64 L136 52 L142 82 Q100 72 58 82Z"
          fill="#d9a520"
          stroke="#a87a10"
          strokeWidth="1.5"
        />
        <circle cx="100" cy="64" r="5" fill="#c0392b" stroke="#a87a10" />
        <circle cx="78" cy="72" r="2.6" fill="#1f7a8c" />
        <circle cx="122" cy="72" r="2.6" fill="#1f7a8c" />
        {/* Tilak */}
        <path
          d="M95 84 Q95 98 100 100 Q105 98 105 84"
          fill="none"
          stroke="#fff6e0"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path d="M100 88 V97" stroke="#d4452b" strokeWidth="2.2" strokeLinecap="round" />
        <Face s={s}>
          <Nose shade={s.skinShade} />
        </Face>
        <circle cx="55" cy="132" r="4" fill="#e0b23a" />
        <circle cx="145" cy="132" r="4" fill="#e0b23a" />
      </g>
      {/* Garland */}
      <g>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
          const t = i / 10;
          const x = 64 + t * 72;
          const y = 204 + Math.sin(t * Math.PI) * 30;
          const colours = ["#c0392b", "#fff6e0", "#2e8b57"];
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4.2"
              fill={colours[i % 3]}
              stroke="#8a5a1a"
              strokeWidth="0.6"
            />
          );
        })}
      </g>
    </>
  );
}

/* ---------------- Shiva ---------------- */
function Shiva() {
  const s = STYLES.shiva;
  return (
    <>
      <path
        d="M50 96 C44 150 50 200 60 220 L140 220 C150 200 156 150 150 96 C140 66 60 66 50 96Z"
        fill="#3a2a1e"
      />
      <path d="M20 250 C24 214 56 196 100 194 C144 196 176 214 180 250 Z" fill={s.skin} />
      {/* Tiger-skin cloth over one shoulder */}
      <path d="M30 250 C40 226 70 206 96 204 L150 250Z" fill="#d9a35b" />
      <g stroke="#5a3a1a" strokeWidth="2.4" strokeLinecap="round">
        <path d="M70 232 l8 -6" />
        <path d="M96 226 l8 -7" />
        <path d="M118 240 l7 -6" />
      </g>
      {/* Rudraksha mala */}
      <g fill="#7a4a2a">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
          const t = i / 8;
          return <circle key={i} cx={72 + t * 56} cy={200 + Math.sin(t * Math.PI) * 24} r="3.4" />;
        })}
      </g>
      <g className="p-head">
        <HeadBase s={s} />
        <path
          d="M55 102 C52 70 76 54 100 54 C124 54 148 70 145 102 C134 86 116 77 100 79 C84 77 66 86 55 102Z"
          fill="#3a2a1e"
        />
        {/* Matted hair bun (jata) */}
        <ellipse cx="100" cy="56" rx="30" ry="18" fill="#4a3526" />
        <ellipse cx="100" cy="38" rx="21" ry="14" fill="#4a3526" />
        <ellipse cx="100" cy="23" rx="12" ry="9" fill="#4a3526" />
        <g fill="none" stroke="#2a1c12" strokeWidth="1.2" opacity="0.6">
          <path d="M80 52 Q100 60 120 52" />
          <path d="M86 36 Q100 42 114 36" />
        </g>
        {/* Ganga */}
        <path
          d="M104 15 q6 -9 14 -3 q5 4 10 -2"
          fill="none"
          stroke="#7fc6e8"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        {/* Crescent moon */}
        <path d="M70 34 A12 12 0 1 0 82 50 A9 9 0 1 1 70 34Z" fill="#f4f1e6" />
        {/* Tripundra (three lines of ash) and third eye */}
        <g stroke="#f5f2ea" strokeWidth="2.2" strokeLinecap="round">
          <path d="M84 85 H116" />
          <path d="M83 90 H117" />
          <path d="M84 95 H116" />
        </g>
        <ellipse cx="100" cy="90" rx="1.8" ry="3.6" fill="#c0392b" />
        <Face s={s}>
          <Nose shade={s.skinShade} />
        </Face>
      </g>
      {/* Snake around the neck */}
      <path
        d="M78 190 C84 204 116 206 122 190"
        fill="none"
        stroke="#3f7d4a"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <ellipse cx="125" cy="185" rx="6" ry="4.5" fill="#3f7d4a" />
      <circle cx="127" cy="184" r="1" fill="#f4f1e6" />
    </>
  );
}

/* ---------------- Hanuman ---------------- */
function Hanuman() {
  const s = STYLES.hanuman;
  return (
    <>
      <path d="M20 250 C24 214 56 196 100 194 C144 196 176 214 180 250 Z" fill="#d9661e" />
      <path
        d="M40 250 C52 222 76 210 100 208 C124 210 148 222 160 250"
        fill="none"
        stroke="#e0b23a"
        strokeWidth="4"
      />
      {/* Mace (gada) resting on the shoulder */}
      <path d="M150 250 L168 176" stroke="#8a5a1a" strokeWidth="6" strokeLinecap="round" />
      <circle cx="170" cy="166" r="17" fill="#d9a520" stroke="#a87a10" strokeWidth="1.5" />
      <path d="M154 164 Q170 158 186 164" fill="none" stroke="#a87a10" strokeWidth="2" />
      <path d="M155 172 Q170 178 185 172" fill="none" stroke="#a87a10" strokeWidth="2" />
      <path d="M170 148 l3 -6 l-6 0Z" fill="#a87a10" />
      <g className="p-head">
        <rect x="88" y="158" width="24" height="42" rx="8" fill={s.skinShade} />
        {/* Round ears */}
        <circle cx="52" cy="114" r="13" fill={s.skin} />
        <circle cx="52" cy="114" r="7" fill="#f2cfa4" />
        <circle cx="148" cy="114" r="13" fill={s.skin} />
        <circle cx="148" cy="114" r="7" fill="#f2cfa4" />
        <ellipse cx="100" cy="112" rx="46" ry="54" fill={s.skin} />
        {/* Lighter face and muzzle */}
        <path
          d="M66 112 C66 94 82 90 100 96 C118 90 134 94 134 112 C134 124 124 128 100 126 C76 128 66 124 66 112Z"
          fill="#e9b98a"
        />
        <ellipse cx="100" cy="142" rx="31" ry="25" fill="#f2cfa4" />
        {/* Crown */}
        <path
          d="M60 84 L68 50 L100 26 L132 50 L140 84 Q100 72 60 84Z"
          fill="#d9a520"
          stroke="#a87a10"
          strokeWidth="1.5"
        />
        <path d="M70 70 Q100 60 130 70" fill="none" stroke="#a87a10" strokeWidth="1.5" />
        <circle cx="100" cy="56" r="5.5" fill="#c0392b" stroke="#a87a10" />
        <circle cx="100" cy="30" r="3" fill="#c0392b" />
        {/* Sindoor tilak */}
        <path d="M100 82 V96" stroke="#e2551e" strokeWidth="4" strokeLinecap="round" />
        <Face s={s}>
          <g fill="#6b3a1a">
            <ellipse cx="96" cy="134" rx="2" ry="1.4" />
            <ellipse cx="104" cy="134" rx="2" ry="1.4" />
          </g>
          <path d="M100 136 V144" stroke="#c99a70" strokeWidth="1.4" />
        </Face>
        {/* Kundal earrings */}
        <circle cx="52" cy="132" r="5" fill="none" stroke="#e0b23a" strokeWidth="2.4" />
        <circle cx="148" cy="132" r="5" fill="none" stroke="#e0b23a" strokeWidth="2.4" />
      </g>
    </>
  );
}

/* ---------------- Parvati ---------------- */
function Parvati() {
  const s = STYLES.parvati;
  return (
    <>
      <path
        d="M50 100 C44 150 48 204 58 224 L142 224 C152 204 156 150 150 100 C140 64 60 64 50 100Z"
        fill="#1a1210"
      />
      <path d="M20 250 C24 214 56 196 100 194 C144 196 176 214 180 250 Z" fill="#b3263e" />
      {/* Saree border over the shoulder */}
      <path d="M44 250 C60 224 90 206 120 202" fill="none" stroke="#e0b23a" strokeWidth="6" />
      <path d="M80 196 Q100 214 120 196" fill="none" stroke="#e0b23a" strokeWidth="3" />
      <circle cx="100" cy="207" r="4" fill="#c0392b" stroke="#e0b23a" strokeWidth="1.5" />
      <g className="p-head">
        <HeadBase s={s} ears={false} />
        {/* Hair with centre parting */}
        <path
          d="M54 110 C50 74 74 58 100 58 C126 58 150 74 146 110 C140 88 122 78 100 80 C78 78 60 88 54 110Z"
          fill="#1a1210"
        />
        <path d="M100 60 V79" stroke="#c0392b" strokeWidth="2.2" strokeLinecap="round" />
        {/* Tiara */}
        <path d="M68 74 Q100 54 132 74" fill="none" stroke="#e0b23a" strokeWidth="3" />
        <g fill="#e0b23a">
          <path d="M84 66 l3 -7 l3 6Z" />
          <path d="M97 61 l3 -8 l3 8Z" />
          <path d="M110 65 l3 -6 l3 7Z" />
        </g>
        {/* Jasmine flowers */}
        <g fill="#fbf8f2">
          <circle cx="136" cy="80" r="3" />
          <circle cx="141" cy="86" r="3" />
          <circle cx="144" cy="93" r="3" />
        </g>
        {/* Maang tikka and bindi */}
        <path d="M100 79 V86" stroke="#e0b23a" strokeWidth="1.4" />
        <circle cx="100" cy="88" r="3" fill="#e0b23a" />
        <circle cx="100" cy="97" r="2.4" fill="#c0392b" />
        <Face s={s}>
          <Nose shade={s.skinShade} />
          <circle cx="106" cy="132" r="2.8" fill="none" stroke="#e0b23a" strokeWidth="1.2" />
        </Face>
        {/* Jhumka earrings */}
        <g fill="#e0b23a">
          <circle cx="55" cy="126" r="2.5" />
          <path d="M50 138 Q55 128 60 138Z" />
          <circle cx="145" cy="126" r="2.5" />
          <path d="M140 138 Q145 128 150 138Z" />
        </g>
      </g>
    </>
  );
}

const DRAWINGS: Record<CompanionId, () => ReactNode> = {
  krishna: Krishna,
  shiva: Shiva,
  hanuman: Hanuman,
  parvati: Parvati,
};

export function Portrait({
  companionId,
  className,
}: {
  companionId: CompanionId;
  className?: string;
}) {
  const Drawing = DRAWINGS[companionId];
  return (
    <svg
      viewBox="0 0 200 250"
      className={`portrait ${className ?? ""}`}
      aria-hidden="true"
      focusable="false"
    >
      <g className="p-body">
        <Drawing />
      </g>
    </svg>
  );
}
