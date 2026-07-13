import React, { useEffect, useMemo, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { useTheme } from "@/src/theme/theme";

const ITEM_H = 44;
const VISIBLE = 5;
const PAD = ((VISIBLE - 1) / 2) * ITEM_H;

function WheelColumn({
  items,
  index,
  onIndexChange,
  width,
  testID,
}: {
  items: string[];
  index: number;
  onIndexChange: (i: number) => void;
  width: number;
  testID?: string;
}) {
  const { colors } = useTheme();
  const ref = useRef<ScrollView>(null);

  useEffect(() => {
    const t = setTimeout(() => ref.current?.scrollTo({ y: index * ITEM_H, animated: false }), 30);
    return () => clearTimeout(t);
  }, []);

  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const i = Math.max(0, Math.min(items.length - 1, Math.round(y / ITEM_H)));
    if (i !== index) onIndexChange(i);
    ref.current?.scrollTo({ y: i * ITEM_H, animated: true });
  };

  return (
    <ScrollView
      ref={ref}
      testID={testID}
      style={{ width }}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_H}
      decelerationRate="fast"
      onMomentumScrollEnd={onEnd}
      contentContainerStyle={{ paddingVertical: PAD }}
    >
      {items.map((it, i) => (
        <View key={i} style={styles.item}>
          <Text
            style={[
              styles.itemText,
              { color: i === index ? colors.onSurface : colors.onSurfaceTertiary, fontWeight: i === index ? "800" : "500", fontSize: i === index ? 22 : 18 },
            ]}
          >
            {it}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

type Props = {
  hour: number; // 0-23
  minute: number;
  onChange: (hour: number, minute: number) => void;
};

export default function TimeWheel({ hour, minute, onChange }: Props) {
  const { colors } = useTheme();
  const hours12 = useMemo(() => Array.from({ length: 12 }, (_, i) => `${i + 1}`), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => `${i}`.padStart(2, "0")), []);
  const periods = ["AM", "PM"];

  const period = hour >= 12 ? 1 : 0;
  const hour12Index = ((hour % 12) === 0 ? 12 : hour % 12) - 1;

  const emit = (h12i: number, minI: number, perI: number) => {
    let h = h12i + 1; // 1-12
    if (perI === 1) h = h === 12 ? 12 : h + 12;
    else h = h === 12 ? 0 : h;
    onChange(h, minI);
  };

  return (
    <View style={[styles.wrap, { backgroundColor: colors.surfaceTertiary, borderColor: colors.border }]} testID="time-wheel">
      <View style={[styles.centerBand, { borderColor: colors.border }]} pointerEvents="none" />
      <View style={styles.columns}>
        <WheelColumn testID="wheel-hour" items={hours12} index={hour12Index} width={70} onIndexChange={(i) => emit(i, minute, period)} />
        <Text style={[styles.colon, { color: colors.onSurface }]}>:</Text>
        <WheelColumn testID="wheel-minute" items={minutes} index={minute} width={70} onIndexChange={(i) => emit(hour12Index, i, period)} />
        <WheelColumn testID="wheel-period" items={periods} index={period} width={70} onIndexChange={(i) => emit(hour12Index, minute, i)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: ITEM_H * VISIBLE, borderRadius: 12, borderWidth: 1, overflow: "hidden", justifyContent: "center" },
  centerBand: { position: "absolute", left: 12, right: 12, height: ITEM_H, top: PAD, borderTopWidth: 1, borderBottomWidth: 1 },
  columns: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
  item: { height: ITEM_H, alignItems: "center", justifyContent: "center" },
  itemText: { fontVariant: ["tabular-nums"] },
  colon: { fontSize: 22, fontWeight: "800", marginTop: -2 },
});
