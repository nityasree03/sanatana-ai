import type { ReactNode } from "react";
import { C, Cloud, Cow, Garland, Ground, Hill, Person, Sun } from "./parts";
import {
  C2,
  FireGod,
  Fire,
  FlowerTree,
  Glow,
  GoldPile,
  Hanuman,
  Horse,
  King,
  Lamp,
  Palace,
  Sea,
  SnowPeaks,
  Stars,
  Straw,
  WindGod,
  Woman,
} from "./parts2";

function Petals() {
  return (
    <g>
      {[
        [120, 60],
        [260, 120],
        [380, 40],
        [520, 100],
        [640, 50],
        [720, 140],
        [200, 200],
        [460, 180],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="6" fill={i % 2 ? C.cloth : C.yellow} />
      ))}
    </g>
  );
}

function Bubble({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <g>
      <circle cx={x - 26} cy={y + 46} r="5" fill="#fff" stroke="#9a8f86" />
      <circle cx={x - 14} cy={y + 32} r="8" fill="#fff" stroke="#9a8f86" />
      <ellipse cx={x} cy={y} rx="34" ry="24" fill="#fff" stroke="#9a8f86" strokeWidth="2" />
      <text x={x} y={y + 10} textAnchor="middle" fontSize="28" fontWeight="700" fill={C.ink}>
        {text}
      </text>
    </g>
  );
}

/** A friendly sea-giant: big round eyes, mouth wide open. */
function SeaGiant({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-150 120 Q -160 -90 0 -110 Q 160 -90 150 120 Z" fill="#4f9e8c" />
      <ellipse cx="0" cy="-10" rx="95" ry="70" fill="#7a2f3a" />
      <ellipse cx="0" cy="30" rx="60" ry="22" fill="#c45a6a" />
      <circle cx="-60" cy="-95" r="22" fill="#fff" />
      <circle cx="60" cy="-95" r="22" fill="#fff" />
      <circle cx="-55" cy="-92" r="9" fill={C.ink} />
      <circle cx="55" cy="-92" r="9" fill={C.ink} />
    </g>
  );
}

function Sitting({
  x,
  y,
  s = 1,
  skin = C.skin,
  cloth = C.cloth,
}: {
  x: number;
  y: number;
  s?: number;
  skin?: string;
  cloth?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="-6" rx="30" ry="12" fill={cloth} />
      <path d="M-16 -10 L16 -10 L12 -56 L-12 -56 Z" fill={cloth} />
      <rect x="-19" y="-54" width="7" height="30" rx="3" fill={skin} />
      <rect x="12" y="-54" width="7" height="30" rx="3" fill={skin} />
      <circle cx="0" cy="-68" r="13" fill={skin} />
      <path d="M-13 -72 Q 0 -88 13 -72 Q 6 -80 -13 -72 Z" fill={C.ink} />
    </g>
  );
}

