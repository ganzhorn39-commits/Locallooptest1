import React, { useEffect, useMemo, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { useTheme } from "@/src/theme/theme";
import { useI18n } from "@/src/i18n";

const ITEM_H = 44;
const VISIBLE = 5;
const PAD = ((VISIBLE - 1) / 2) * ITEM_H;

const MONTHS: Record<string, string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  de: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
};

function WheelColumn({ items, index, onIndexChange, width, testID }: { items: string[]; index: number; onIndexChange: (i: number) => void; width: number; testID?: string }) {
  const { colors } = useTheme();
  const ref = useRef<ScrollView>(null);
  const settling = useRef(false);
  const didInit = useRef(false);

  const scrollToIndex = (i: number, animated: boolean) => {
    ref.current?.scrollTo({ y: i * ITEM_H, animated });
  };

  useEffect(() => {
    if (didInit.current) scrollToIndex(index, false);
  }, [index]);

  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (settling.current) return;
    const y = e.nativeEvent.contentOffset.y;
    const i = Math.max(0, Math.min(items.length - 1, Math.round(y / ITEM_H)));
    settling.current = true;
    scrollToIndex(i, true);
    setTimeout(() => { settling.current = false; }, 220);
    if (i !== index) onIndexChange(i);
  };

  return (
    <ScrollView
      ref={ref}
      testID={testID}
      style={{ width, height: ITEM_H * VISIBLE }}
      showsVerticalScrollIndicator={false}
      decelerationRate="fast"
      onContentSizeChange={() => {
        if (!didInit.current) {
          didInit.current = true;
          // Defer so react-native-web finishes measuring the (possibly long) list.
          requestAnimationFrame(() => scrollToIndex(index, false));
          setTimeout(() => scrollToIndex(index, false), 120);
        }
      }}
      onMomentumScrollEnd={onEnd}
      onScrollEndDrag={onEnd}
      contentContainerStyle={{ paddingVertical: PAD }}
    >
      {items.map((it, i) => (
        <View key={i} style={styles.item}>
          <Text style={[styles.itemText, { color: i === index ? colors.onSurface : colors.onSurfaceTertiary, fontWeight: i === index ? "800" : "500", fontSize: i === index ? 20 : 16 }]}>{it}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

// value is ISO "YYYY-MM-DD"; empty defaults to year (now-20)-06-15.
export default function DateWheel({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const { colors } = useTheme();
  const { lang } = useI18n();
  const nowY = new Date().getFullYear();
  const years = useMemo(() => Array.from({ length: 100 - 13 + 1 }, (_, i) => `${nowY - 13 - i}`), [nowY]); // newest (age13) first

  const parsed = value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : `${nowY - 20}-06-15`;
  const [y, m, d] = parsed.split("-").map((n) => parseInt(n, 10));

  const monthNames = MONTHS[lang] || MONTHS.en;
  const daysInMonth = new Date(y, m, 0).getDate();
  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`), [daysInMonth]);

  const emit = (yy: number, mm: number, dd: number) => {
    const maxD = new Date(yy, mm, 0).getDate();
    const day = Math.min(dd, maxD);
    onChange(`${yy}-${String(mm).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
  };

  const yearIndex = Math.max(0, years.indexOf(`${y}`));

  return (
    <View style={[styles.wrap, { backgroundColor: colors.surfaceTertiary, borderColor: colors.border }]} testID="date-wheel">
      <View style={[styles.centerBand, { borderColor: colors.borderStrong }]} pointerEvents="none" />
      <View style={styles.columns}>
        <WheelColumn testID="wheel-day" items={days} index={d - 1} width={64} onIndexChange={(i) => emit(y, m, i + 1)} />
        <WheelColumn testID="wheel-month" items={monthNames} index={m - 1} width={80} onIndexChange={(i) => emit(y, i + 1, d)} />
        <WheelColumn testID="wheel-year" items={years} index={yearIndex} width={84} onIndexChange={(i) => emit(parseInt(years[i], 10), m, d)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: ITEM_H * VISIBLE, borderRadius: 14, borderWidth: 1, overflow: "hidden", justifyContent: "center" },
  centerBand: { position: "absolute", left: 12, right: 12, height: ITEM_H, top: PAD, borderTopWidth: 1, borderBottomWidth: 1 },
  columns: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  item: { height: ITEM_H, alignItems: "center", justifyContent: "center" },
  itemText: { fontVariant: ["tabular-nums"] },
});
