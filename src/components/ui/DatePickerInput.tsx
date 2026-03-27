// ─────────────────────────────────────────────
//  DatePickerInput
//
//  A single tappable field that shows a modal
//  with three scroll columns: Day / Month / Year
//  No external dependency — pure RN ScrollView.
//
//  Props:
//    label        — field label text
//    value        — ISO string "YYYY-MM-DD" or null
//    onChange     — called with ISO "YYYY-MM-DD"
//    maxDate      — JS Date upper bound (default: today)
//    minDate      — JS Date lower bound (default: 1900-01-01)
//    placeholder  — greyed text when no value
//    error        — red error message below field
// ─────────────────────────────────────────────

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, ScrollView, Dimensions, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadows } from '../../constants/theme';

const ITEM_H  = 48;
const VISIBLE = 5;                          // rows visible in wheel
const PAD     = Math.floor(VISIBLE / 2);    // rows above/below selected

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

interface Props {
  label?:       string;
  value?:       string | null;     // ISO YYYY-MM-DD
  onChange:     (iso: string) => void;
  maxDate?:     Date;
  minDate?:     Date;
  placeholder?: string;
  error?:       string;
}

// ── Generate number arrays ────────────────────
const range = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

const DAYS   = range(1, 31);
const MONTHS_IDX = range(1, 12);
const now    = new Date();

