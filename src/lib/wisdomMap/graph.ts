import type { CompanionId } from "@/lib/companions";

/**
 * Wisdom Knowledge Map: people, concepts, places and texts, linked only where a verified passage in
 * the library shows the link. tests/unit/wisdomMap.test.ts reads every evidence passage and checks
 * that it really mentions both ends of the link (by name or alias, or for a text, that the passage
 * comes from it). Descriptions are short notes written for this site, not scripture.
 */

export type NodeType = "person" | "concept" | "place" | "text";

export interface MapNode {
  id: string;
  label: string;
  type: NodeType;
  /** Our own one-line note (not scripture). */
  note: string;
  companions: CompanionId[];
  /** Words that identify this node in a passage (matched as whole words, accents ignored). */
  aliases: string[];
  /** For texts: the library works it covers. */
  works?: string[];
  /** Position in the drawing (0–1000 × 0–720). */
  x: number;
  y: number;
}

export interface MapEdge {
  from: string;
  to: string;
  /** Reads "from <label> to", e.g. "Krishna teaches Arjuna". */
  label: string;
  /** Passage ids that show this link. */
  evidence: string[];
}

export const NODES: MapNode[] = [
  // Texts
  {
    id: "gita",
    label: "Bhagavad Gita",
    type: "text",
    note: "Krishna's teaching to Arjuna on the battlefield.",
    companions: ["krishna"],
    aliases: [],
    works: ["bhagavad-gita", "gita-telang", "gita-arnold"],
    x: 330,
    y: 50,
  },
  {
    id: "katha",
    label: "Katha Upanishad",
    type: "text",
    note: "Nachiketa's dialogue with Death about the Self.",
    companions: ["shiva"],
    aliases: [],
    works: ["katha-upanishad"],
    x: 690,
    y: 50,
  },
  {
    id: "valmiki",
    label: "Valmiki Ramayana",
    type: "text",
    note: "The epic of Rama; the Sundara book follows Hanuman.",
    companions: ["hanuman"],
    aliases: [],
    works: ["valmiki-ramayana", "ramayana-dutt"],
    x: 230,
    y: 690,
  },
  {
    id: "rcm",
    label: "Ramcharitmanas",
    type: "text",
    note: "Tulsidas's devotional retelling of the Rama story.",
    companions: ["hanuman"],
    aliases: [],
    works: ["ramcharitmanas"],
    x: 120,
    y: 590,
  },
  {
    id: "kumara",
    label: "Kumarasambhava",
    type: "text",
    note: "Kalidasa's poem of Uma winning Shiva.",
    companions: ["parvati", "shiva"],
    aliases: [],
    works: ["kumarasambhava"],
    x: 760,
    y: 690,
  },
  {
    id: "devigita",
    label: "Devi Gita",
    type: "text",
    note: "The Goddess teaches the Himalaya about her nature and devotion.",
    companions: ["parvati"],
    aliases: [],
    works: ["devi-gita"],
    x: 905,
    y: 480,
  },
  // People and beings
  {
    id: "krishna",
    label: "Krishna",
    type: "person",
    note: "Arjuna's charioteer and teacher in the Gita.",
    companions: ["krishna"],
    aliases: [
      "krishna",
      "blessed lord",
      "keshava",
      "madhusudana",
      "govinda",
      "hrishikesha",
      "vasudeva",
      "janardana",
    ],
    x: 180,
    y: 130,
  },
  {
    id: "arjuna",
    label: "Arjuna",
    type: "person",
    note: "The warrior who loses heart before the battle.",
    companions: ["krishna"],
    aliases: ["arjuna", "partha", "dhananjaya", "kaunteya", "gudakesha"],
    x: 70,
    y: 260,
  },
  {
    id: "elders",
    label: "Bhishma and Drona",
    type: "person",
    note: "Arjuna's revered elder and teacher, in the opposing army.",
    companions: ["krishna"],
    aliases: ["bhishma", "drona"],
    x: 125,
    y: 400,
  },
  {
    id: "nachiketa",
    label: "Nachiketa",
    type: "person",
    note: "A boy who questions Death.",
    companions: ["shiva"],
    aliases: ["nachiketas", "nachiketa"],
    x: 900,
    y: 150,
  },
  {
    id: "yama",
    label: "Yama (Death)",
    type: "person",
    note: "The lord of death, who becomes Nachiketa's teacher.",
    companions: ["shiva"],
    aliases: ["yama", "death", "ruler of death"],
    x: 760,
    y: 200,
  },
  {
    id: "hanuman",
    label: "Hanuman",
    type: "person",
    note: "Rama's devoted messenger, son of the Wind.",
    companions: ["hanuman"],
    aliases: ["hanuman"],
    x: 240,
    y: 540,
  },
  {
    id: "rama",
    label: "Rama",
    type: "person",
    note: "Prince of Ayodhya, whose wife Sita is taken.",
    companions: ["hanuman"],
    aliases: ["rama"],
    x: 105,
    y: 470,
  },
  {
    id: "sita",
    label: "Sita",
    type: "person",
    note: "Rama's wife, held captive in Lanka.",
    companions: ["hanuman"],
    aliases: ["sita", "maithil", "vaidehi", "janaki"],
    x: 420,
    y: 640,
  },
  {
    id: "ravan",
    label: "Ravan",
    type: "person",
    note: "King of Lanka, who carried Sita away.",
    companions: ["hanuman"],
    aliases: ["ravan", "ravana"],
    x: 520,
    y: 560,
  },
  {
    id: "sugriva",
    label: "Sugriva",
    type: "person",
    note: "King of the Vanaras, Rama's ally.",
    companions: ["hanuman"],
    aliases: ["sugriva"],
    x: 90,
    y: 690,
  },
  {
    id: "uma",
    label: "Uma (Parvati)",
    type: "person",
    note: "Daughter of the Himalaya, who wins Shiva by penance.",
    companions: ["parvati"],
    aliases: ["uma", "parvati"],
    x: 760,
    y: 560,
  },
  {
    id: "shiva",
    label: "Shiva",
    type: "person",
    note: "The great ascetic god.",
    companions: ["shiva", "parvati"],
    aliases: ["siva", "shiva"],
    x: 900,
    y: 600,
  },
  {
    id: "kama",
    label: "Kama (Love)",
    type: "person",
    note: "The god of love, sent to stir Shiva.",
    companions: ["parvati"],
    aliases: ["kama"],
    x: 600,
    y: 650,
  },
  {
    id: "himalaya",
    label: "Himalaya",
    type: "person",
    note: "The mountain king, Uma's father.",
    companions: ["parvati"],
    aliases: ["himalaya", "himalayas", "himavan"],
    x: 880,
    y: 360,
  },
  {
    id: "devi",
    label: "Devi (the Goddess)",
    type: "person",
    note: "The Divine Mother who speaks in the Devi Gita.",
    companions: ["parvati"],
    aliases: ["devi"],
    x: 760,
    y: 420,
  },
  // Places
  {
    id: "lanka",
    label: "Lanka",
    type: "place",
    note: "Ravan's island city across the sea.",
    companions: ["hanuman"],
    aliases: ["lanka"],
    x: 420,
    y: 500,
  },
  // Concepts
  {
    id: "self",
    label: "The Self (Atman)",
    type: "concept",
    note: "What in us is never born and never dies.",
    companions: ["krishna", "shiva", "parvati"],
    aliases: ["the self", "atman", "the soul", "dweller in the body", "my self", "real self"],
    x: 520,
    y: 220,
  },
  {
    id: "brahman",
    label: "Brahman",
    type: "concept",
    note: "The ultimate reality.",
    companions: ["shiva", "parvati"],
    aliases: ["brahman", "para brahma"],
    x: 640,
    y: 320,
  },
  {
    id: "grief",
    label: "Grief",
    type: "concept",
    note: "Sorrow, and how the teachings answer it.",
    companions: ["krishna"],
    aliases: ["grief", "grieve", "grieveth", "grievest"],
    x: 200,
    y: 350,
  },
  {
    id: "action",
    label: "Action without attachment",
    type: "concept",
    note: "Doing what is right without clinging to results.",
    companions: ["krishna"],
    aliases: ["attachment", "fruit of action"],
    x: 330,
    y: 190,
  },
  {
    id: "duty",
    label: "Duty (dharma)",
    type: "concept",
    note: "What is right for one to do.",
    companions: ["krishna", "hanuman"],
    aliases: ["duty", "dharma"],
    x: 300,
    y: 300,
  },
  {
    id: "yoga",
    label: "Yoga",
    type: "concept",
    note: "Union, and the disciplines that lead to it.",
    companions: ["krishna", "parvati"],
    aliases: ["yoga", "yogi"],
    x: 420,
    y: 370,
  },
  {
    id: "devotion",
    label: "Devotion (bhakti)",
    type: "concept",
    note: "Loving worship of the divine.",
    companions: ["krishna", "hanuman", "parvati"],
    aliases: ["devotion", "worship"],
    x: 560,
    y: 430,
  },
  {
    id: "knowledge",
    label: "Wisdom",
    type: "concept",
    note: "Knowledge that frees, as the texts describe it.",
    companions: ["krishna", "shiva"],
    aliases: ["wisdom", "knowledge"],
    x: 640,
    y: 160,
  },
  {
    id: "good",
    label: "The good and the pleasant",
    type: "concept",
    note: "Two different paths a person can choose.",
    companions: ["shiva"],
    aliases: ["the good", "the pleasant"],
    x: 870,
    y: 265,
  },
  {
    id: "penance",
    label: "Penance (tapas)",
    type: "concept",
    note: "Disciplined effort and self-restraint.",
    companions: ["parvati"],
    aliases: ["penance", "tapas"],
    x: 660,
    y: 520,
  },
];