export const MORE_SCENES: Record<string, () => ReactNode> = {
  // ---- Hanuman ----
  "hanuman-ready": () => (
    <>
      <rect width="800" height="450" fill={C.skyAutumn} />
      <Sun x={640} y={300} r={46} />
      <Sea y={300} />
      <Hill x={180} y={320} w={360} h={260} fill={C2.rock} trees={false} />
      <rect x="0" y="318" width="360" height="132" fill={C2.rock} />
      <Hanuman x={180} y={200} s={0.9} pose="pray" />
    </>
  ),
  "hanuman-leap": () => (
    <>
      <rect width="800" height="450" fill={C.sky} />
      <Cloud x={140} y={90} s={0.8} />
      <Cloud x={660} y={70} s={0.9} />
      <Petals />
      <Sea y={330} />
      <Hanuman x={400} y={200} s={1.5} pose="fly" />
      <ellipse cx="380" cy="372" rx="90" ry="10" fill={C.seaDark} opacity="0.6" />
    </>
  ),
  "hanuman-mountain": () => (
    <>
      <rect width="800" height="450" fill={C.sky} />
      <Cloud x={120} y={80} s={0.7} />
      <Sea y={330} />
      <Hill x={520} y={340} w={360} h={330} fill={C2.palace} trees={false} />
      <circle cx="520" cy="96" r="10" fill={C.sun} opacity="0.8" />
      <Hanuman x={440} y={92} s={1.3} pose="fly" />
    </>
  ),
  "hanuman-surasa": () => (
    <>
      <rect width="800" height="450" fill={C.sky} />
      <Sea y={330} />
      <SeaGiant x={400} y={250} />
      <Hanuman x={590} y={190} s={0.45} pose="fly" />
      <path
        d="M520 192 L470 190 M520 202 L480 206"
        stroke="#fff"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </>
  ),
  "hanuman-lanka": () => (
    <>
      <rect width="800" height="450" fill={C.skyAutumn} />
      <Sea y={330} />
      <Hill x={570} y={340} w={420} h={230} fill={C.hill} />
      <Palace x={570} y={180} s={0.7} />
      <circle cx="570" cy="120" r="90" fill={C2.glow} opacity="0.25" />
      <Hill x={110} y={460} w={340} h={260} trees={false} />
      <Hanuman x={120} y={340} s={0.9} />
    </>
  ),
  "hanuman-ring": () => (
    <>
      <rect width="800" height="450" fill={C.sky} />
      <Ground y={320} />
      <FlowerTree x={110} y={340} s={1.2} />
      <FlowerTree x={690} y={330} />
      <Woman x={470} y={420} s={1.15} sari={C2.sari} />
      <Hanuman x={330} y={420} s={1.05} pose="wave" />
      <circle cx="360" cy="312" r="8" fill="none" stroke={C.gold} strokeWidth="5" />
    </>
  ),
  "hanuman-home": () => (
    <>
      <rect width="800" height="450" fill={C.sky} />
      <Sun x={680} y={70} r={30} />
      <Hill x={400} y={470} w={900} h={260} trees={false} />
      <Hanuman x={400} y={360} s={1.1} pose="wave" />
      <circle cx="430" cy="235" r="10" fill="#9fe3f0" stroke="#fff" strokeWidth="3" />
      <Hanuman x={220} y={390} s={0.8} pose="wave" />
      <Hanuman x={590} y={390} s={0.8} pose="wave" />
      <circle cx="300" cy="400" r="10" fill={C.cloth} />
      <circle cx="520" cy="400" r="10" fill={C.yellow} />
    </>
  ),

  // ---- Uma (Kena Upanishad) ----
  "uma-victory": () => (
    <>
      <rect width="800" height="450" fill={C.sky} />
      <Sun x={680} y={70} r={30} />
      <Cloud x={400} y={360} s={4} />
      <FireGod x={260} y={360} s={1.05} />
      <King x={400} y={360} s={1.1} skin={C.skin} cloth={C.gold} arm="wave" />
      <WindGod x={520} y={360} s={1.05} />
    </>
  ),
  "uma-mystery": () => (
    <>
      <rect width="800" height="450" fill={C.sky} />
      <Glow x={560} y={170} r={70} />
      <Cloud x={220} y={380} s={3} />
      <FireGod x={150} y={380} s={0.85} />
      <King x={240} y={380} s={0.9} cloth={C.gold} />
      <WindGod x={320} y={380} s={0.85} />
      <Bubble x={300} y={150} text="?" />
    </>
  ),
  "uma-fire": () => (
    <>
      <rect width="800" height="450" fill={C.skyAutumn} />
      <Glow x={640} y={110} r={50} />
      <Ground y={330} />
      <Straw x={460} y={370} s={1.3} />
      <FireGod x={260} y={410} s={1.2} />
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M320 ${330 + i * 14} q 30 -8 60 0`}
          stroke={C2.fire}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
      ))}
    </>
  ),
  "uma-wind": () => (
    <>
      <rect width="800" height="450" fill={C.sky} />
      <Glow x={640} y={110} r={50} />
      <Ground y={330} />
      <Straw x={520} y={370} s={1.3} />
      <WindGod x={180} y={410} s={1.2} />
    </>
  ),
  "uma-appears": () => (
    <>
      <rect width="800" height="450" fill="#dcebf5" />
      <SnowPeaks y={340} />
      <Ground y={340} color="#c9dcc0" />
      <Woman x={360} y={420} s={1.4} sari={C2.uma} glow />
      <King x={560} y={420} s={1.1} cloth={C.gold} />
    </>
  ),
  "uma-answer": () => (
    <>
      <rect width="800" height="450" fill="#f4ead2" />
      <circle cx="400" cy="200" r="260" fill={C2.glow} opacity="0.35" />
      <Ground y={350} color="#d9cfa8" />
      <Woman x={300} y={420} s={1.3} sari={C2.uma} arm="wave" />
      <King x={460} y={420} s={1.15} cloth={C.gold} />
      <FireGod x={580} y={420} s={0.9} />
      <WindGod x={660} y={420} s={0.9} />
    </>
  ),

  // ---- Nachiketa (Katha Upanishad) ----
  "nachiketa-gift": () => (
    <>
      <rect width="800" height="450" fill={C.skyAutumn} />
      <Ground y={330} />
      <Person x={220} y={420} s={1.15} cloth="#f3efe3" skin={C.skin} arm="wave" />
      <Cow x={380} y={395} fill="#d8d4cc" />
      <Cow x={520} y={400} fill="#d8d4cc" s={0.95} />
      <Person x={660} y={420} s={0.75} cloth={C.cloth2} />
      <Bubble x={700} y={230} text="?" />
    </>
  ),
  "nachiketa-question": () => (
    <>
      <rect width="800" height="450" fill={C.skyAutumn} />
      <Ground y={330} />
      <Person x={330} y={420} s={1.2} cloth="#f3efe3" />
      <Person x={470} y={420} s={0.78} cloth={C.cloth2} arm="wave" />
      <Bubble x={540} y={230} text="?" />
    </>
  ),
  "nachiketa-waiting": () => (
    <>
      <rect width="800" height="450" fill={C2.night} />
      <Stars />
      <circle cx="680" cy="80" r="30" fill="#f4efd6" />
      <Ground y={340} color="#3d5a4a" />
      <Palace x={400} y={345} s={1.6} fill="#5a7a8a" />
      <Sitting x={560} y={410} s={0.8} cloth={C.cloth2} />
    </>
  ),
  "nachiketa-wishes": () => (
    <>
      <rect width="800" height="450" fill="#dfe7ee" />
      <Ground y={340} color="#b9c9a6" />
      <King x={280} y={420} s={1.25} skin={C2.yama} cloth="#7a2f3a" arm="wave" />
      <Fire x={400} y={400} s={1.1} />
      <Person x={520} y={420} s={0.8} cloth={C.cloth2} />
      <Garland x1={500} x2={540} y={352} />
    </>
  ),
  "nachiketa-choice": () => (
    <>
      <rect width="800" height="450" fill="#dfe7ee" />
      <Ground y={340} color="#b9c9a6" />
      <GoldPile x={140} y={380} s={1.4} />
      <Horse x={300} y={360} />
      <rect x="400" y="330" width="60" height="50" rx="8" fill={C.cloth} />
      <Person x={600} y={420} s={0.8} cloth={C.cloth2} arm="wave" />
      <Lamp x={700} y={380} s={1.2} />
    </>
  ),
  "nachiketa-teacher": () => (
    <>
      <rect width="800" height="450" fill={C.sky} />
      <Ground y={330} />
      <FlowerTree x={400} y={340} s={1.5} />
      <Sitting x={300} y={420} s={1.1} skin={C2.yama} cloth="#7a2f3a" />
      <Sitting x={500} y={420} s={0.85} cloth={C.cloth2} />
      <Lamp x={400} y={430} s={0.8} />
    </>
  ),
};

export const MORE_ICONS: Record<string, () => ReactNode> = {
  "icon-boat": () => (
    <>
      <path d="M30 120 L170 120 L145 155 L55 155 Z" fill="#a8753f" />
      <rect x="96" y="45" width="6" height="75" fill="#7a5530" />
      <path d="M102 50 L150 110 L102 110 Z" fill="#f3efe3" />
      <path
        d="M20 165 q 20 -10 40 0 q 20 10 40 0 q 20 -10 40 0 q 20 10 40 0"
        stroke={C.sea}
        strokeWidth="5"
        fill="none"
      />
    </>
  ),
  "icon-home": () => (
    <>
      <rect x="55" y="95" width="90" height="70" fill={C.hut} />
      <path d="M40 98 L100 45 L160 98 Z" fill={C.roof} />
      <rect x="88" y="120" width="24" height="45" fill="#7a5530" />
    </>
  ),
  "icon-tiny": () => (
    <>
      <path d="M60 170 L60 90 Q 60 60 85 60 Q 110 60 110 90 L110 170 Z" fill={C.skin} />
      <ellipse cx="85" cy="74" rx="16" ry="12" fill="#f3d2b3" />
      <Hanuman x={150} y={140} s={0.35} />
    </>
  ),
  "icon-flower": () => (
    <>
      <rect x="96" y="100" width="8" height="80" fill={C.grassDark} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <circle
            key={i}
            cx={100 + Math.cos(a) * 26}
            cy={80 + Math.sin(a) * 26}
            r="18"
            fill={C.cloth}
          />
        );
      })}
      <circle cx="100" cy="80" r="16" fill={C.yellow} />
    </>
  ),
  "icon-ring": () => (
    <>
      <circle cx="100" cy="110" r="48" fill="none" stroke={C.gold} strokeWidth="16" />
      <path d="M85 62 L100 40 L115 62 Z" fill="#9fe3f0" stroke={C.gold} strokeWidth="4" />
    </>
  ),
  "icon-letter": () => (
    <>
      <rect
        x="35"
        y="60"
        width="130"
        height="90"
        rx="6"
        fill="#f3efe3"
        stroke="#9a8f86"
        strokeWidth="4"
      />
      <path d="M35 64 L100 115 L165 64" stroke="#9a8f86" strokeWidth="4" fill="none" />
    </>
  ),
  "icon-lion": () => (
    <>
      <circle cx="100" cy="100" r="62" fill="#c4813b" />
      <circle cx="100" cy="104" r="40" fill="#e7b46a" />
      <circle cx="86" cy="96" r="5" fill={C.ink} />
      <circle cx="114" cy="96" r="5" fill={C.ink} />
      <path d="M92 116 Q 100 124 108 116" stroke={C.ink} strokeWidth="3" fill="none" />
    </>
  ),
  "icon-uma": () => (
    <>
      <circle cx="100" cy="100" r="80" fill={C2.glow} opacity="0.6" />
      <Woman x={100} y={190} s={1.1} sari={C2.uma} />
    </>
  ),
  "icon-bird": () => (
    <>
      <ellipse cx="95" cy="110" rx="50" ry="32" fill={C.cloth2} />
      <circle cx="140" cy="85" r="22" fill={C.cloth2} />
      <path d="M160 85 L180 92 L160 98 Z" fill={C.yellow} />
      <circle cx="145" cy="80" r="4" fill={C.ink} />
      <path d="M60 100 Q 95 60 120 105 Z" fill="#4a7bb5" />
    </>
  ),
  "icon-gold": () => (
    <>
      <GoldPile x={80} y={150} s={1.2} />
      <Horse x={150} y={120} s={0.6} />
    </>
  ),
  "icon-lamp": () => <Lamp x={100} y={150} s={1.8} />,
};
