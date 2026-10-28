import type { Story } from "../types";

export const MOUNTAIN_UMBRELLA: Story = {
  id: "mountain-umbrella",
  companion: "krishna",
  title: "The Mountain Umbrella",
  blurb: "A great storm comes to Krishna's village. How will he keep everyone dry?",
  source:
    "Retold from the Vishnu Purana, Part 5, Sections 10–13 (H. H. Wilson's public-domain translation, in the Scripture Explorer).",
  adaptation:
    "Shortened and told in simple words for each age. We left out an animal offering at the festival and the calves lost in the flood. The events and their order follow the text.",
  objectives: [
    "Retell a story in order: festival, storm, the mountain lifted, the sun returns.",
    "Talk about thanking the things that care for us: animals, land and rain.",
    "Notice how Krishna sees who is frightened and helps right away.",
    "New words: cowherd, Govardhana, festival, shelter.",
  ],
  scenes: [
    {
      id: "festival",
      art: "krishna-festival",
      alt: "A cowherd village in autumn: huts, cows and garlands, with young Krishna talking to the elders.",
      label: "The festival",
      passages: ["vp-5.10.3"],
      text: {
        "4-5":
          "In the village of Vraja, everyone was busy getting ready for a big festival. Little Krishna asked, “What is this festival for?”",
        "6-9":
          "Autumn came to Vraja, the village of cowherds where young Krishna lived. Everyone was busy preparing a festival for Indra, king of the clouds and rain. Krishna asked the elders, “What is this festival, and why are you so happy about it?”",
        "10-12":
          "When the rainy season ended, Krishna found the cowherds of Vraja preparing a grand offering to Indra, king of the gods and lord of the rain clouds. His foster-father Nanda explained: Indra sends the rain, the rain grows the grass, and the grass feeds the cows that feed everyone.",
      },
      verse: {
        passage: "vp-5.10.3",
        quote: "What festival of Sakra is this, in which you are taking so much delight?",
      },
    },
    {
      id: "thank-the-hill",
      art: "krishna-thank-hill",
      alt: "Villagers bring pots of milk to a green hill while cows wearing flower garlands stand nearby.",
      label: "Thanking the hill",
      passages: ["vp-5.10.4", "vp-5.10.6"],
      text: {
        "4-5":
          "Krishna said, “Our cows and our hill take care of us every day. Let's thank them!” So everyone made a feast and shared it with all their guests.",
        "6-9":
          "Krishna said, “We look after cows. Our cows and Govardhana Hill give us what we need. Let's honour them.” Everyone liked his idea. They brought milk and curds to the hill, fed many guests, and walked around the cows, which wore garlands of flowers.",
        "10-12":
          "Krishna argued that cowherds should honour what really keeps them alive: their cows and Govardhana Hill. The elders agreed. They made offerings to the mountain, fed hundreds of guests, and walked around their garlanded cows.",
      },
      verse: { passage: "vp-5.10.6", quote: "You have judged aright, child" },
    },
    {
      id: "storm",
      art: "krishna-storm",
      alt: "Dark storm clouds and heavy rain over the village; cows stand close together.",
      label: "The storm",
      passages: ["vp-5.11.1", "vp-5.11.2"],
      text: {
        "4-5":
          "But Indra, king of the clouds, was upset. He sent a huge storm with wind and rain. The cows and the people were scared.",
        "6-9":
          "Indra felt left out and became angry. He told the clouds to bring a great storm. Rain poured day and night, the wind roared, and the mother cows kept their calves close.",
        "10-12":
          "Offended at losing his offerings, Indra sent the storm clouds against Vraja. Rain fell without stopping, until sky and earth seemed to blur into one. The herders and their cattle had nowhere to shelter.",
      },
      verse: { passage: "vp-5.11.2", quote: "the earth was filled with darkness" },
    },
    {
      id: "lift",
      art: "krishna-lift",
      alt: "Krishna holds up a whole green hill with one hand like an umbrella; people and cows shelter underneath while rain falls on top.",
      label: "The mountain umbrella",
      passages: ["vp-5.11.3"],
      text: {
        "4-5":
          "Krishna lifted the whole Govardhana Hill with one hand, like a giant umbrella! “Come under here,” he said. “You are safe.”",
        "6-9":
          "Krishna decided to protect his village. He lifted Govardhana Hill with one hand, as easily as if he were playing, and held it up like a huge umbrella. “Come in, everyone, and don't be afraid. The mountain won't fall,” he said.",
        "10-12":
          "Seeing everyone in distress, Krishna decided it was his duty to protect them. He raised Govardhana Hill with one hand, as if in play, and held it over them like an umbrella, calling the people and their cattle to come beneath it without fear.",
      },
      verse: {
        passage: "vp-5.11.3",
        quote: "enter speedily and fear not that the mountain will fall",
      },
    },
    {
      id: "sunshine",
      art: "krishna-sunshine",
      alt: "The sun shines over a clear sky; the hill is back in its place and people walk home with their cows.",
      label: "The sun comes out",
      passages: ["vp-5.11.3", "vp-5.11.4"],
      text: {
        "4-5":
          "Krishna held the hill up for seven days and seven nights. Then the rain stopped and the sun came out! Everyone went home, and Krishna put the hill back.",
        "6-9":
          "For seven days and nights the storm went on, but everyone stayed safe and dry under the hill. At last Indra called back his clouds. The sky cleared, everyone went home, and Krishna put the mountain back in its place.",
        "10-12":
          "For seven days and nights the clouds poured down, but the mountain kept everyone safe. Seeing that the storm could not harm anyone, Indra ordered the clouds to stop. When the sky was clear, the people went home, and Krishna set Govardhana back in its place.",
      },
      verse: { passage: "vp-5.11.3", quote: "For seven days and nights did the vast clouds" },
    },
    {
      id: "friends",
      art: "krishna-friends",
      alt: "A white elephant stands beside the hill while the cowherds gather happily around Krishna.",
      label: "Friends",
      passages: ["vp-5.12.2", "vp-5.13.1"],
      text: {
        "4-5":
          "Indra came on his big white elephant to honour Krishna for keeping the cows safe. And the cowherds told Krishna, “You are our friend!”",
        "6-9":
          "Indra himself came down on his white elephant to honour Krishna for protecting the cows. And the cowherds said to Krishna, “Whoever you are, we respect you, because you are our friend.”",
        "10-12":
          "Indra came on his elephant Airavata to honour Krishna and named him Govinda, protector of the cows. The amazed cowherds told Krishna that, whatever he truly was, they respected him because he was their friend.",
      },
      verse: { passage: "vp-5.13.1", quote: "we should respect thee for thou art our friend" },
    },
  ],
  activities: [
    {
      id: "who-to-thank",
      kind: "picture-choice",
      ages: ["4-5", "6-9", "10-12"],
      after: "thank-the-hill",
      prompt: "Who did Krishna say the villagers should thank?",
      options: [
        { label: "A golden crown", art: "icon-crown" },
        { label: "The cows and the hill", art: "icon-cow-hill" },
        { label: "A big drum", art: "icon-drum" },
      ],
      answer: 1,
      hint: "Think about who gives the village milk and green grass.",
      praise: "Yes! The cows and Govardhana Hill take care of the village every day.",
    },
    {
      id: "how-lifted",
      kind: "question",
      ages: ["4-5", "6-9", "10-12"],
      after: "lift",
      prompt: "How did Krishna hold up the hill?",
      options: ["With a long rope", "With one hand", "On his head"],
      answer: 1,
      hint: "Look at the picture again: what is Krishna holding the hill with?",
      praise: "That's right: with just one hand, as if he were playing.",
    },
    {
      id: "order-little",
      kind: "sequence",
      ages: ["4-5"],
      after: "friends",
      prompt: "Tap the pictures in the order they happened.",
      scenes: ["storm", "lift", "sunshine"],
      praise: "Well done! First the storm, then the mountain umbrella, then the sunshine.",
    },
    {
      id: "order",
      kind: "sequence",
      ages: ["6-9", "10-12"],
      after: "friends",
      prompt: "Tap the pictures in the order they happened.",
      scenes: ["festival", "storm", "lift", "sunshine"],
      praise: "Well done! You remembered the whole story in order.",
    },
    {
      id: "words",
      kind: "match",
      ages: ["6-9", "10-12"],
      after: "friends",
      prompt: "Match each word to what it means.",
      pairs: [
        { left: "Govardhana", right: "The hill Krishna lifted" },
        { left: "Indra", right: "King of the clouds and rain" },
        { left: "Cowherds", right: "People who look after cows" },
      ],
      praise: "Great matching! Now you know three new words.",
    },
  ],
  takeaway: {
    "4-5":
      "When our friends are scared, we can help keep them safe. And we can say thank you to the animals and the land that look after us.",
    "6-9":
      "Krishna noticed who was frightened and helped straight away. We can thank the people, animals and places that care for us, and look after each other when trouble comes.",
    "10-12":
      "Gratitude for what sustains us, and the courage to protect others when it matters. Notice how the story ends in friendship: even Indra comes to honour what was done.",
  },
};