export const EDGES: MapEdge[] = [
  // Bhagavad Gita
  { from: "krishna", to: "arjuna", label: "teaches", evidence: ["bg-2.2", "bg-2.55"] },
  { from: "arjuna", to: "grief", label: "is overcome by", evidence: ["bg-1.47"] },
  { from: "arjuna", to: "elders", label: "cannot bear to fight", evidence: ["bg-2.4"] },
  { from: "krishna", to: "self", label: "teaches about", evidence: ["bg-2.55"] },
  { from: "self", to: "grief", label: "is no cause for", evidence: ["bg-2.30"] },
  { from: "krishna", to: "action", label: "teaches", evidence: ["bg-6.1"] },
  { from: "action", to: "duty", label: "is how to do one's", evidence: ["bg-3.19"] },
  { from: "action", to: "yoga", label: "is the way of the", evidence: ["bg-6.1"] },
  { from: "krishna", to: "devotion", label: "welcomes", evidence: ["bg-12.2"] },
  { from: "devotion", to: "yoga", label: "is itself a", evidence: ["bg-14.26"] },
  { from: "knowledge", to: "self", label: "is knowledge of", evidence: ["bg-5.16"] },
  { from: "krishna", to: "gita", label: "speaks in", evidence: ["bg-2.2"] },
  { from: "arjuna", to: "gita", label: "listens in", evidence: ["bg-1.47"] },
  // Katha Upanishad
  { from: "yama", to: "nachiketa", label: "teaches", evidence: ["katha-2.3.18"] },
  { from: "nachiketa", to: "knowledge", label: "longs for", evidence: ["katha-1.2.4"] },
  { from: "yama", to: "self", label: "reveals what happens to", evidence: ["katha-2.2.6"] },
  { from: "self", to: "brahman", label: "is taught together with", evidence: ["katha-2.2.6"] },
  { from: "yama", to: "good", label: "distinguishes", evidence: ["katha-1.2.1"] },
  { from: "nachiketa", to: "katha", label: "questions Death in", evidence: ["katha-1.1.29"] },
  { from: "self", to: "katha", label: "is the theme of", evidence: ["katha-2.2.6"] },
  // Ramayana
  { from: "hanuman", to: "rama", label: "serves", evidence: ["ram-5.1.57"] },
  { from: "hanuman", to: "sugriva", label: "is sent by", evidence: ["ram-5.51.1"] },
  { from: "hanuman", to: "sita", label: "searches for and finds", evidence: ["ram-5.51.1"] },
  { from: "ravan", to: "sita", label: "carried off", evidence: ["ram-5.1.175"] },
  { from: "hanuman", to: "lanka", label: "sets fire to", evidence: ["ram-5.55.39"] },
  { from: "rama", to: "sita", label: "is husband of", evidence: ["ram-5.33.37"] },
  { from: "hanuman", to: "valmiki", label: "leaps the ocean in", evidence: ["ram-5.1.57"] },
  { from: "hanuman", to: "rcm", label: "appears in", evidence: ["rcm-4.5"] },
  { from: "hanuman", to: "duty", label: "reminds Ravan of", evidence: ["ram-5.51.1"] },
  // Kumarasambhava and Devi Gita
  { from: "uma", to: "penance", label: "undertakes", evidence: ["kumara-5.89"] },
  {
    from: "uma",
    to: "shiva",
    label: "wins as her husband",
    evidence: ["kumara-3.255", "kumara-6.1"],
  },
  { from: "shiva", to: "kama", label: "destroys", evidence: ["kumara-5.251"] },
  { from: "kama", to: "uma", label: "is sent to where he will find", evidence: ["kumara-3.73"] },
  { from: "uma", to: "himalaya", label: "is daughter of", evidence: ["kumara-6.1"] },
  { from: "uma", to: "kumara", label: "is the heroine of", evidence: ["kumara-5.89"] },
  { from: "devi", to: "himalaya", label: "teaches", evidence: ["devi-7.36.1-4.1"] },
  { from: "devi", to: "devotion", label: "asks for", evidence: ["devi-7.36.1-4.1"] },
  { from: "devi", to: "yoga", label: "teaches", evidence: ["devi-7.36.1-4.1"] },
  { from: "devi", to: "self", label: "describes her own", evidence: ["devi-7.32.1-50.1"] },
  { from: "devi", to: "brahman", label: "names herself", evidence: ["devi-7.32.1-50.1"] },
  { from: "devi", to: "devigita", label: "speaks in", evidence: ["devi-7.32.1-50.1"] },
];

export function nodeById(id: string): MapNode | undefined {
  return NODES.find((n) => n.id === id);
}

/** Fold accents and case, so "Hanumán" matches "hanuman". */
export function fold(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

/** Does this passage mention the node (or, for a text, come from it)? */
export function passageMentions(
  node: MapNode,
  passage: { work_id: string; translation: { text: string } },
): boolean {
  if (node.type === "text") return (node.works ?? []).includes(passage.work_id);
  const t = fold(passage.translation.text);
  return node.aliases.some((a) =>
    new RegExp(`(^|[^a-z])${fold(a).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`).test(t),
  );
}
