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
  latitude: 49.0089,
  longitude: 8.4069,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};
