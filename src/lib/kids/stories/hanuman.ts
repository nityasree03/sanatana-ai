import type { Story } from "../types";

export const GREAT_LEAP: Story = {
  id: "great-leap",
  companion: "hanuman",
  title: "Hanuman's Great Leap",
  blurb: "Hanuman jumps across the whole ocean to find Sita. Who will he meet on the way?",
  source:
    "Retold from the Valmiki Ramayana, Sundara Kanda, Cantos 1, 36, 38, 57 and 65 (Ralph T. H. Griffith's public-domain translation, in the Scripture Explorer).",
  adaptation:
    "Shortened and told in simple words for each age. Between these scenes the text has more adventures that we left out: a fight with the sea-demon Sinhika, Sita's guards and their threats, and the burning of Lanka. The events we tell follow the text in order.",
  objectives: [
    "Retell the journey in order: the leap, the mountain, the sea-giant, Lanka, the ring.",
    "Talk about being brave and polite at the same time.",
    "Notice how Hanuman solves a problem with his wits, not his fists.",
    "New words: Lanka, messenger, token, Mainaka.",
  ],
  scenes: [
    {
      id: "ready",
      art: "hanuman-ready",
      alt: "Hanuman stands on a mountain top above the sea with his hands joined in prayer; the sun is rising.",
      label: "Getting ready",
      passages: ["ram-5.1.17", "ram-5.1.33"],
      text: {
        "4-5":
          "Hanuman needed to find Sita, who had been taken far across the sea. He stood on a mountain and said a little prayer to the Sun and the Wind.",
        "6-9":
          "Sita, the wife of Rama, had been taken away to the island of Lanka, far across the ocean. Hanuman, son of the Wind, climbed a mountain by the sea. Before jumping, he prayed to the Sun and the Wind to help him.",
        "10-12":
          "Sita had been carried off to Lanka by its king, Ravana, and someone had to cross the ocean to find her. Hanuman climbed a mountain on the shore, prayed to Brahma, the Sun, the Wind and Indra for help, and promised his friends he would fly “swift as an arrow” to Lanka.",
      },
      verse: { passage: "ram-5.1.33", quote: "Swift as a shaft from Ráma’s bow" },
    },
    {
      id: "leap",
      art: "hanuman-leap",
      alt: "Hanuman flies through the sky over a wide blue ocean, with flowers drifting down around him.",
      label: "The leap",
      passages: ["ram-5.1.41"],
      text: {
        "4-5":
          "Then — whoosh! Hanuman jumped high into the sky and flew over the big blue sea. Flowers floated down from the sky to cheer him on.",
        "6-9":
          "Hanuman gathered all his strength and sprang from the mountain. His shadow raced across the waves like a sailing ship, and the gods showered flowers to cheer him on.",
        "10-12":
          "Gathering his strength, Hanuman leapt from the mountain so powerfully that trees were pulled along behind him. His shadow skimmed the waves like a ship under full sail, and the gods and sages showered flowers in praise.",
      },
      verse: { passage: "ram-5.1.41", quote: "Sprang downward from the mountain height" },
    },
    {
      id: "mountain",
      art: "hanuman-mountain",
      alt: "A golden mountain rises out of the sea; Hanuman touches its peak gently with one hand as he flies past.",
      label: "The kind mountain",
      passages: ["ram-5.1.93", "ram-5.1.125", "ram-5.1.143"],
      text: {
        "4-5":
          "A kind mountain called Mainaka popped up out of the sea. “Rest on me and eat some fruit!” it said. Hanuman said, “Thank you, but I can't stop now.” He gave the mountain a gentle pat and flew on.",
        "6-9":
          "A golden mountain named Mainaka rose from the sea and said, “Rest here, and eat my sweet fruit.” Hanuman answered, “I must not stop or turn aside, but I'm happy you asked.” He touched the mountain's peak with his hand to say thank you, and flew on.",
        "10-12":
          "Mainaka, a mountain hidden under the sea, rose up to offer Hanuman rest and fruit, as an old debt of kindness to his father, the Wind. Hanuman refused to stop but accepted the kindness: he pressed the mountain's crest lightly with his hand and flew on.",
      },
      verse: { passage: "ram-5.1.125", quote: "I must not stay or turn aside." },
    },
    {
      id: "sea-giant",
      art: "hanuman-surasa",
      alt: "A huge friendly-looking sea-giant opens her mouth wide, while a tiny Hanuman zips out past her.",
      label: "The sea-giant",
      passages: ["ram-5.1.193", "ram-5.1.209"],
      text: {
        "4-5":
          "Next, a giant from the sea opened her mouth wide to block his way. Hanuman made himself big, then very, very tiny! He zipped in and out of her mouth, and she laughed and said, “Off you go. Good luck!”",
        "6-9":
          "The gods sent Surasa, a giant from the sea, to test Hanuman. She opened her mouth to swallow him. Hanuman grew bigger and bigger, and so did her mouth. Then he shrank to the size of a thumb, darted in and out, and smiled. Surasa took her true shape and wished him success.",
        "10-12":
          "To test him, the gods asked Surasa to block his path in a terrifying form. As she stretched her jaws, Hanuman grew larger and larger — then suddenly shrank smaller than a thumb, slipped in and out, and politely said goodbye. Surasa returned to her own form and blessed his mission.",
      },
      verse: { passage: "ram-5.1.209", quote: "Success and joy attend thy way" },
    },
    {
      id: "lanka",
      art: "hanuman-lanka",
      alt: "From a green hilltop by the shore, Hanuman looks at a golden city shining on a mountain across the bay.",
      label: "Lanka",
      passages: ["ram-5.1.273"],
      text: {
        "4-5":
          "At last Hanuman landed on a green island. He saw a golden city, shining on a hill. It was Lanka!",
        "6-9":
          "At last the far shore came into view: green woods, flowers and little streams. Hanuman landed on a hilltop and looked at the city of Lanka, shining on its mountain like a golden crown.",
        "10-12":
          "His long flight nearly over, Hanuman saw a dark line of forest, then the whole green island. He came down on Mount Lamba and looked out at the splendid city of Lanka, shining on its mountain like a crown.",
      },
      verse: { passage: "ram-5.1.273", quote: "Shone on the mountain like a crown" },
    },
    {
      id: "ring",
      art: "hanuman-ring",
      alt: "In a garden of trees with red flowers, Hanuman holds out a small golden ring to Sita.",
      label: "Rama's ring",
      passages: ["ram-5.36.1"],
      text: {
        "4-5":
          "Hanuman found Sita in a quiet garden. He gave her Rama's ring so she would know he was a friend. Sita smiled and cried happy tears.",
        "6-9":
          "Hanuman searched until he found Sita in a garden. At first she was afraid of him. So he gave her Rama's golden ring, with Rama's name on it. Sita held the ring, and her fear turned into happy tears.",
        "10-12":
          "Hanuman found Sita in a grove and gave her a token: Rama's own ring, engraved with his name. Holding it, she felt she was touching Rama's hand, and she called Hanuman a wise, brave and faithful messenger.",
      },
      verse: { passage: "ram-5.36.1", quote: "See, Ráma’s name engraven there" },
    },
    {
      id: "home",
      art: "hanuman-home",
      alt: "Hanuman lands on a hilltop where his friends cheer and offer him fruit; he holds up a sparkling jewel.",
      label: "Good news",
      passages: ["ram-5.38.57", "ram-5.57.39", "ram-5.65.1"],
      text: {
        "4-5":
          "Sita gave Hanuman a sparkly jewel to take back to Rama. Hanuman flew all the way home, and his friends cheered, “Hooray!” He told them, “I found Sita!”",
        "6-9":
          "Sita gave Hanuman a jewel from her hair for Rama. Hanuman leapt back across the sea. His friends jumped and cheered and brought him fruit. “I have seen Sita and spoken with her,” he told them, and he gave Rama the jewel.",
        "10-12":
          "Sita sent back a jewel from her hair as a sign Rama would recognise. Hanuman flew home to his cheering friends, greeted the elders respectfully first, and said simply that he had seen and spoken with Sita. Then he placed the jewel in Rama's hand.",
      },
      verse: {
        passage: "ram-5.57.39",
        quote: "These eyes have seen, These lips addressed, the Maithil queen.",
      },
    },
  ],
  activities: [
    {
      id: "why-not-rest",
      kind: "question",
      ages: ["4-5", "6-9", "10-12"],
      after: "mountain",
      prompt: "Why didn't Hanuman stop to rest on the mountain?",
      options: [
        "He didn't like mountains",
        "He had an important job to finish",
        "He wasn't hungry",
      ],
      answer: 1,
      hint: "Think about why Hanuman was flying over the sea.",
      praise: "Yes! He had to find Sita, so he kept going, and he still said thank you.",
    },
    {
      id: "how-past",
      kind: "picture-choice",
      ages: ["4-5", "6-9", "10-12"],
      after: "sea-giant",
      prompt: "How did Hanuman get past the sea-giant?",
      options: [
        { label: "He sailed in a boat", art: "icon-boat" },
        { label: "He went back home", art: "icon-home" },
        { label: "He made himself tiny", art: "icon-tiny" },
      ],
      answer: 2,
      hint: "Look at the picture: how big is Hanuman?",
      praise: "Clever! He shrank as small as a thumb and zipped right through.",
    },
    {
      id: "token",
      kind: "picture-choice",
      ages: ["4-5", "6-9", "10-12"],
      after: "ring",
      prompt: "What did Hanuman give Sita so she would know he was a friend?",
      options: [
        { label: "A flower", art: "icon-flower" },
        { label: "Rama's ring", art: "icon-ring" },
        { label: "A letter", art: "icon-letter" },
      ],
      answer: 1,
      hint: "It was something Rama used to wear, with his name on it.",
      praise: "That's right: Rama's golden ring, with his name on it.",
    },
    {
      id: "order-little",
      kind: "sequence",
      ages: ["4-5"],
      after: "home",
      prompt: "Tap the pictures in the order they happened.",
      scenes: ["leap", "lanka", "ring"],
      praise: "Well done! The leap, then Lanka, then the ring for Sita.",
    },
    {
      id: "order",
      kind: "sequence",
      ages: ["6-9", "10-12"],
      after: "home",
      prompt: "Tap the pictures in the order they happened.",
      scenes: ["leap", "mountain", "sea-giant", "ring"],
      praise: "Well done! You followed Hanuman's whole journey.",
    },
    {
      id: "words",
      kind: "match",
      ages: ["6-9", "10-12"],
      after: "home",
      prompt: "Match each word to what it means.",
      pairs: [
        { left: "Mainaka", right: "The mountain that offered rest" },
        { left: "Lanka", right: "The island city across the sea" },
        { left: "Son of the Wind", right: "A name for Hanuman" },
      ],
      praise: "Great matching! Hanuman would be proud.",
    },
  ],
  takeaway: {
    "4-5":
      "Hanuman was very strong, and very kind too. He said thank you, he used his clever ideas, and he kept going until his job was done.",
    "6-9":
      "Being brave doesn't mean being rude. Hanuman thanked the mountain, used his wits with the sea-giant, and kept his promise to Rama.",
    "10-12":
      "Courage with humility: Hanuman prayed before he leapt, turned down comfort without giving offence, met a test with cleverness instead of force, and won Sita's trust with honesty.",
  },
};
