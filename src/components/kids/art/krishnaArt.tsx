import type { ReactNode } from "react";
import {
  C,
  Cloud,
  Cow,
  Elephant,
  Garland,
  Ground,
  Hill,
  Hut,
  Krishna,
  Person,
  Rain,
  Sun,
} from "./parts";

/** Scenes for "The Mountain Umbrella" (800×450). */
export const KRISHNA_SCENES: Record<string, () => ReactNode> = {
  "krishna-festival": () => (
    <>
      <rect width="800" height="450" fill={C.skyAutumn} />
      <Hill x={600} y={330} w={420} h={170} />
      <Ground />
      <Hut x={150} y={340} />
      <Hut x={290} y={330} s={0.85} />
      <Garland x1={90} x2={340} y={250} />
      <Person x={430} y={400} s={1.05} cloth={C.cloth2} />
      <Person x={490} y={400} s={1.1} skin={C.skinDark} cloth={C.cloth} />
      <Krishna x={570} y={405} s={0.8} arm="wave" />
      <Cow x={690} y={385} s={0.9} flip />
    </>
  ),
  "krishna-thank-hill": () => (
    <>
      <rect width="800" height="450" fill={C.skyAutumn} />
      <Hill x={420} y={340} w={560} h={240} />
      <Ground y={335} />
      <Person x={150} y={420} pot cloth={C.cloth} />
      <Person x={230} y={415} s={0.95} pot skin={C.skinDark} cloth={C.cloth2} />
      <Krishna x={330} y={420} s={0.85} arm="wave" />
      <Cow x={520} y={395} garland />
      <Cow x={660} y={405} garland flip s={0.95} />
    </>
  ),
  "krishna-storm": () => (
    <>
      <rect width="800" height="450" fill={C.skyStorm} />
      <Cloud x={150} y={70} s={1.4} fill={C.stormCloud} />
      <Cloud x={420} y={60} s={1.6} fill={C.stormCloud} />
      <Cloud x={680} y={80} s={1.3} fill={C.stormCloud} />
      <Ground color={C.grassDark} />
      <Rain x1={20} x2={800} y1={110} y2={440} />
      <Hut x={160} y={340} />
      <Cow x={420} y={390} />
      <Cow x={470} y={400} s={0.6} />
      <Cow x={620} y={390} flip />
      <Person x={300} y={410} s={0.9} cloth={C.cloth2} />
    </>
  ),
  "krishna-lift": () => (
    <>
      <rect width="800" height="450" fill={C.skyStorm} />
      <Cloud x={130} y={50} s={1.2} fill={C.stormCloud} />
      <Cloud x={670} y={50} s={1.2} fill={C.stormCloud} />
      <Rain x1={20} x2={800} y1={80} y2={150} />
      {/* The hill, lifted: its flat base rests on Krishna's raised hand. */}
      <Hill x={410} y={232} w={620} h={150} />
      <rect x="100" y="232" width="620" height="10" rx="5" fill={C.earth} />
      <Ground y={360} />
      <Krishna x={398} y={428} s={1.6} arm="up" />
      <Person x={180} y={420} s={0.95} cloth={C.cloth} />
      <Person x={250} y={420} s={0.85} skin={C.skinDark} cloth={C.cloth2} />
      <Cow x={560} y={398} />
      <Cow x={670} y={404} flip s={0.9} />
    </>
  ),
  "krishna-sunshine": () => (
    <>
      <rect width="800" height="450" fill={C.sky} />
      <Sun x={680} y={80} />
      <Cloud x={200} y={80} s={0.8} />
      <Hill x={420} y={340} w={500} h={210} />
      <Ground y={335} />
      <Hut x={110} y={360} s={0.9} />
      <Person x={260} y={420} cloth={C.cloth} arm="wave" />
      <Cow x={360} y={398} s={0.9} />
      <Krishna x={500} y={420} s={0.85} arm="wave" />
      <Cow x={640} y={400} flip />
    </>
  ),
  "krishna-friends": () => (
    <>
      <rect width="800" height="450" fill={C.sky} />
      <Sun x={90} y={70} r={26} />
      <Hill x={560} y={330} w={460} h={170} />
      <Ground />
      <Elephant x={170} y={330} s={1.1} />
      <Person x={380} y={420} cloth={C.cloth2} arm="wave" />
      <Krishna x={460} y={420} s={0.9} arm="wave" />
      <Person x={540} y={420} skin={C.skinDark} cloth={C.cloth} arm="wave" />
      <Cow x={680} y={400} flip garland />
    </>
  ),
};

/** Small pictures for choices (200×200). */
export const KRISHNA_ICONS: Record<string, () => ReactNode> = {
  "icon-crown": () => (
    <path
      d="M40 140 L40 70 L75 105 L100 55 L125 105 L160 70 L160 140 Z"
      fill={C.gold}
      stroke="#9a7420"
      strokeWidth="4"
    />
  ),
  "icon-cow-hill": () => (
    <>
      <Hill x={100} y={130} w={190} h={110} trees={false} />
      <Cow x={95} y={150} s={1.1} />
    </>
  ),
  "icon-drum": () => (
    <>
      <rect x="45" y="70" width="110" height="80" rx="10" fill={C.cloth} />
      <ellipse cx="100" cy="70" rx="55" ry="16" fill="#f3e2c4" stroke="#7a5530" strokeWidth="3" />
      <path
        d="M50 80 L75 145 L100 80 L125 145 L150 80"
        stroke={C.yellow}
        strokeWidth="4"
        fill="none"
      />
    </>
  ),
};
