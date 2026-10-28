import type { CompanionId } from "@/lib/companions";

export const LEVELS = ["child", "teen", "adult"] as const;
export type Level = (typeof LEVELS)[number];

export const LEVEL_LABEL: Record<Level, string> = {
  child: "Child (read aloud by a grown-up)",
  teen: "Teen",
  adult: "Adult",
};

export interface Topic {
  id: string;
  title: string;
  companion: CompanionId;
  /** Library passages shown in full, in order. */
  passages: string[];
  /** The key line, word for word from one of the passages (checked by a test). */
  key: { passage: string; quote: string };
  /** Our explanations, one per level. */
  explain: Record<Level, string>;
  /** A question to talk about together, one per level. */
  talk: Record<Level, string>;
}

export const TOPICS: Topic[] = [
  {
    id: "friendly-to-all",
    title: "Being friendly to everyone",
    companion: "krishna",
    passages: ["bg-12.13"],
    key: {
      passage: "bg-12.13",
      quote: "He who beareth no ill-will to any being, friendly and compassionate",
    },
    explain: {
      child:
        "Krishna says the people he loves best are friendly and kind to everyone, not just to their best friends. Being kind to someone new, or someone who is different from us, makes the world a warmer place.",
      teen: "In the Gita, Krishna lists the qualities of the people dearest to him, and the first is holding no ill-will toward any being. That's harder than being nice to friends: it includes the classmate who annoys you and people online you'll never meet. It doesn't mean agreeing with everyone; it means not wishing anyone harm.",
      adult:
        "Gita 12.13 opens a list of qualities of the devotee Krishna holds dear: freedom from ill-will toward any being, friendliness, compassion, and evenness in pleasure and pain. The standard is universal goodwill, not universal approval. Families can model the difference: we can disagree firmly, set boundaries, and still refuse contempt.",
    },
    talk: {
      child: "Who is someone you could be friendly to this week?",
      teen: "Is it possible to wish someone well and still not want to be their friend?",
      adult:
        "Where in our family's habits does contempt slip in, and what would goodwill sound like instead?",
    },
  },
  {
    id: "truth",
    title: "Telling the truth",
    companion: "shiva",
    passages: ["hume-mundaka-3.1.6"],
    key: { passage: "hume-mundaka-3.1.6", quote: "Truth alone conquers, not falsehood." },
    explain: {
      child:
        "An old book called the Mundaka Upanishad says that truth wins in the end, not lies. When we tell the truth, even when it's hard, people can trust us.",
      teen: "“Truth alone conquers” (Satyam eva jayate) comes from the Mundaka Upanishad, and it is India's national motto. It doesn't promise that honest people always win in the short term. It says truth is the path that actually leads somewhere, and that lies eventually trap the people who tell them.",
      adult:
        "Mundaka Upanishad 3.1.6 is the source of India's national motto. In context, “truth” is both honest speech and the deeper reality the seeker is trying to reach, and the verse links the two: the path to the highest is built from truthfulness. A useful family question is how we make honesty safe, so that telling the truth about a mistake is met with calm rather than punishment.",
    },
    talk: {
      child: "How do you feel inside after you tell the truth about something hard?",
      teen: "When is it hardest to be honest, and what makes it easier?",
      adult: "Do our reactions make it easier or harder for the children to tell us the truth?",
    },
  },
  {
    id: "kind-words",
    title: "Kind words",
    companion: "krishna",
    passages: ["bg-17.15"],
    key: {
      passage: "bg-17.15",
      quote: "Speech causing no annoyance, truthful, pleasant and beneficial",
    },
    explain: {
      child:
        "Krishna says good words are true, kind and helpful. Before we speak, we can ask: is it true? Is it kind? Will it help?",
      teen: "The Gita calls careful speech a kind of discipline (tapas). Its test has four parts: words that don't hurt needlessly, that are true, pleasant and helpful. Notice it doesn't say ‘only say nice things’: truth comes first, and the skill is saying true things in a way that helps.",
      adult:
        "Gita 17.15 defines “austerity of speech” as speech that causes no distress and is truthful, pleasant and beneficial, together with regular study. All four qualities are held at once, which rules out both cruel honesty and comfortable lies. Families can use it as a pause-check before hard conversations, and adults can model repairing words that missed.",
    },
    talk: {
      child: "Can you think of something true and kind to say to someone at home today?",
      teen: "Think of a time someone told you something true but unkindly. How could they have said it?",
      adult:
        "Which of the four (no distress, true, pleasant, helpful) do we most often skip when we're tired?",
    },
  },
  {
    id: "anger",
    title: "When anger comes",
    companion: "krishna",
    passages: ["bg-2.62", "bg-2.63"],
    key: { passage: "bg-2.63", quote: "From anger proceedeth delusion" },
    explain: {
      child:
        "Krishna explains that when we want something too much and can't have it, we can get angry, and anger makes it hard to think clearly. When we feel angry, we can stop, breathe, and wait until our thinking comes back.",
      teen: "Gita 2.62–63 is like a chain reaction: dwelling on something leads to attachment, attachment to craving, craving (when blocked) to anger, and anger to confusion, until good judgement is lost. The useful part is that every link is a place to step in, often much earlier than the moment we explode.",
      adult:
        "These two verses trace a sequence from attention to attachment, desire, anger, delusion, confused memory and the loss of reason. It reads well as practical psychology: anger is downstream of frustrated wanting, and its main harm is to our own clarity. For families, the point isn't ‘never be angry’ but noticing the chain early and naming it without shame.",
    },
    talk: {
      child: "What helps you calm down when you feel angry?",
      teen: "Next time you get angry, can you spot which link in the chain started it?",
      adult:
        "What do we each do in the moments before we lose our temper, and could we agree on a signal to pause?",
    },
  },
  {
    id: "enough",
    title: "Enough for everyone",
    companion: "shiva",
    passages: ["isa-1"],
    key: { passage: "isa-1", quote: "Do not covet the wealth of any man." },
    explain: {
      child:
        "The Isha Upanishad says everything in the world belongs to God, so we should enjoy what we have and not grab what belongs to others. Sharing feels good, and there is enough to go round.",
      teen: "The first verse of the Isha Upanishad says the whole world is “covered by the Lord”, so enjoy it by letting go, and don't crave anyone else's wealth. It's an old answer to a very modern problem: comparing ourselves with what others have, online and off.",
      adult:
        "Isha 1 joins a view of the world (all of it pervaded by the Lord) to an ethic: enjoy through renunciation, and do not covet. It isn't anti-enjoyment; it locates enjoyment in not grasping. It is worth discussing with teens in the age of constant comparison, and worth practising as a household: what do we already have enough of?",
    },
    talk: {
      child: "What is something you have that you could share?",
      teen: "Which apps or places make you want things you didn't want before?",
      adult: "What would “enough” look like for our family, in money, things and time?",
    },
  },
  {
    id: "keep-going",
    title: "Keep going, stay kind",
    companion: "hanuman",
    passages: ["ram-5.1.125"],
    key: { passage: "ram-5.1.125", quote: "I must not stay or turn aside." },
    explain: {
      child:
        "When Hanuman was flying across the sea, a kind mountain offered him a rest. Hanuman said, “Thank you, but I must keep going.” We can say no to distractions and still be polite.",
      teen: "In the Ramayana, the mountain Mainaka rises to offer Hanuman rest in the middle of his mission. Hanuman refuses, “I must not stay or turn aside”, but touches the mountain to honour the kindness. Focus and graciousness aren't opposites: you can turn down something good to finish something important, without making anyone feel small.",
      adult:
        "Sundara Kanda 1 gives a compact picture of commitment: Hanuman declines a well-meant offer of rest, but accepts the intention by touching the mountain's crest. Many family decisions are like this, a good thing set aside for a more important one, and the way we decline matters as much as the decision.",
    },
    talk: {
      child: "What is something you want to finish, even when it gets tiring?",
      teen: "What “kind mountains” (nice distractions) pull you away from what you're working on?",
      adult: "When we say no to good things, do we also honour the person who offered them?",
    },
  },
  {
    id: "not-giving-up",
    title: "Not giving up",
    companion: "parvati",
    passages: ["kumara-5.15", "kumara-5.89"],
    key: { passage: "kumara-5.89", quote: "That will so strong, so beautifully brave." },
    explain: {
      child:
        "Uma wanted something very much and had to work hard for it for a long, long time. Her mother worried, but Uma kept trying. Her strong heart helped her keep going.",
      teen: "In Kalidasa's poem, Uma takes on years of hard discipline to reach her goal. Her mother begs her to stop; Uma listens with love and keeps going. The poet calls it a will “so strong, so beautifully brave”. Determination isn't stubbornness when it serves something you deeply value and you stay kind to the people who worry about you.",
      adult:
        "Kumarasambhava canto 5 contrasts a mother's protective fear (“Frail is thy body, yet thy vow severe”) with a daughter's resolve. Both are loving. It is a good text for families negotiating a young person's ambitions: how do parents voice real concern without crushing resolve, and how do young people persist without dismissing those who love them?",
    },
    talk: {
      child: "What is something that was hard at first, but you can do now?",
      teen: "When people worry about your goals, how do you want them to tell you?",
      adult:
        "Where are we protecting our children from difficulty they might actually be ready for?",
    },
  },
  {
    id: "asking",
    title: "Asking instead of boasting",
    companion: "parvati",
    passages: ["kena-3.1", "kena-4.1"],
    key: {
      passage: "kena-4.1",
      quote: "It is through the victory of Brahman that ye are victorious.",
    },
    explain: {
      child:
        "The gods said, “We won all by ourselves!” But they couldn't even burn or blow away a tiny piece of straw. Then Uma kindly taught them that a greater power had helped them. It's good to say thank you, and it's good to ask when we don't know.",
      teen: "In the Kena Upanishad, the gods take credit for a victory that wasn't really theirs. Fire and Wind fail a simple test, and only Indra, who stops and asks, learns the answer, from Uma. Success usually rests on things we didn't make ourselves: teachers, family, luck, health. Asking is a strength, not a weakness.",
      adult:
        "Kena 3–4 is a story about misplaced credit: the gods say “this victory is ours”, are humbled by a straw, and are taught by Uma that the victory was Brahman's. It's notable that the teacher here is a goddess and that the one who learns is the one who asks. Families might talk about gratitude in success, and about making it safe to say ‘I don't know’.",
    },
    talk: {
      child: "Who helped you do something you're proud of?",
      teen: "What's a question you've been afraid to ask?",
      adult: "When things go well for us, whom do we forget to credit?",
    },
  },
];

export function getTopic(id: string): Topic | undefined {
  return TOPICS.find((t) => t.id === id);
}
