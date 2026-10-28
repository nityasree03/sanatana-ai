import type { CompanionId } from "@/lib/companions";

/** A word worth knowing. `meaning` is our own short note, not scripture. */
export interface KeyTerm {
  term: string;
  /** Devanagari as it appears inside one of the lesson's verses (checked by a test). */
  devanagari?: string;
  meaning: string;
}

export interface Question {
  id: string;
  prompt: string;
  options: string[];
  /** Index into `options`. */
  answer: number;
  /** The line of the verse that answers it: `quote` appears word for word in `passage`. */
  support: { passage: string; quote: string };
  /** Our short explanation, shown after answering. */
  explain: string;
}

export interface Lesson {
  id: string;
  companion: CompanionId;
  title: string;
  /** One or two sentences in our own words; labelled as our note on the page. */
  summary: string;
  /** Passage ids in reading order. */
  passages: string[];
  terms: KeyTerm[];
  questions: Question[];
}

export const LESSONS: Lesson[] = [
  {
    id: "action-without-clinging",
    companion: "krishna",
    title: "Action without clinging",
    summary:
      "Krishna tells Arjuna to act fully while letting go of the craving for results, and to stay even-minded in success and failure.",
    passages: ["bg-2.47", "bg-2.48", "bg-3.19"],
    terms: [
      { term: "karma", devanagari: "कर्म", meaning: "Action; here, the work in front of you." },
      { term: "phala", devanagari: "फल", meaning: "Fruit; the results an action brings." },
      { term: "sanga", devanagari: "सङ्ग", meaning: "Clinging or attachment." },
      {
        term: "samatva",
        devanagari: "समत्वं",
        meaning: "Evenness; staying balanced whatever happens.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "According to Gita 2.47, where does our concern rightly lie?",
        options: [
          "With the action only, not its fruits",
          "With the fruits, not the action",
          "With neither action nor fruits",
        ],
        answer: 0,
        support: {
          passage: "bg-2.47",
          quote: "Thy business is with the action only, never with its fruits",
        },
        explain: "The verse places our part in the doing; the results are not ours to grip.",
      },
      {
        id: "q2",
        prompt: "Does 2.47 suggest that giving up action is the answer?",
        options: [
          "Yes, stop acting to avoid wanting results",
          "No, it warns against clinging to inaction too",
          "It does not mention inaction",
        ],
        answer: 1,
        support: { passage: "bg-2.47", quote: "nor be thou to inaction attached" },
        explain: "Letting go of results is not the same as doing nothing.",
      },
      {
        id: "q3",
        prompt: "What does Gita 2.48 call yoga?",
        options: ["Long meditation", "Equilibrium", "Giving away possessions"],
        answer: 1,
        support: { passage: "bg-2.48", quote: "equilibrium is called yoga" },
        explain: "Here yoga means staying balanced in success and failure.",
      },
    ],
  },
  {
    id: "the-self-never-born",
    companion: "krishna",
    title: "The Self that is never born",
    summary:
      "To a grieving Arjuna, Krishna describes the Self as unborn and undying, changing bodies the way a person changes clothes.",
    passages: ["bg-2.13", "bg-2.20", "bg-2.22"],
    terms: [
      { term: "dehi", devanagari: "देही", meaning: "The one who dwells in the body." },
      { term: "nitya", devanagari: "नित्यः", meaning: "Eternal; always existing." },
      { term: "dhira", devanagari: "धीर", meaning: "Steadfast; calm and wise." },
    ],
    questions: [
      {
        id: "q1",
        prompt: "What image does Gita 2.22 use for taking on a new body?",
        options: [
          "A river reaching the sea",
          "A seed becoming a tree",
          "Casting off worn-out garments for new ones",
        ],
        answer: 2,
        support: {
          passage: "bg-2.22",
          quote: "casting off worn-out garments, taketh new ones",
        },
        explain: "The body changes the way clothes do; the wearer continues.",
      },
      {
        id: "q2",
        prompt: "According to Gita 2.20, what happens to the Self when the body is killed?",
        options: ["It is not slain", "It dies with the body", "It is reborn immediately as a god"],
        answer: 0,
        support: { passage: "bg-2.20", quote: "he is not slain when the body is slaughtered" },
        explain: "The verse describes the Self as unborn, eternal and untouched by death.",
      },
      {
        id: "q3",
        prompt: "How does the steadfast one respond to these changes, in 2.13?",
        options: ["With fear", "Does not grieve", "With anger"],
        answer: 1,
        support: { passage: "bg-2.13", quote: "the steadfast one grieveth not thereat" },
        explain: "Seeing change clearly frees the steadfast person from grief.",
      },
    ],
  },
  {
    id: "nachiketa-three-boons",
    companion: "shiva",
    title: "Nachiketa's three boons",
    summary:
      "A boy waits three nights at Death's door. Offered three boons, he asks first for his father's peace, and finally refuses every pleasure until he learns what lies beyond death.",
    passages: ["katha-1.1.9", "katha-1.1.10", "katha-1.1.20", "katha-1.1.23", "katha-1.1.29"],
    terms: [
      { term: "vara", devanagari: "वर", meaning: "A boon; a gift granted on request." },
      { term: "atithi", meaning: "A guest, to be honoured." },
      { term: "mrityu", devanagari: "मृत्यो", meaning: "Death; here, Yama addressed by name." },
      { term: "vichikitsa", devanagari: "विचिकित्सा", meaning: "Doubt; an open question." },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Why does Yama offer Nachiketa three boons?",
        options: [
          "Nachiketa defeated him in debate",
          "Nachiketa stayed three nights in his house without food",
          "Nachiketa's father asked him to",
        ],
        answer: 1,
        support: {
          passage: "katha-1.1.9",
          quote: "thou hast remained three nights in my house without food",
        },
        explain: "A guest left unfed must be honoured; one boon for each night.",
      },
      {
        id: "q2",
        prompt: "What does Nachiketa ask for first?",
        options: [
          "Wealth and long life",
          "Knowledge of the heavenly fire",
          "That his father be free of anger and at peace",
        ],
        answer: 2,
        support: { passage: "katha-1.1.10", quote: "May he lose all anger (towards me)" },
        explain: "His first thought is for his father, not himself.",
      },
      {
        id: "q3",
        prompt: "When Yama offers sons, cattle, gold and lands instead, what does Nachiketa do?",
        options: [
          "He accepts the wealth",
          "He asks for no other boon than the hidden secret",
          "He asks for a shorter life",
        ],
        answer: 1,
        support: {
          passage: "katha-1.1.29",
          quote: "Nachiketas asks for no other boon than that which penetrates this hidden secret",
        },
        explain: "He holds to the question that matters most and turns down every distraction.",
      },
    ],
  },
  {
    id: "isha-lord-in-everything",
    companion: "shiva",
    title: "Isha: the Lord in everything",
    summary:
      "The Isha Upanishad asks us to see the Lord in all that exists, to live by right action, and to see all beings in the Self.",
    passages: ["isa-1", "isa-2", "isa-6", "isa-7"],
    terms: [
      { term: "isha", devanagari: "ईशा", meaning: "The Lord, who pervades everything." },
      { term: "tyakta", devanagari: "त्यक्तेन", meaning: "Through letting go; by renouncing." },
      { term: "ekatva", devanagari: "एकत्व", meaning: "Oneness." },
      { term: "shoka", devanagari: "शोक", meaning: "Grief." },
    ],
    questions: [
      {
        id: "q1",
        prompt: "What does Isha 1 warn against?",
        options: ["Coveting anyone's wealth", "Living a long life", "Enjoying anything at all"],
        answer: 0,
        support: { passage: "isa-1", quote: "Do not covet the wealth of any man" },
        explain: "Seeing everything as the Lord's loosens the urge to grab.",
      },
      {
        id: "q2",
        prompt: "According to Isha 2, how should one wish to live a hundred years?",
        options: ["In a forest, without work", "Performing righteous deeds", "Seeking fame"],
        answer: 1,
        support: {
          passage: "isa-2",
          quote: "one should live performing Karma (righteous deeds)",
        },
        explain: "The Upanishad does not ask us to quit the world, but to act rightly in it.",
      },
      {
        id: "q3",
        prompt: "For one who sees oneness everywhere, what does Isha 7 say is absent?",
        options: ["Joy and love", "Work and duty", "Delusion and grief"],
        answer: 2,
        support: { passage: "isa-7", quote: "how can there be delusion or grief" },
        explain: "Seeing all beings as the Self leaves no room for delusion or grief.",
      },
    ],
  },
  {
    id: "hanuman-leap",
    companion: "hanuman",
    title: "Hanuman's leap: courage and humility",
    summary:
      "Before crossing the sea, Hanuman prays for help. Mid-flight, a mountain offers him rest; he thanks it warmly but keeps going.",
    passages: ["ram-5.1.17", "ram-5.1.33", "ram-5.1.125", "ram-5.1.143"],
    terms: [
      { term: "Vanar", meaning: "Hanuman's forest people, often translated as monkeys." },
      { term: "Mainaka", meaning: "The mountain under the sea that rises to offer him rest." },
      { term: "Son of the Wind", meaning: "A name for Hanuman; Vayu, the Wind, is his father." },
    ],
    questions: [
      {
        id: "q1",
        prompt: "What does Hanuman do before he leaps?",
        options: [
          "Boasts of his strength",
          "Prays to Svayambhu, the Sun, the Wind and Indra",
          "Waits for Rama's permission",
        ],
        answer: 1,
        support: { passage: "ram-5.1.17", quote: "Svayambhu and the Sun he prayed" },
        explain: "Great strength, but he still asks for help before the task.",
      },
      {
        id: "q2",
        prompt: "How does Hanuman answer Mainaka's offer of rest and fruit?",
        options: [
          "He accepts and rests a while",
          "He ignores the mountain",
          "He declines to stop, but thanks the mountain",
        ],
        answer: 2,
        support: { passage: "ram-5.1.125", quote: "“I may not rest,” the Vánar cried" },
        explain: "He keeps to his mission and is still gracious about the kindness.",
      },
      {
        id: "q3",
        prompt: "How does he honour the mountain before flying on?",
        options: [
          "He lightly presses its crest with his hand",
          "He eats one of its fruits",
          "He promises to return",
        ],
        answer: 0,
        support: {
          passage: "ram-5.1.143",
          quote: "he lightly pressed\nWith his broad hand the mountain’s crest",
        },
        explain: "A small gesture accepts the gift without breaking his journey.",
      },
    ],
  },
  {
    id: "ramas-ring",
    companion: "hanuman",
    title: "Rama's ring: earning trust",
    summary:
      "Sita, a captive in Lanka, first fears Hanuman is a dream or a trick. He gives her Rama's ring and speaks honestly about what Rama does and does not yet know.",
    passages: ["ram-5.32.1", "ram-5.36.1", "ram-5.36.33"],
    terms: [
      { term: "Maithil lady", meaning: "Sita, princess of Mithila." },
      { term: "token", meaning: "A sign that proves who sent a messenger." },
    ],
    questions: [
      {
        id: "q1",
        prompt: "How does Sita first react when she sees Hanuman?",
        options: ["She weeps in fear", "She greets him as a friend", "She calls the guards"],
        answer: 0,
        support: { passage: "ram-5.32.1", quote: "Wept bitter tears in wild affright" },
        explain: "Trust has to be earned; Hanuman does not rush her.",
      },
      {
        id: "q2",
        prompt: "What proves that Hanuman truly comes from Rama?",
        options: ["A letter", "His golden ring with Rama's name on it", "A lock of Rama's hair"],
        answer: 1,
        support: { passage: "ram-5.36.1", quote: "See, Ráma’s name engraven there" },
        explain: "The ring is a sure token, and her fear turns to tears of joy.",
      },
      {
        id: "q3",
        prompt: "When Sita asks why Rama has not come, what does Hanuman tell her?",
        options: [
          "Rama has forgotten her",
          "Rama is already at the gates",
          "Rama has not yet learnt where she is",
        ],
        answer: 2,
        support: { passage: "ram-5.36.33", quote: "Not yet has Ráma learnt where lies" },
        explain: "He answers truthfully instead of offering false comfort.",
      },
    ],
  },
  {
    id: "umas-resolve",
    companion: "parvati",
    title: "Uma's resolve",
    summary:
      "Uma sets out to win Shiva through penance. Her mother fears for her, but her will holds, and in the end Shiva himself bows to her devotion.",
    passages: ["kumara-5.7", "kumara-5.15", "kumara-5.89", "kumara-5.403"],
    terms: [
      { term: "tapas (penance)", meaning: "Disciplined effort and self-denial for a high aim." },
      { term: "Uma", meaning: "A name of Parvati, daughter of the Himalaya." },
    ],
    questions: [
      {
        id: "q1",
        prompt: "What does Uma believe will win Shiva's heart?",
        options: ["Her beauty", "Penance", "Her father's wealth"],
        answer: 1,
        support: { passage: "kumara-5.7", quote: "Penance, long penance: for that power alone" },
        explain: "She chooses the hardest path because she believes only it will work.",
      },
      {
        id: "q2",
        prompt: "What worries Uma's mother?",
        options: [
          "That Uma is frail but her vow is severe",
          "That Shiva is too poor",
          "That Uma will leave home forever",
        ],
        answer: 0,
        support: { passage: "kumara-5.15", quote: "Frail is thy body, yet thy vow severe" },
        explain: "Love makes her mother afraid; it does not change Uma's mind.",
      },
      {
        id: "q3",
        prompt: "What wins Shiva in the end?",
        options: ["A gift from the gods", "Her penance and holy vows", "Her mother's prayers"],
        answer: 1,
        support: { passage: "kumara-5.403", quote: "Won by thy penance, and thy holy vows" },
        explain: "Her steady effort, not luck, brings the reward.",
      },
    ],
  },
  {
    id: "uma-and-the-mystery",
    companion: "parvati",
    title: "Uma and the great mystery",
    summary:
      "The gods take credit for a victory. A mysterious being humbles Fire and Wind; then Uma appears to Indra and tells him the victory was Brahman's.",
    passages: ["kena-3.1", "kena-3.6", "kena-3.12", "kena-4.1"],
    terms: [
      { term: "Brahman", devanagari: "ब्रह्म", meaning: "The ultimate reality behind everything." },
      { term: "yaksha", devanagari: "यक्ष", meaning: "A mysterious spirit or wonder." },
      {
        term: "Haimavati",
        devanagari: "हैमवतीं",
        meaning: "Daughter of the Himalaya; a name of Uma.",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "What mistake do the gods make after the victory?",
        options: [
          "They think the victory and glory are their own",
          "They forget to thank Indra",
          "They refuse to fight again",
        ],
        answer: 0,
        support: { passage: "kena-3.1", quote: "This victory is ours. This glory is ours." },
        explain: "Pride takes credit for what came from a greater source.",
      },
      {
        id: "q2",
        prompt: "What can Agni, the Fire-god, not do?",
        options: ["Find the gods", "Burn a single straw", "Speak to Brahman"],
        answer: 1,
        support: { passage: "kena-3.6", quote: "was not able to burn it" },
        explain: "Without Brahman's power, even Fire cannot burn a straw.",
      },
      {
        id: "q3",
        prompt: "What does Uma tell Indra?",
        options: [
          "That the gods won by their own strength",
          "That the being was a demon",
          "That it is Brahman, and the victory was Brahman's",
        ],
        answer: 2,
        support: {
          passage: "kena-4.1",
          quote: "It is Brahman. It is through the victory of Brahman that ye are victorious.",
        },
        explain: "Uma is the teacher here: she reveals what the gods could not see.",
      },
    ],
  },
];

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

/** Collapse whitespace so a quote can span the line breaks of verse. */
export function normalise(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
