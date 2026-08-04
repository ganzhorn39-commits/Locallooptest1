import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, Platform, ActivityIndicator, Keyboard, Modal, Switch } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView, KeyboardStickyView } from "react-native-keyboard-controller";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/src/theme/theme";
import { useI18n } from "@/src/i18n";
import { api } from "@/src/api/client";
import { DEFAULT_REGION, CategoryKey } from "@/src/constants/categories";
import LocationPicker from "@/src/components/LocationPicker";
import CategoryWheel from "@/src/components/CategoryWheel";
import TimeWheel from "@/src/components/TimeWheel";
import { pickImage } from "@/src/utils/pickImage";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FREQS: { key: string; label: string }[] = [
  { key: "weekly", label: "Every week" },
  { key: "biweekly", label: "Every two weeks" },
  { key: "monthly", label: "Every month" },
];

const CATEGORY_IMAGES: Record<string, string> = {
  nightlife: "https://images.unsplash.com/photo-1630395822970-acd6a691d97e?crop=entropy&cs=srgb&fm=jpg&q=85",
  rooftop: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?crop=entropy&cs=srgb&fm=jpg&q=85",
  food: "https://images.unsplash.com/photo-1551883738-19ffa3dc4c43?crop=entropy&cs=srgb&fm=jpg&q=85",
  sports: "https://images.unsplash.com/photo-1601564350184-9e93c13df688?crop=entropy&cs=srgb&fm=jpg&q=85",
  arts: "https://images.unsplash.com/photo-1569783721854-33a99b4c0bae?crop=entropy&cs=srgb&fm=jpg&q=85",
  networking: "https://images.unsplash.com/photo-1511578314322-379afb476865?crop=entropy&cs=srgb&fm=jpg&q=85",
  gaming: "https://images.unsplash.com/photo-1542751371-adc38448a05e?crop=entropy&cs=srgb&fm=jpg&q=85",
  outdoor: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?crop=entropy&cs=srgb&fm=jpg&q=85",
  workshops: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?crop=entropy&cs=srgb&fm=jpg&q=85",
  music: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?crop=entropy&cs=srgb&fm=jpg&q=85",
};

function fmtDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

