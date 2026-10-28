import type { Story } from "../types";

export const BIG_QUESTION: Story = {
  id: "big-question",
  companion: "shiva",
  title: "Nachiketa's Big Question",
  blurb: "A boy waits three days to ask a wise king one big question. What will he choose?",
  source:
    "Retold from the Katha Upanishad, part 1 (Swami Paramananda's public-domain translation, in the Scripture Explorer).",
  adaptation:
    "Told gently for each age. In the text Yama is the lord of death, and Nachiketa's father, in anger, says he will give his son to Death. For ages 4–5 we call Yama “the wise king of a faraway land” and do not talk about dying; for older children we name Yama as the lord of death. Yama's long teaching is shortened to its first lesson. The events follow the text.",
  objectives: [
    "Retell the story: the gift, the question, the waiting, the three wishes.",
    "Talk about patience and good manners when we have to wait.",
    "Notice that Nachiketa thinks of his father first, and chooses learning over treasure.",
    "New words: boon (a wish someone grants), guest, Yama.",
  ],
  scenes: [
    {
      id: "gift",
      art: "nachiketa-gift",
      alt: "A father hands over some very old, tired cows while his young son Nachiketa watches, thinking.",
      label: "The gift",
      passages: ["katha-1.1.1", "katha-1.1.2", "katha-1.1.3"],
      text: {
        "4-5":
          "Nachiketa's father was giving away his cows as presents. But Nachiketa noticed they were very old and tired cows. “Is that really a kind gift?” he wondered.",
        "6-9":
          "Nachiketa's father was giving away everything he owned to earn a reward in heaven. But young Nachiketa noticed the cows were so old they could no longer eat, drink or give milk. “Gifts like these won't bring any joy,” he thought.",
        "10-12":
          "Vajasravas was giving away all he owned in a great ceremony, hoping for heavenly reward. His young son Nachiketa, filled with faith, saw that the cows being given were worn out, past drinking, eating or giving milk, and reflected that such hollow gifts lead only to joyless places.",
      },
      verse: { passage: "katha-1.1.3", quote: "given milk for the last time" },
    },
    {
      id: "question",
      art: "nachiketa-question",
      alt: "Nachiketa looks up at his father and asks a question; his father turns away with a frown.",
      label: "The question",
      passages: ["katha-1.1.4"],
      text: {
        "4-5":
          "“Father, who will you give me to?” Nachiketa asked. He asked again, and again. His father felt cross and said, “I'll send you to Yama!” Yama was the wise king of a faraway land. So off Nachiketa went.",
        "6-9":
          "“Dear father, to whom will you give me?” Nachiketa asked — once, twice, three times. Annoyed, his father answered, “I will give you to Yama!” Yama was the lord of death. Nachiketa calmly set off for Yama's home.",
        "10-12":
          "Nachiketa asked, “Dear father, to whom will you give me?” He asked a second time, then a third. Angry, his father replied, “I shall give you to Death.” Nachiketa did not argue. He reflected calmly and went to the house of Yama, lord of death.",
      },
      verse: { passage: "katha-1.1.4", quote: "Dear father, to whom wilt thou give me?" },
    },
    {
      id: "waiting",
      art: "nachiketa-waiting",
      alt: "Under a starry sky, Nachiketa sits patiently outside the closed door of a grand, quiet palace.",
      label: "Waiting",
      passages: ["katha-1.1.9"],
      text: {
        "4-5":
          "But King Yama was away! Nachiketa waited by his door, patiently and politely, for three whole nights.",
        "6-9":
          "When Nachiketa arrived, Yama was away. Nachiketa waited patiently at the door for three days and nights, without any food. When Yama came home, he was sorry a guest had waited so long.",
        "10-12":
          "Yama was not at home. Nachiketa waited at his door three nights without food. Returning, Yama greeted him as an honoured guest and, to make up for each night of waiting, offered him three boons.",
      },
      verse: {
        passage: "katha-1.1.9",
        quote: "thou hast remained three nights in my house without food",
      },
    },
    {
      id: "wishes",
      art: "nachiketa-wishes",
      alt: "Yama, a calm king with a crown, gives Nachiketa a colourful garland; a small sacred fire glows between them.",
      label: "Three wishes",
      passages: ["katha-1.1.9", "katha-1.1.10", "katha-1.1.16"],
      text: {
        "4-5":
          "“You waited so nicely,” said Yama. “You can have three wishes!” Nachiketa's first wish was for his father: “Please let my father be happy and not cross with me.”",
        "6-9":
          "“Choose three wishes,” said Yama, “one for each night you waited.” For his first wish Nachiketa asked that his father would stop being angry and welcome him home. For his second, he asked to learn about a sacred fire. Yama was so pleased he gave him a garland of many colours too.",
        "10-12":
          "For his first boon Nachiketa asked that his father be calm, free of anger, and welcome him back. For the second he asked to learn the sacred fire that leads to heaven. Yama taught it, named the fire after Nachiketa, and gave him a garland of many colours.",
      },
      verse: { passage: "katha-1.1.10", quote: "May he lose all anger (towards me)" },
    },
    {
      id: "choice",
      art: "nachiketa-choice",
      alt: "Yama shows Nachiketa piles of gold, horses and musicians; Nachiketa shakes his head and points to a small glowing lamp.",
      label: "Treasure or learning?",
      passages: ["katha-1.1.20", "katha-1.1.23", "katha-1.1.26"],
      text: {
        "4-5":
          "For his third wish, Nachiketa asked a very big question about life. Yama said, “Choose gold and horses and music instead!” But Nachiketa said, “No, thank you. I want to learn the answer.”",
        "6-9":
          "For his third wish, Nachiketa asked: what happens to a person when their life ends? Yama said, “That is too hard. Choose something else: gold, horses, lands, a long life, music!” But Nachiketa said, “Keep your treasures. I only want to understand.”",
        "10-12":
          "For the third boon Nachiketa asked what becomes of a person after death. Yama tried to dissuade him, offering sons, cattle, gold, horses, vast lands and a long life. Nachiketa replied that all these are fleeting: “Keep your chariots, dance and music.” He wanted only the answer.",
      },
      verse: { passage: "katha-1.1.26", quote: "Keep thou thy chariots, dance and music." },
    },
    {
      id: "teacher",
      art: "nachiketa-teacher",
      alt: "Yama and Nachiketa sit together under a tree; Yama is teaching and Nachiketa listens happily.",
      label: "A happy teacher",
      passages: ["katha-1.2.1", "katha-1.2.9"],
      text: {
        "4-5":
          "Yama was very happy. “You chose learning over treasure! I wish all my students were like you,” he said. And he began to teach Nachiketa.",
        "6-9":
          "Yama was delighted. He taught Nachiketa that there are two kinds of choices: the good and the pleasant, and that wise people choose the good. “I wish I always had a student like you,” Yama said.",
        "10-12":
          "Pleased, Yama began to teach: “The good is one thing and the pleasant another,” and the wise choose the good. He praised Nachiketa as fixed in truth, saying, “May we always find a questioner like you.”",
      },
      verse: { passage: "katha-1.2.9", quote: "May we ever, find a questioner like thee." },
    },
  ],
  activities: [
    {
      id: "how-long",
      kind: "question",
      ages: ["4-5", "6-9", "10-12"],
      after: "waiting",
      prompt: "How long did Nachiketa wait at Yama's door?",
      options: ["One hour", "Three nights", "A whole year"],
      answer: 1,
      hint: "That's why Yama gave him three wishes.",
      praise: "Yes! Three nights, so Yama gave him three wishes.",
    },
    {
      id: "what-chose",
      kind: "picture-choice",
      ages: ["4-5", "6-9", "10-12"],
      after: "choice",
      prompt: "What did Nachiketa choose?",
      options: [
        { label: "Gold and horses", art: "icon-gold" },
        { label: "Music and dancing", art: "icon-drum" },
        { label: "Learning the answer", art: "icon-lamp" },
      ],
      answer: 2,
      hint: "He said “No, thank you” to all the treasure.",
      praise: "That's right: he chose to learn. Yama was very happy!",
    },
    {
      id: "order-little",
      kind: "sequence",
      ages: ["4-5"],
      after: "teacher",
      prompt: "Tap the pictures in the order they happened.",
      scenes: ["question", "waiting", "wishes"],
      praise: "Well done! The question, the waiting, then the wishes.",
    },
    {
      id: "order",
      kind: "sequence",
      ages: ["6-9", "10-12"],
      after: "teacher",
      prompt: "Tap the pictures in the order they happened.",
      scenes: ["gift", "waiting", "wishes", "choice"],
      praise: "Well done! You remembered the whole story in order.",
    },
    {
      id: "words",
      kind: "match",
      ages: ["6-9", "10-12"],
      after: "teacher",
      prompt: "Match each word to what it means.",
      pairs: [
        { left: "Boon", right: "A wish someone grants you" },
        { left: "Yama", right: "The king who taught Nachiketa" },
        { left: "Guest", right: "Someone visiting your home" },
      ],
      praise: "Great matching! Nachiketa would be proud.",
    },
  ],
  takeaway: {
    "4-5":
      "Nachiketa was patient and polite, he thought of his father first, and he loved to learn. Asking questions is a wonderful thing!",
    "6-9":
      "Nachiketa waited patiently, wished for his father's happiness first, and chose learning over treasure. A good question can be worth more than gold.",
    "10-12":
      "The good and the pleasant: Nachiketa set aside every comfort to understand what really matters, and his teacher was glad of it. Curiosity, patience and honesty make a true learner.",
  },
};
