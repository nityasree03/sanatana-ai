import type { Story } from "../types";

export const BLADE_OF_GRASS: Story = {
  id: "blade-of-grass",
  companion: "parvati",
  title: "Uma and the Piece of Straw",
  blurb: "The gods think they can do anything, until they meet a single piece of straw.",
  source:
    "Retold from the Kena Upanishad, parts 3 and 4 (Swami Paramananda's public-domain translation, in the Scripture Explorer).",
  adaptation:
    "Told in simple words for each age. For younger children we describe Brahman as “the great power behind everything”. Nothing is left out, and the events follow the text.",
  objectives: [
    "Retell the story in order: Fire tries, Wind tries, Indra meets Uma.",
    "Talk about saying thank you instead of “I did it all by myself”.",
    "Notice that asking is wiser than boasting.",
    "New words: Agni (fire), Vayu (wind), Indra, Uma.",
  ],
  scenes: [
    {
      id: "victory",
      art: "uma-victory",
      alt: "The gods stand on a cloud, cheering with their arms raised, under a bright sky.",
      label: "The gods cheer",
      passages: ["kena-3.1"],
      text: {
        "4-5":
          "Once the gods won a big contest. “We did it! We're the best!” they cheered. But they forgot who had really helped them.",
        "6-9":
          "Once the gods won a great victory. It was really the great power behind everything that had won it for them. But the gods puffed up with pride and said, “This victory is ours! This glory is ours!”",
        "10-12":
          "Brahman, the reality behind everything, once won a victory for the gods. But the gods grew proud and claimed it for themselves: “This victory is ours. This glory is ours.”",
      },
      verse: { passage: "kena-3.1", quote: "This victory is ours. This glory is ours." },
    },
    {
      id: "mystery",
      art: "uma-mystery",
      alt: "A soft, shining light appears in the sky; the gods peer at it, puzzled.",
      label: "A strange light",
      passages: ["kena-3.2", "kena-3.3"],
      text: {
        "4-5":
          "Then a strange, shining light appeared. “What is that?” the gods wondered. Nobody knew!",
        "6-9":
          "Then something mysterious appeared before them. The gods didn't know what it was. “Fire,” they said to Agni, the fire-god, “go and find out.”",
        "10-12":
          "Brahman knew their pride and appeared before them as a mysterious presence. The gods could not tell what it was, so they sent Agni, the all-knowing god of fire, to find out.",
      },
      verse: { passage: "kena-3.2", quote: "They did not know what mysterious form it was." },
    },
    {
      id: "fire",
      art: "uma-fire",
      alt: "Agni, the fire-god with flame-coloured hair, puffs at a single piece of straw lying on the ground; it doesn't burn.",
      label: "Fire tries",
      passages: ["kena-3.4", "kena-3.5", "kena-3.6"],
      text: {
        "4-5":
          "Fire went first. “I can burn anything!” he said. The light put down one tiny piece of straw. “Burn this.” Fire tried and tried, but the straw didn't burn at all!",
        "6-9":
          "Agni rushed up. “Who are you?” it asked. “I am Fire! I can burn up everything on earth!” So it placed one piece of straw in front of him. “Burn this.” Agni tried with all his might, but he could not burn it.",
        "10-12":
          "Agni boasted that he could burn up everything on earth. The presence set a single straw before him: “Burn this.” He rushed at it with all his speed but could not burn it, and went back admitting he could not find out what the mystery was.",
      },
      verse: { passage: "kena-3.5", quote: "I can burn up all whatsoever exists on earth." },
    },
    {
      id: "wind",
      art: "uma-wind",
      alt: "Vayu, the wind-god, blows a great swirling gust, but the piece of straw stays perfectly still.",
      label: "Wind tries",
      passages: ["kena-3.7", "kena-3.9", "kena-3.10"],
      text: {
        "4-5":
          "Then Wind went. “I can blow anything away!” he said. Whoooosh! But the little straw didn't move one bit.",
        "6-9":
          "Next the gods sent Vayu, the wind. “I can blow away everything on earth!” he said. “Blow this away,” said the voice, and pointed to the straw. Vayu blew with all his speed, but the straw stayed still.",
        "10-12":
          "Next came Vayu, the wind, who claimed he could blow away everything on earth. Given the same straw, he rushed at it with all his speed but could not move it, and he too returned without an answer.",
      },
      verse: { passage: "kena-3.10", quote: "but was not able to blow it away" },
    },
    {
      id: "uma",
      art: "uma-appears",
      alt: "Against snowy mountains, Uma appears in golden light, beautifully dressed; Indra, wearing a crown, stands before her.",
      label: "Uma appears",
      passages: ["kena-3.11", "kena-3.12"],
      text: {
        "4-5":
          "Then Indra, king of the gods, went to look. The light disappeared! In its place stood Uma, shining like gold, the daughter of the snowy mountains. “Please tell me,” Indra asked, “what was that?”",
        "6-9":
          "Last, the gods sent Indra, their king. But as he came near, the mystery vanished. In its place he saw Uma, glowing golden and beautifully dressed, the daughter of the Himalaya mountains. Indra asked her, “What was that great mystery?”",
        "10-12":
          "Finally Indra, king of the gods, went himself, but the presence vanished before him. In that same space he saw a radiant woman: Uma of golden hue, daughter of the Himalaya. Instead of boasting, Indra asked her what the great mystery was.",
      },
      verse: {
        passage: "kena-3.12",
        quote: "Uma of golden hue, daughter of Haimavat (Himalaya)",
      },
    },
    {
      id: "answer",
      art: "uma-answer",
      alt: "Uma speaks kindly to Indra; behind them the other gods listen, smiling, in soft golden light.",
      label: "Uma's answer",
      passages: ["kena-4.1", "kena-4.3"],
      text: {
        "4-5":
          "Uma smiled. “That was the great power behind everything. It helped you win!” Now the gods understood. They didn't do it all by themselves.",
        "6-9":
          "Uma said, “That was Brahman, the great power behind everything. It was Brahman's victory that made you win.” Then Indra understood. And because he asked, he learned the answer first.",
        "10-12":
          "Uma told him: “It is Brahman. It is through the victory of Brahman that you are victorious.” From her words Indra understood, and the Upanishad says he excelled the other gods because he came nearest and was the first to know.",
      },
      verse: {
        passage: "kena-4.1",
        quote: "It is Brahman. It is through the victory of Brahman that ye are victorious.",
      },
    },
  ],
  activities: [
    {
      id: "what-not-burn",
      kind: "question",
      ages: ["4-5", "6-9", "10-12"],
      after: "fire",
      prompt: "What couldn't Fire burn?",
      options: ["A big forest", "A tiny piece of straw", "A tall mountain"],
      answer: 1,
      hint: "It was something very, very small.",
      praise: "Yes! Just one tiny piece of straw. Surprising, isn't it?",
    },
    {
      id: "who-did-indra-meet",
      kind: "picture-choice",
      ages: ["4-5", "6-9", "10-12"],
      after: "uma",
      prompt: "Who did Indra meet when the light disappeared?",
      options: [
        { label: "A lion", art: "icon-lion" },
        { label: "Uma", art: "icon-uma" },
        { label: "A bird", art: "icon-bird" },
      ],
      answer: 1,
      hint: "She was shining like gold, the daughter of the mountains.",
      praise: "That's right: Uma, the daughter of the Himalaya.",
    },
    {
      id: "order-little",
      kind: "sequence",
      ages: ["4-5"],
      after: "answer",
      prompt: "Tap the pictures in the order they happened.",
      scenes: ["fire", "wind", "uma"],
      praise: "Well done! Fire, then Wind, then Uma.",
    },
    {
      id: "order",
      kind: "sequence",
      ages: ["6-9", "10-12"],
      after: "answer",
      prompt: "Tap the pictures in the order they happened.",
      scenes: ["victory", "fire", "wind", "uma"],
      praise: "Well done! You remembered the whole story in order.",
    },
    {
      id: "words",
      kind: "match",
      ages: ["6-9", "10-12"],
      after: "answer",
      prompt: "Match each name to who it is.",
      pairs: [
        { left: "Agni", right: "The god of fire" },
        { left: "Vayu", right: "The god of wind" },
        { left: "Indra", right: "The king of the gods" },
      ],
      praise: "Great matching! You know the gods of the story.",
    },
  ],
  takeaway: {
    "4-5":
      "Even very strong people get help from others. It's good to say thank you, instead of “I did it all by myself!”",
    "6-9":
      "The gods thought they had won all by themselves. Uma helped them see their strength came from something greater. It's okay not to know, and it's wise to ask.",
    "10-12":
      "Humility: our strengths depend on much more than ourselves. Indra found the answer by asking, not by force, and Uma, the teacher of the story, answered him kindly.",
  },
};
