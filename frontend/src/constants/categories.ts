export type CategoryKey =
  | "sports"
  | "nightlife"
  | "rooftop"
  | "food"
  | "arts"
  | "networking"
  | "gaming"
  | "outdoor"
  | "workshops"
  | "music";

export type CategoryMeta = {
  key: CategoryKey;
  label: string;
  color: string; // vibrant neon hue (no orange)
  icon: string; // Ionicons name
  emoji: string;
  nightlife?: boolean; // age-restricted (18+) tag for alcohol/nightlife
};

export const CATEGORIES: CategoryMeta[] = [
  { key: "sports", label: "Sports & Fitness", color: "#FF4D6D", icon: "barbell", emoji: "🏋️" },
  { key: "nightlife", label: "Nightlife & Clubs", color: "#B15CFF", icon: "disc", emoji: "🪩", nightlife: true },
  { key: "rooftop", label: "Rooftop & Bar", color: "#FF7EB6", icon: "wine", emoji: "🍹", nightlife: true },
  { key: "food", label: "Food & Culinary", color: "#F4C242", icon: "restaurant", emoji: "🍕" },
  { key: "arts", label: "Arts & Culture", color: "#F45CD6", icon: "color-palette", emoji: "🎨" },
  { key: "networking", label: "Networking", color: "#5B8CFF", icon: "briefcase", emoji: "💼" },
  { key: "gaming", label: "Gaming & E-Sports", color: "#22D3EE", icon: "game-controller", emoji: "🎮" },
  { key: "outdoor", label: "Outdoor & Nature", color: "#34D399", icon: "leaf", emoji: "🪵" },
  { key: "workshops", label: "Workshops", color: "#8B95FF", icon: "book", emoji: "📚" },
  { key: "music", label: "Music & Concerts", color: "#C084FC", icon: "musical-notes", emoji: "🎵" },
];

const FALLBACK: CategoryMeta = CATEGORIES[0];

export const categoryMeta = (cat: string): CategoryMeta =>
  CATEGORIES.find((c) => c.key === cat) || FALLBACK;

export const categoryColor = (cat: string): string => categoryMeta(cat).color;

// Categories that are age-restricted (18+) — nightlife / alcohol tagged.
export const isAgeRestricted = (cat: string): boolean => !!categoryMeta(cat).nightlife;

export const DEFAULT_REGION = {
  latitude: 49.0089,
  longitude: 8.4069,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};
