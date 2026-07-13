export type CategoryKey = "nightlife" | "food" | "sports" | "culture";

export const CATEGORIES: {
  key: CategoryKey;
  label: string;
  colorKey: "pinNightlife" | "pinFood" | "pinSports" | "pinCulture";
  icon: string;
  emoji: string;
}[] = [
  { key: "nightlife", label: "Nightlife", colorKey: "pinNightlife", icon: "moon", emoji: "🍹" },
  { key: "food", label: "Food", colorKey: "pinFood", icon: "restaurant", emoji: "🍕" },
  { key: "sports", label: "Sports", colorKey: "pinSports", icon: "basketball", emoji: "🏋️" },
  { key: "culture", label: "Culture", colorKey: "pinCulture", icon: "color-palette", emoji: "🎭" },
];

export const categoryColorKey = (cat: string) => {
  const found = CATEGORIES.find((c) => c.key === cat);
  return found ? found.colorKey : "brand";
};

export const categoryMeta = (cat: string) =>
  CATEGORIES.find((c) => c.key === cat) || CATEGORIES[0];

export const DEFAULT_REGION = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.09,
  longitudeDelta: 0.09,
};