export const DatePickerInput: React.FC<Props> = ({
  label,
  value,
  onChange,
  maxDate = now,
  minDate = new Date(1900, 0, 1),
  placeholder = 'Select date',
  error,
}) => {
  const [open, setOpen] = useState(false);

  // Parse current value
  const parse = (iso?: string | null) => {
    if (!iso) return { d: 1, m: 1, y: maxDate.getFullYear() - 20 };
    const dt = new Date(iso);
    return { d: dt.getUTCDate(), m: dt.getUTCMonth() + 1, y: dt.getUTCFullYear() };
  };

  const parsed      = parse(value);
  const [selDay,   setSelDay]   = useState(parsed.d);
  const [selMonth, setSelMonth] = useState(parsed.m);
  const [selYear,  setSelYear]  = useState(parsed.y);

  // Re-sync when value changes from outside
  useEffect(() => {
    const p = parse(value);
    setSelDay(p.d); setSelMonth(p.m); setSelYear(p.y);
  }, [value]);

  const YEARS = range(minDate.getFullYear(), maxDate.getFullYear()).reverse();

  const daysInMonth = new Date(selYear, selMonth, 0).getDate();
  const validDay    = Math.min(selDay, daysInMonth);

  const confirm = () => {
    const d = Math.min(selDay, new Date(selYear, selMonth, 0).getDate());
    const iso = `${selYear}-${String(selMonth).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    onChange(iso);
    setOpen(false);
  };

  // Format display
  const display = value
    ? new Date(value).toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })
    : null;

  return (
    <View style={styles.wrap}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity style={[styles.field, error && styles.fieldError]} onPress={() => setOpen(true)} activeOpacity={0.7}>
        <Ionicons name="calendar-outline" size={18} color={Colors.textMuted} style={styles.icon} />
        <Text style={[styles.fieldText, !display && styles.placeholder]}>
          {display ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
      </TouchableOpacity>

      {error && <Text style={styles.error}>{error}</Text>}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setOpen(false)} />

        <View style={styles.sheet}>
          {/* Title */}
          <View style={styles.sheetHeader}>
            <TouchableOpacity onPress={() => setOpen(false)}>
              <Text style={styles.cancelBtn}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.sheetTitle}>{label ?? 'Select Date'}</Text>
            <TouchableOpacity onPress={confirm}>
              <Text style={styles.doneBtn}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Wheels */}
          <View style={styles.wheelsRow}>
            <WheelColumn
              label="Day"
              items={DAYS.slice(0, daysInMonth)}
              selected={validDay}
              onSelect={setSelDay}
              format={v => String(v).padStart(2,'0')}
            />
            <WheelColumn
              label="Month"
              items={MONTHS_IDX}
              selected={selMonth}
              onSelect={setSelMonth}
              format={v => MONTHS[v - 1].slice(0, 3)}
              flex={1.4}
            />
            <WheelColumn
              label="Year"
              items={YEARS}
              selected={selYear}
              onSelect={setSelYear}
              format={v => String(v)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ── Single scroll wheel column ────────────────
interface WheelProps {
  label:    string;
  items:    number[];
  selected: number;
  onSelect: (v: number) => void;
  format:   (v: number) => string;
  flex?:    number;
}

const WheelColumn: React.FC<WheelProps> = ({ label, items, selected, onSelect, format, flex = 1 }) => {
  const scrollRef = useRef<ScrollView>(null);
  const idx       = items.indexOf(selected);
  const safeIdx   = idx >= 0 ? idx : 0;

  // Scroll to selected on open / when selection changes
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: safeIdx * ITEM_H, animated: false });
    }, 50);
  }, [safeIdx]);

  const handleScroll = (e: any) => {
    const y   = e.nativeEvent.contentOffset.y;
    const i   = Math.round(y / ITEM_H);
    const val = items[Math.max(0, Math.min(i, items.length - 1))];
    if (val !== undefined) onSelect(val);
  };

  return (
    <View style={[wheelStyles.col, { flex }]}>
      <Text style={wheelStyles.colLabel}>{label}</Text>
      {/* Selection highlight */}
      <View style={wheelStyles.selectHighlight} pointerEvents="none" />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScroll}
        onScrollEndDrag={handleScroll}
        contentContainerStyle={{ paddingVertical: PAD * ITEM_H }}
        style={wheelStyles.scroll}
      >
        {items.map((item) => {
          const isSelected = item === selected;
          return (
            <TouchableOpacity
              key={item}
              style={wheelStyles.item}
              onPress={() => {
                onSelect(item);
                const i = items.indexOf(item);
                scrollRef.current?.scrollTo({ y: i * ITEM_H, animated: true });
              }}
            >
              <Text style={[wheelStyles.itemText, isSelected && wheelStyles.itemTextSelected]}>
                {format(item)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const { height: SH } = Dimensions.get('window');

const styles = StyleSheet.create({
  wrap:        { gap: 6 },
  label:       { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textDark },
  field:       {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: Radius.xl,
    borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md + 2,
    gap: Spacing.sm,
  },
  fieldError:  { borderColor: Colors.danger },
  icon:        { marginRight: 2 },
  fieldText:   { flex: 1, fontSize: FontSize.md, color: Colors.textDark },
  placeholder: { color: Colors.textMuted },
  error:       { fontSize: FontSize.xs, color: Colors.danger, marginTop: 2 },

  backdrop:    { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet:       {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    ...Shadows.lg,
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  sheetTitle:  { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textDark },
  cancelBtn:   { fontSize: FontSize.md, color: Colors.textMuted },
  doneBtn:     { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.bold },

  wheelsRow:   { flexDirection: 'row', height: ITEM_H * VISIBLE + 16, paddingHorizontal: Spacing.md },
});

const wheelStyles = StyleSheet.create({
  col:              { flex: 1, alignItems: 'center', overflow: 'hidden' },
  colLabel:         { fontSize: FontSize.xs, color: Colors.textMuted, paddingTop: 8, paddingBottom: 4, fontWeight: FontWeight.semibold },
  scroll:           { width: '100%' },
  selectHighlight:  {
    position: 'absolute',
    top: ITEM_H * PAD + 28,   // 28 = approx label height
    left: 4, right: 4,
    height: ITEM_H,
    backgroundColor: Colors.primarySoft,
    borderRadius: Radius.md,
  },
  item:             { height: ITEM_H, alignItems: 'center', justifyContent: 'center' },
  itemText:         { fontSize: FontSize.md, color: Colors.textMuted },
  itemTextSelected: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
});