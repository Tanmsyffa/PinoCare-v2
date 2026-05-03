export const MOOD_TYPES = {
  capek: {
    label: "Lagi Capek",
    emoji: "😴",
    color: "#B8A9C9",
    description: "Istirahat dulu ya sayang...",
  },
  kangen: {
    label: "Kangen Abang",
    emoji: "💕",
    color: "var(--color-brand-pink)",
    description: "Abang selalu ada buat Dede",
  },
  sedih: {
    label: "Sedih / Bad Mood",
    emoji: "😢",
    color: "#89CFF0",
    description: "Pino peluk Dede ya...",
  },
  stres: {
    label: "Pusing / Stres",
    emoji: "😵‍💫",
    color: "#C3B1E1",
    description: "Tarik napas dulu, Dede...",
  },
} as const;

export type MoodType = keyof typeof MOOD_TYPES;

export const JOURNAL_MOODS = [
  { id: "happy", emoji: "😊", label: "Happy" },
  { id: "sad", emoji: "😢", label: "Sad" },
  { id: "love", emoji: "🥰", label: "Love" },
  { id: "sleepy", emoji: "😴", label: "Sleepy" },
  { id: "angry", emoji: "😤", label: "Angry" },
] as const;

export const DAILY_QUOTES = [
  "Dede itu lebih kuat dari yang dede kiraa💪✨",
  "Setiap hari adalah hadiah. Jangan lupa senyum yaa sayang! 🌸",
  "Dede gak sendirian, ada abang dan pino di sini! 🐻💕",
  "Kalau capek, istirahat dulu. Dunia ga akan ke mana-mana kok 🌙",
  "Dede udah ngelakuin yang terbaik hari inii, Proud of you sayang! 🌟",
  "Satu langkah kecil tetap sebuah kemajuan dede! 🦋",
  "Peluk virtual dari Pino buat kamu! 🤗💝",
  "Jangan lupa mam yaa sayang. Kesehatan dede nomor satu! 🍙",
  "Hari ini mungkin berat, tapi besok pasti lebih baik 🌈",
  "Dede layak bahagia, selalu ingat itu yaa sayangg 💖",
  "Tarik napas dalam-dalam... buang pelan-pelan... 🍃",
  "Dede itu spesial banget buat abangg ⭐",
  "Minum air putih dulu yaa sayang, hidrasi itu penting 💧",
  "Apapun yang terjadi, abang sayang selalu sayangg dede 💗",
  "Senyum dede ituu manis bangettt sayangg 😊",
];

export const MOOD_BOOSTERS = [
  {
    id: 1,
    quote: "dede itu kuat, cantik, dan lucuww 💪",
    color: "from-pink-200 to-rose-300",
  },
  {
    id: 2,
    quote: "besok pasti lebih baik dari hari ini 🌈",
    color: "from-blue-200 to-purple-300",
  },
  {
    id: 3,
    quote: "peluk Pino yang hangat buat dede! 🐻",
    color: "from-amber-200 to-orange-300",
  },
  {
    id: 4,
    quote: "dede punya abang yang selalu support! 💕",
    color: "from-rose-200 to-pink-300",
  },
];

export const CALMING_TIPS = [
  "Minum air putih sayangg",
  "Coba sayang tarik napass (3x)",
  "Dengarin lagu atau scroll aja sayangg",
  "Cari mam atau jajan",
];

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return "mett pagii sayang";
  if (hour >= 11 && hour < 15) return "mett siang sayangg";
  if (hour >= 15 && hour < 18) return "mett sore sayanggg";
  return "mett malam sayangg";
}

export function getRandomQuote(): string {
  return DAILY_QUOTES[Math.floor(Math.random() * DAILY_QUOTES.length)];
}
