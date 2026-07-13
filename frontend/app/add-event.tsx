import React, { useState } from "react";
import {
  View, Text, StyleSheet, Pressable, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/src/theme/theme";
import { api } from "@/src/api/client";
import { CATEGORIES, DEFAULT_REGION, CategoryKey } from "@/src/constants/categories";
import LocationPicker from "@/src/components/LocationPicker";

const DATE_PRESETS = [
  { key: "tonight", label: "Tonight 8PM", get: () => { const d = new Date(); d.setHours(20, 0, 0, 0); return d; } },
  { key: "tomorrow", label: "Tomorrow 7PM", get: () => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(19, 0, 0, 0); return d; } },
  { key: "weekend", label: "Saturday 9PM", get: () => { const d = new Date(); const day = d.getDay(); const add = (6 - day + 7) % 7 || 6; d.setDate(d.getDate() + add); d.setHours(21, 0, 0, 0); return d; } },
  { key: "nextweek", label: "Next week", get: () => { const d = new Date(); d.setDate(d.getDate() + 7); d.setHours(18, 0, 0, 0); return d; } },
];

const CATEGORY_IMAGES: Record<string, string> = {
  nightlife: "https://images.unsplash.com/photo-1630395822970-acd6a691d97e?crop=entropy&cs=srgb&fm=jpg&q=85",
  food: "https://images.unsplash.com/photo-1551883738-19ffa3dc4c43?crop=entropy&cs=srgb&fm=jpg&q=85",
  sports: "https://images.unsplash.com/photo-1601564350184-9e93c13df688?crop=entropy&cs=srgb&fm=jpg&q=85",
  culture: "https://images.unsplash.com/photo-1569783721854-33a99b4c0bae?crop=entropy&cs=srgb&fm=jpg&q=85",
};

export default function AddEvent() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CategoryKey>("nightlife");
  const [datePreset, setDatePreset] = useState("tonight");
  const [description, setDescription] = useState("");
  const [instagram, setInstagram] = useState("");
  const [website, setWebsite] = useState("");
  const [tickets, setTickets] = useState("");
  const [address, setAddress] = useState("");
  const [coord, setCoord] = useState({ latitude: DEFAULT_REGION.latitude, longitude: DEFAULT_REGION.longitude });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    Keyboard.dismiss();
    if (!title.trim()) { setError("Event title is required"); return; }
    setError("");
    setSubmitting(true);
    try {
      const preset = DATE_PRESETS.find((p) => p.key === datePreset)!;
      await api.createEvent({
        title: title.trim(),
        category,
        start_time: preset.get().toISOString(),
        description: description.trim(),
        image_url: CATEGORY_IMAGES[category],
        instagram: instagram.trim(),
        website: website.trim(),
        tickets_url: tickets.trim(),
        latitude: coord.latitude,
        longitude: coord.longitude,
        address: address.trim(),
      });
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e: any) {
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError("Could not create event. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = [styles.input, { backgroundColor: colors.surfaceTertiary, color: colors.onSurface, borderColor: colors.border }];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]} testID="add-event-screen">
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <Pressable testID="close-add-event" onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={26} color={colors.onSurface} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Host an Event</Text>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <Field label="Event Title" colors={colors}>
            <TextInput
              testID="input-title"
              value={title} onChangeText={setTitle}
              placeholder="e.g. Rooftop Summer Party"
              placeholderTextColor={colors.onSurfaceTertiary}
              style={inputStyle}
            />
          </Field>

          <Field label="Category" colors={colors}>
            <View style={styles.catRow}>
              {CATEGORIES.map((c) => {
                const active = category === c.key;
                const col = colors[c.colorKey];
                return (
                  <Pressable
                    key={c.key}
                    testID={`category-${c.key}`}
                    onPress={() => setCategory(c.key)}
                    style={[styles.catChip, { backgroundColor: active ? col : colors.surfaceTertiary, borderColor: active ? col : colors.border }]}
                  >
                    <Ionicons name={c.icon as any} size={15} color={active ? "#FFFFFF" : col} />
                    <Text style={[styles.catChipText, { color: active ? "#FFFFFF" : colors.onSurface }]}>{c.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Field>

          <Field label="Date & Time" colors={colors}>
            <View style={styles.catRow}>
              {DATE_PRESETS.map((p) => {
                const active = datePreset === p.key;
                return (
                  <Pressable
                    key={p.key}
                    testID={`date-${p.key}`}
                    onPress={() => setDatePreset(p.key)}
                    style={[styles.catChip, { backgroundColor: active ? colors.brand : colors.surfaceTertiary, borderColor: active ? colors.brand : colors.border }]}
                  >
                    <Text style={[styles.catChipText, { color: active ? "#FFFFFF" : colors.onSurface }]}>{p.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Field>

          <Field label="Location" colors={colors}>
            <LocationPicker coord={coord} onChange={setCoord} />
            <TextInput
              testID="input-address"
              value={address} onChangeText={setAddress}
              placeholder="Venue name / address (optional)"
              placeholderTextColor={colors.onSurfaceTertiary}
              style={[inputStyle, { marginTop: 8 }]}
            />
          </Field>

          <Field label="Description" colors={colors}>
            <TextInput
              testID="input-description"
              value={description} onChangeText={setDescription}
              placeholder="What's happening?"
              placeholderTextColor={colors.onSurfaceTertiary}
              multiline
              style={[inputStyle, { height: 90, textAlignVertical: "top", paddingTop: 12 }]}
            />
          </Field>

          <Field label="Instagram Handle" colors={colors}>
            <TextInput
              testID="input-instagram"
              value={instagram} onChangeText={setInstagram}
              placeholder="@yourvenue"
              autoCapitalize="none"
              placeholderTextColor={colors.onSurfaceTertiary}
              style={inputStyle}
            />
          </Field>

          <Field label="Website / Homepage" colors={colors}>
            <TextInput
              testID="input-website"
              value={website} onChangeText={setWebsite}
              placeholder="https://..."
              autoCapitalize="none"
              placeholderTextColor={colors.onSurfaceTertiary}
              style={inputStyle}
            />
          </Field>

          <Field label="Ticket Link" colors={colors}>
            <TextInput
              testID="input-tickets"
              value={tickets} onChangeText={setTickets}
              placeholder="https://tickets..."
              autoCapitalize="none"
              placeholderTextColor={colors.onSurfaceTertiary}
              style={inputStyle}
            />
          </Field>

          {!!error && <Text style={[styles.error, { color: colors.error }]} testID="form-error">{error}</Text>}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 12, borderTopColor: colors.border, backgroundColor: colors.surface }]}>
          <Pressable
            testID="submit-event"
            onPress={submit}
            disabled={submitting}
            style={[styles.submit, { backgroundColor: colors.brand, opacity: submitting ? 0.7 : 1 }]}
          >
            {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitText}>Publish Event</Text>}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({ label, colors, children }: any) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.onSurfaceTertiary }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  closeBtn: { width: 26 },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  form: { padding: 16, gap: 18, paddingBottom: 40 },
  field: { gap: 8 },
  label: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  input: { height: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 15 },
  catRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, height: 40, borderRadius: 999, borderWidth: 1 },
  catChipText: { fontSize: 14, fontWeight: "600" },
  error: { fontSize: 14, fontWeight: "600" },
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  submit: { height: 54, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  submitText: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
});