export default function CreateEventScreen({ onDone, showClose }: { onDone: () => void; showClose?: boolean }) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  const todayISO = new Date().toISOString().slice(0, 10);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CategoryKey>("nightlife");
  const [dateISO, setDateISO] = useState(todayISO);
  const [showCal, setShowCal] = useState(false);
  const [hour, setHour] = useState(20);
  const [minute, setMinute] = useState(0);
  const [description, setDescription] = useState("");
  const [instagram, setInstagram] = useState("");
  const [website, setWebsite] = useState("");
  const [tickets, setTickets] = useState("");
  const [reservation, setReservation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [address, setAddress] = useState("");
  const [coord, setCoord] = useState({ latitude: DEFAULT_REGION.latitude, longitude: DEFAULT_REGION.longitude });
  const [banner, setBanner] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [freq, setFreq] = useState("weekly");
  const [days, setDays] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const pickBanner = async () => {
    const res = await pickImage(Platform.OS === "web" ? "library" : "library");
    if ("base64" in res) setBanner(res.base64);
  };

  const toggleDay = (i: number) => setDays((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]));

  const submit = async () => {
    Keyboard.dismiss();
    if (!title.trim()) { setError(t("title_required")); return; }
    setError(""); setSubmitting(true);
    try {
      const when = new Date(dateISO + "T00:00:00");
      when.setHours(hour, minute, 0, 0);
      const timeStr = `${((hour % 12) || 12)}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
      const recLabel = isRecurring && days.length
        ? `${FREQS.find((f) => f.key === freq)?.label} · ${days.map((d) => WEEKDAYS[d]).join(", ")} at ${timeStr}`
        : "";
      await api.createEvent({
        title: title.trim(), category, start_time: when.toISOString(),
        description: description.trim(),
        image_url: banner || CATEGORY_IMAGES[category], banner_url: banner || CATEGORY_IMAGES[category],
        instagram: instagram.trim(), website: website.trim(), tickets_url: tickets.trim(),
        reservation_url: reservation.trim(), capacity: parseInt(capacity, 10) || 0,
        latitude: coord.latitude, longitude: coord.longitude, address: address.trim(),
        is_recurring: isRecurring && days.length > 0, recurrence_freq: freq,
        recurrence_days: isRecurring ? days : [], recurrence_label: recLabel,
      });
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTitle(""); setDescription(""); setInstagram(""); setWebsite(""); setTickets(""); setAddress("");
      onDone();
    } catch {
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(t("create_failed"));
    } finally { setSubmitting(false); }
  };

  const inputStyle = [styles.input, { backgroundColor: colors.surfaceTertiary, color: colors.onSurface, borderColor: colors.border }];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]} testID="create-event-screen">
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
        {showClose ? (
          <Pressable testID="close-add-event" onPress={onDone} style={{ width: 26 }}>
            <Ionicons name="close" size={26} color={colors.onSurface} />
          </Pressable>
        ) : <View style={{ width: 26 }} />}
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>{t("host_event")}</Text>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAwareScrollView style={{ flex: 1 }} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled" bottomOffset={90}>
        <Field label={t("event_banner")} colors={colors}>
          <Pressable testID="pick-banner" onPress={pickBanner} style={[styles.banner, { borderColor: colors.border, backgroundColor: colors.surfaceTertiary }]}>
            {!!banner && <Image source={{ uri: banner }} style={StyleSheet.absoluteFill} contentFit="cover" />}
            <View style={[styles.bannerOverlay, banner ? { backgroundColor: "rgba(0,0,0,0.35)" } : null]}>
              <Ionicons name="image" size={22} color={banner ? "#FFFFFF" : colors.brand} />
              <Text style={[styles.bannerText, { color: banner ? "#FFFFFF" : colors.onSurface }]}>{banner ? t("change_banner") : t("upload_banner")}</Text>
            </View>
          </Pressable>
        </Field>

        <Field label={t("event_title")} colors={colors}>
          <TextInput testID="input-title" value={title} onChangeText={setTitle} placeholder={t("event_title")} placeholderTextColor={colors.onSurfaceTertiary} style={inputStyle} />
        </Field>

        <Field label={t("category")} colors={colors}>
          <CategoryWheel value={category} onChange={setCategory} />
        </Field>

        <Field label={t("date")} colors={colors}>
          <Pressable testID="open-calendar" onPress={() => setShowCal(true)} style={[styles.dateBtn, { backgroundColor: colors.surfaceTertiary, borderColor: colors.border }]}>
            <Ionicons name="calendar" size={18} color={colors.brand} />
            <Text style={[styles.dateText, { color: colors.onSurface }]}>{fmtDate(dateISO)}</Text>
            <Ionicons name="chevron-down" size={18} color={colors.onSurfaceTertiary} style={{ marginLeft: "auto" }} />
          </Pressable>
        </Field>

        <Field label={t("time")} colors={colors}>
          <TimeWheel hour={hour} minute={minute} onChange={(h, m) => { setHour(h); setMinute(m); }} />
        </Field>

        <Field label={t("recurring_q")} colors={colors}>
          <View style={[styles.recurRow, { backgroundColor: colors.surfaceTertiary, borderColor: colors.border }]}>
            <Text style={{ color: colors.onSurface, fontSize: 14, flex: 1, fontWeight: "600" }}>{t("repeat_this")}</Text>
            <Switch testID="recurring-toggle" value={isRecurring} onValueChange={setIsRecurring} trackColor={{ true: colors.brand, false: colors.borderStrong }} />
          </View>
          {isRecurring && (
            <>
              <View style={[styles.catRow, { marginTop: 8 }]}>
                {FREQS.map((f) => {
                  const active = freq === f.key;
                  return (
                    <Pressable key={f.key} testID={`freq-${f.key}`} onPress={() => setFreq(f.key)}
                      style={[styles.catChip, { backgroundColor: active ? colors.brand : colors.surfaceTertiary, borderColor: active ? colors.brand : colors.border }]}>
                      <Text style={[styles.catChipText, { color: active ? "#FFFFFF" : colors.onSurface }]}>{t(`freq_${f.key}`)}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.dayRow}>
                {WEEKDAYS.map((d, i) => {
                  const active = days.includes(i);
                  return (
                    <Pressable key={i} testID={`day-${i}`} onPress={() => toggleDay(i)}
                      style={[styles.dayChip, { backgroundColor: active ? colors.brand : colors.surfaceTertiary, borderColor: active ? colors.brand : colors.border }]}>
                      <Text style={[styles.dayText, { color: active ? "#FFFFFF" : colors.onSurface }]}>{d}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
        </Field>

        <Field label={t("location")} colors={colors}>
          <LocationPicker coord={coord} onChange={setCoord} />
          <TextInput testID="input-address" value={address} onChangeText={setAddress} placeholder={t("venue_ph")} placeholderTextColor={colors.onSurfaceTertiary} style={[inputStyle, { marginTop: 8 }]} />
        </Field>

        <Field label={t("description")} colors={colors}>
          <TextInput testID="input-description" value={description} onChangeText={setDescription} placeholder={t("whats_happening")} placeholderTextColor={colors.onSurfaceTertiary} multiline style={[inputStyle, { height: 90, textAlignVertical: "top", paddingTop: 12 }]} />
        </Field>

        <Field label={t("ig_handle")} colors={colors}>
          <TextInput testID="input-instagram" value={instagram} onChangeText={setInstagram} placeholder="@yourvenue" autoCapitalize="none" placeholderTextColor={colors.onSurfaceTertiary} style={inputStyle} />
        </Field>

        <Field label={t("website")} colors={colors}>
          <TextInput testID="input-website" value={website} onChangeText={setWebsite} placeholder="https://..." autoCapitalize="none" placeholderTextColor={colors.onSurfaceTertiary} style={inputStyle} />
        </Field>

        <Field label={t("ticket_link")} colors={colors}>
          <TextInput testID="input-tickets" value={tickets} onChangeText={setTickets} placeholder="https://tickets..." autoCapitalize="none" placeholderTextColor={colors.onSurfaceTertiary} style={inputStyle} />
        </Field>

        <Field label={t("reservation_link")} colors={colors}>
          <TextInput testID="input-reservation" value={reservation} onChangeText={setReservation} placeholder="https://reserve..." autoCapitalize="none" placeholderTextColor={colors.onSurfaceTertiary} style={inputStyle} />
        </Field>

        <Field label={t("capacity_label")} colors={colors}>
          <TextInput testID="input-capacity" value={capacity} onChangeText={(v) => setCapacity(v.replace(/[^0-9]/g, ""))} placeholder="0 = unlimited" keyboardType="number-pad" placeholderTextColor={colors.onSurfaceTertiary} style={inputStyle} />
        </Field>

        {!!error && <Text style={[styles.error, { color: colors.error }]} testID="form-error">{error}</Text>}
      </KeyboardAwareScrollView>

      <KeyboardStickyView>
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12, borderTopColor: colors.border, backgroundColor: colors.surface }]}>
          <Pressable testID="submit-event" onPress={submit} disabled={submitting} style={[styles.submit, { backgroundColor: colors.brand, opacity: submitting ? 0.7 : 1 }]}>
            {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitText}>{t("publish")}</Text>}
          </Pressable>
        </View>
      </KeyboardStickyView>

      <Modal visible={showCal} transparent animationType="fade" onRequestClose={() => setShowCal(false)}>
        <Pressable style={styles.calBg} onPress={() => setShowCal(false)} testID="calendar-backdrop">
          <Pressable style={[styles.calCard, { backgroundColor: colors.surfaceSecondary }]}>
            <Calendar
              testID="date-calendar"
              minDate={todayISO}
              onDayPress={(d: any) => { setDateISO(d.dateString); setShowCal(false); }}
              markedDates={{ [dateISO]: { selected: true, selectedColor: colors.brand } }}
              theme={{
                calendarBackground: colors.surfaceSecondary,
                dayTextColor: colors.onSurface,
                monthTextColor: colors.onSurface,
                textDisabledColor: colors.onSurfaceTertiary,
                arrowColor: colors.brand,
                todayTextColor: colors.brand,
                selectedDayBackgroundColor: colors.brand,
                selectedDayTextColor: "#FFFFFF",
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
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
  headerTitle: { fontSize: 18, fontWeight: "800" },
  form: { padding: 16, gap: 18, paddingBottom: 40 },
  field: { gap: 8 },
  label: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  input: { height: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 15 },
  catRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, height: 40, borderRadius: 999, borderWidth: 1 },
  catChipText: { fontSize: 14, fontWeight: "600" },
  dateBtn: { flexDirection: "row", alignItems: "center", gap: 10, height: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14 },
  dateText: { fontSize: 15, fontWeight: "600" },
  banner: { height: 130, borderRadius: 12, borderWidth: 1, overflow: "hidden", justifyContent: "flex-end" },
  bannerOverlay: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: "100%" },
  bannerText: { fontSize: 15, fontWeight: "700" },
  recurRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1 },
  dayRow: { flexDirection: "row", gap: 6, marginTop: 8, flexWrap: "wrap" },
  dayChip: { width: 44, height: 40, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  dayText: { fontSize: 13, fontWeight: "700" },
  error: { fontSize: 14, fontWeight: "600" },
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  submit: { height: 54, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  submitText: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  calBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", padding: 24 },
  calCard: { borderRadius: 16, overflow: "hidden", width: "100%", padding: 8 },
});
