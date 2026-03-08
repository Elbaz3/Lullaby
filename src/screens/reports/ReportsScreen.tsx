// ─────────────────────────────────────────────
//  REPORTS SCREEN
//
//  Sections:
//  1. Date range picker (custom)
//  2. Vitals summary (HR, temp, O2, breathing)
//  3. Sleep summary
//  4. Cry analysis breakdown
//  5. Vaccination status
//  6. Export as PDF button
//
//  PDF: generates a rich HTML report with all
//  sections formatted for a doctor visit.
//  Static data for now — wire to API later.
// ─────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions, ActivityIndicator,
  Modal, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Print   from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useBabyStore }  from '../../store/babyStore';
import { useAuthStore }  from '../../store/authStore';
import {
  MOCK_DAILY_REPORT, MOCK_VACCINATION_RECORDS,
  MOCK_CRY_EVENTS, MOCK_BABIES,
} from '../../constants/mockData';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadows } from '../../constants/theme';

const { width } = Dimensions.get('window');

// ── Helpers ───────────────────────────────────
const fmt = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const calcAge = (dob: string) => {
  const birth = new Date(dob);
  const days  = Math.floor((Date.now() - birth.getTime()) / 86400000);
  const months = Math.floor(days / 30.44);
  const years  = Math.floor(days / 365.25);
  if (years < 1) {
    const w = Math.floor((days - months * 30.44) / 7);
    return w > 0 ? `${months}m ${w}w` : `${months} months`;
  }
  return `${years}y ${months - years * 12}m`;
};

// ── Date Preset Chips ─────────────────────────
const PRESETS = [
  { label: '7D',  days: 7  },
  { label: '14D', days: 14 },
  { label: '30D', days: 30 },
  { label: 'Custom', days: 0 },
];

// ── Vital Row ─────────────────────────────────
const VitalRow: React.FC<{
  icon: string; color: string; label: string;
  value: string; unit: string; normal: string; status: 'normal' | 'warning' | 'alert';
}> = ({ icon, color, label, value, unit, normal, status }) => {
  const statusColor = status === 'normal' ? Colors.success : status === 'warning' ? Colors.warning : Colors.danger;
  return (
    <View style={vStyles.row}>
      <View style={[vStyles.iconWrap, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <View style={vStyles.info}>
        <Text style={vStyles.label}>{label}</Text>
        <Text style={vStyles.normal}>Normal: {normal}</Text>
      </View>
      <View style={vStyles.valueWrap}>
        <Text style={vStyles.value}>{value}</Text>
        <Text style={vStyles.unit}>{unit}</Text>
      </View>
      <View style={[vStyles.statusDot, { backgroundColor: statusColor }]} />
    </View>
  );
};
const vStyles = StyleSheet.create({
  row:        { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  iconWrap:   { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  info:       { flex: 1, gap: 2 },
  label:      { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textDark },
  normal:     { fontSize: FontSize.xs, color: Colors.textMuted },
  valueWrap:  { alignItems: 'flex-end' },
  value:      { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textDark },
  unit:       { fontSize: FontSize.xs, color: Colors.textMuted },
  statusDot:  { width: 10, height: 10, borderRadius: 5 },
});

// ── Cry Bar ───────────────────────────────────
const CRY_COLORS: Record<string, string> = {
  hungry: '#FF7043', pain: '#E53935', tired: '#7E57C2',
  discomfort: '#FFA726', needs_attention: '#EC407A', unknown: '#78909C',
};
const CryBar: React.FC<{ reason: string; count: number; total: number }> = ({ reason, count, total }) => {
  const pct   = total > 0 ? (count / total) * 100 : 0;
  const color = CRY_COLORS[reason] ?? '#78909C';
  const label = reason.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return (
    <View style={cStyles.row}>
      <Text style={cStyles.label}>{label}</Text>
      <View style={cStyles.track}>
        <View style={[cStyles.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[cStyles.pct, { color }]}>{count}x</Text>
    </View>
  );
};
const cStyles = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: 6 },
  label: { width: 100, fontSize: FontSize.sm, color: Colors.textDark, fontWeight: FontWeight.medium },
  track: { flex: 1, height: 10, backgroundColor: Colors.bgInput, borderRadius: 5, overflow: 'hidden' },
  fill:  { height: '100%', borderRadius: 5 },
  pct:   { width: 30, fontSize: FontSize.sm, fontWeight: FontWeight.bold, textAlign: 'right' },
});

// ── Section Card ──────────────────────────────
const Section: React.FC<{
  icon: string; iconColor: string; title: string;
  badge?: string; badgeColor?: string; children: React.ReactNode;
}> = ({ icon, iconColor, title, badge, badgeColor, children }) => (
  <View style={[sStyles.card, Shadows.md]}>
    <View style={sStyles.header}>
      <View style={[sStyles.iconWrap, { backgroundColor: iconColor + '18' }]}>
        <Ionicons name={icon as any} size={18} color={iconColor} />
      </View>
      <Text style={sStyles.title}>{title}</Text>
      {badge && (
        <View style={[sStyles.badge, { backgroundColor: (badgeColor ?? iconColor) + '18' }]}>
          <Text style={[sStyles.badgeText, { color: badgeColor ?? iconColor }]}>{badge}</Text>
        </View>
      )}
    </View>
    <View style={sStyles.body}>{children}</View>
  </View>
);
const sStyles = StyleSheet.create({
  card:    { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.lg, gap: Spacing.md, ...Shadows.md },
  header:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconWrap:{ width: 36, height: 36, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  title:   { flex: 1, fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textDark },
  badge:   { paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radius.full },
  badgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  body:    { gap: 0 },
});

// ── Sleep Arc ─────────────────────────────────
const SleepArc: React.FC<{ hours: number; target: number }> = ({ hours, target }) => {
  const pct = Math.min(hours / target, 1);
  const bars = 24;
  return (
    <View style={sleepStyles.wrap}>
      <View style={sleepStyles.bars}>
        {Array.from({ length: bars }).map((_, i) => (
          <View
            key={i}
            style={[
              sleepStyles.bar,
              { backgroundColor: i / bars < pct ? Colors.primary : Colors.bgInput },
            ]}
          />
        ))}
      </View>
      <View style={sleepStyles.info}>
        <Text style={sleepStyles.hours}>{hours.toFixed(1)}h</Text>
        <Text style={sleepStyles.target}>of {target}h recommended</Text>
      </View>
    </View>
  );
};
const sleepStyles = StyleSheet.create({
  wrap:   { gap: Spacing.md },
  bars:   { flexDirection: 'row', gap: 3, height: 32, alignItems: 'flex-end' },
  bar:    { flex: 1, height: '100%', borderRadius: 2 },
  info:   { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  hours:  { fontSize: FontSize.display, fontWeight: FontWeight.bold, color: Colors.textDark },
  target: { fontSize: FontSize.sm, color: Colors.textMuted },
});

// ── PDF Generator ─────────────────────────────
const generatePDF = async (baby: any, user: any, from: Date, to: Date) => {
  const report = MOCK_DAILY_REPORT;
  const vaccinations = MOCK_VACCINATION_RECORDS;
  const cryEvents = MOCK_CRY_EVENTS;
  const sleepH = (report.sleepDuration / 60).toFixed(1);
  const age = calcAge(baby.dateOfBirth);
  const genDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const vaccinationRows = vaccinations.map(v => {
    const statusColor = v.status === 'completed' ? '#4CAF50' : v.status === 'overdue' ? '#F44336' : '#FF9800';
    const statusLabel = v.status.charAt(0).toUpperCase() + v.status.slice(1);
    return `
      <tr>
        <td>${v.vaccineName}</td>
        <td>Dose ${v.doseNumber}</td>
        <td>${v.scheduledDate}</td>
        <td>${v.administeredDate ?? '—'}</td>
        <td><span style="color:${statusColor};font-weight:600">${statusLabel}</span></td>
      </tr>`;
  }).join('');

  const cryRows = cryEvents.map(e => {
    const r = e.reason.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
    const d = new Date(e.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const dur = `${Math.floor(e.duration / 60)}m ${e.duration % 60}s`;
    return `<tr><td>${d}</td><td>${r}</td><td>${e.confidence}%</td><td>${dur}</td></tr>`;
  }).join('');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1A2B4A; background: #fff; font-size: 13px; }
  
  .page { max-width: 800px; margin: 0 auto; padding: 40px; }
  
  /* Header */
  .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 3px solid #4A90D9; margin-bottom: 28px; }
  .header-left h1 { font-size: 26px; color: #4A90D9; font-weight: 700; letter-spacing: -0.5px; }
  .header-left p { color: #8FA3B8; font-size: 12px; margin-top: 4px; }
  .header-right { text-align: right; }
  .header-right .gen-date { font-size: 11px; color: #8FA3B8; }
  .app-badge { background: #4A90D9; color: white; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px; display: inline-block; margin-bottom: 6px; }

  /* Baby profile */
  .baby-profile { background: linear-gradient(135deg, #E8F4FD, #D6EAFB); border-radius: 16px; padding: 20px 24px; margin-bottom: 28px; display: flex; gap: 32px; }
  .baby-field { flex: 1; }
  .baby-field-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: #8FA3B8; font-weight: 600; margin-bottom: 4px; }
  .baby-field-value { font-size: 15px; font-weight: 700; color: #1A2B4A; }
  .baby-field-value.accent { color: #4A90D9; }

  /* Report period */
  .period-badge { display: inline-flex; align-items: center; gap: 6px; background: #F4F8FC; border: 1px solid #DDE8F0; border-radius: 8px; padding: 8px 14px; margin-bottom: 28px; font-size: 12px; color: #4A6580; font-weight: 500; }

  /* Section */
  .section { margin-bottom: 28px; }
  .section-title { font-size: 15px; font-weight: 700; color: #1A2B4A; padding-bottom: 8px; border-bottom: 2px solid #EEF4F9; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
  .section-icon { width: 28px; height: 28px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; }

  /* Vitals grid */
  .vitals-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .vital-card { border-radius: 12px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; }
  .vital-icon { font-size: 22px; }
  .vital-label { font-size: 11px; color: #8FA3B8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
  .vital-value { font-size: 20px; font-weight: 700; }
  .vital-unit  { font-size: 11px; color: #8FA3B8; }
  .vital-status { font-size: 10px; font-weight: 600; margin-top: 2px; }
  .status-normal  { color: #4CAF50; }
  .status-warning { color: #FF9800; }

  /* Sleep */
  .sleep-block { background: #F4F8FC; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 20px; }
  .sleep-hours { font-size: 36px; font-weight: 700; color: #4A90D9; }
  .sleep-label { font-size: 12px; color: #8FA3B8; }
  .sleep-bar-wrap { flex: 1; }
  .sleep-bar-track { height: 8px; background: #DDE8F0; border-radius: 4px; overflow: hidden; margin-top: 8px; }
  .sleep-bar-fill  { height: 100%; background: #4A90D9; border-radius: 4px; }

  /* Cry table */
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: #F4F8FC; padding: 10px 12px; text-align: left; font-weight: 600; color: #4A6580; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
  td { padding: 9px 12px; border-bottom: 1px solid #EEF4F9; color: #1A2B4A; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #F9FBFD; }

  /* Cry breakdown */
  .cry-bar-row { display: flex; align-items: center; gap: 12px; padding: 6px 0; }
  .cry-bar-label { width: 130px; font-size: 12px; color: #1A2B4A; font-weight: 500; }
  .cry-bar-track { flex: 1; height: 8px; background: #EEF4F9; border-radius: 4px; overflow: hidden; }
  .cry-bar-fill  { height: 100%; border-radius: 4px; }
  .cry-bar-count { width: 30px; font-size: 12px; font-weight: 700; text-align: right; }

  /* Footer */
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #EEF4F9; display: flex; justify-content: space-between; align-items: center; }
  .footer-note { font-size: 10px; color: #8FA3B8; max-width: 400px; line-height: 1.6; }
  .footer-brand { font-size: 12px; font-weight: 700; color: #4A90D9; }

  /* Disclaimer */
  .disclaimer { background: #FFF8E1; border-left: 4px solid #FF9800; border-radius: 8px; padding: 12px 16px; margin-top: 20px; font-size: 11px; color: #4A6580; line-height: 1.7; }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="header-left">
      <div class="app-badge">🍼 Lullaby</div>
      <h1>Baby Health Report</h1>
      <p>AI-Powered Baby Monitoring System</p>
    </div>
    <div class="header-right">
      <div class="gen-date">Generated on</div>
      <div style="font-weight:600;font-size:12px;margin-top:2px">${genDate}</div>
      <div style="font-size:11px;color:#8FA3B8;margin-top:8px">Prepared by: ${user?.name ?? 'Parent'}</div>
    </div>
  </div>

  <!-- Baby Profile -->
  <div class="baby-profile">
    <div class="baby-field">
      <div class="baby-field-label">Full Name</div>
      <div class="baby-field-value accent">${baby.name}</div>
    </div>
    <div class="baby-field">
      <div class="baby-field-label">Age</div>
      <div class="baby-field-value">${age}</div>
    </div>
    <div class="baby-field">
      <div class="baby-field-label">Date of Birth</div>
      <div class="baby-field-value">${new Date(baby.dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
    </div>
    <div class="baby-field">
      <div class="baby-field-label">Gender</div>
      <div class="baby-field-value">${baby.gender === 'boy' ? 'Male' : 'Female'}</div>
    </div>
    <div class="baby-field">
      <div class="baby-field-label">Weight</div>
      <div class="baby-field-value">${baby.weight ?? '—'} kg</div>
    </div>
    <div class="baby-field">
      <div class="baby-field-label">Height</div>
      <div class="baby-field-value">${baby.height ?? '—'} cm</div>
    </div>
    <div class="baby-field">
      <div class="baby-field-label">Blood Type</div>
      <div class="baby-field-value">${baby.bloodType ?? '—'}</div>
    </div>
  </div>

  <!-- Report Period -->
  <div class="period-badge">
    📅 &nbsp; Report Period: <strong>${fmt(from)}</strong> &nbsp;→&nbsp; <strong>${fmt(to)}</strong>
  </div>

  <!-- Vitals -->
  <div class="section">
    <div class="section-title">
      <span class="section-icon" style="background:#FFF0F0">❤️</span>
      Vital Signs — Average Values
    </div>
    <div class="vitals-grid">
      <div class="vital-card" style="background:#FFF0F0">
        <div class="vital-icon">❤️</div>
        <div>
          <div class="vital-label">Heart Rate</div>
          <div><span class="vital-value" style="color:#E53935">${report.avgHeartRate}</span> <span class="vital-unit">bpm</span></div>
          <div class="vital-status status-normal">● Normal (100–160 bpm)</div>
        </div>
      </div>
      <div class="vital-card" style="background:#FFF8E1">
        <div class="vital-icon">🌡️</div>
        <div>
          <div class="vital-label">Temperature</div>
          <div><span class="vital-value" style="color:#FF8F00">${report.avgTemperature}</span> <span class="vital-unit">°C</span></div>
          <div class="vital-status status-normal">● Normal (36.5–37.5°C)</div>
        </div>
      </div>
      <div class="vital-card" style="background:#E8F5E9">
        <div class="vital-icon">🫁</div>
        <div>
          <div class="vital-label">Oxygen Level</div>
          <div><span class="vital-value" style="color:#43A047">${report.avgOxygenLevel}</span> <span class="vital-unit">%</span></div>
          <div class="vital-status status-normal">● Normal (95–100%)</div>
        </div>
      </div>
      <div class="vital-card" style="background:#E3F2FD">
        <div class="vital-icon">💨</div>
        <div>
          <div class="vital-label">Breathing Rate</div>
          <div><span class="vital-value" style="color:#1E88E5">${report.avgBreathingRate}</span> <span class="vital-unit">bpm</span></div>
          <div class="vital-status status-normal">● Normal (30–60 bpm)</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Sleep -->
  <div class="section">
    <div class="section-title">
      <span class="section-icon" style="background:#EDE7F6">🌙</span>
      Sleep Patterns
    </div>
    <div class="sleep-block">
      <div>
        <div class="sleep-hours">${sleepH}h</div>
        <div class="sleep-label">Average daily sleep</div>
      </div>
      <div class="sleep-bar-wrap">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:#8FA3B8">
          <span>0h</span><span>Recommended: 14h</span><span>16h</span>
        </div>
        <div class="sleep-bar-track">
          <div class="sleep-bar-fill" style="width:${Math.min((parseFloat(sleepH)/16)*100, 100)}%"></div>
        </div>
        <div style="font-size:11px;color:#4CAF50;margin-top:6px;font-weight:600">
          ${parseFloat(sleepH) >= 12 ? '✓ Within healthy range for age' : '⚠ Below recommended sleep for age'}
        </div>
      </div>
    </div>
    <div style="margin-top:12px;font-size:11px;color:#8FA3B8;line-height:1.7">
      Recommended sleep for infants 6–12 months: 12–16 hours per day including naps.
      Sleep was monitored via motion and breathing sensors.
    </div>
  </div>

  <!-- Cry Analysis -->
  <div class="section">
    <div class="section-title">
      <span class="section-icon" style="background:#FCE4EC">😢</span>
      Cry Analysis
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:12px;color:#8FA3B8;margin-bottom:10px">Cry reason breakdown (${report.totalCryEvents} total events)</div>
      ${report.cryReasonBreakdown.map((b: any) => {
        const color = CRY_COLORS[b.reason] ?? '#78909C';
        const pct = Math.round((b.count / report.totalCryEvents) * 100);
        const label = b.reason.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
        return `
        <div class="cry-bar-row">
          <div class="cry-bar-label">${label}</div>
          <div class="cry-bar-track">
            <div class="cry-bar-fill" style="width:${pct}%;background:${color}"></div>
          </div>
          <div class="cry-bar-count" style="color:${color}">${b.count}x</div>
        </div>`;
      }).join('')}
    </div>
    <div style="font-size:12px;color:#4A6580;font-weight:600;margin-bottom:8px">Detailed Event Log</div>
    <table>
      <thead><tr><th>Time</th><th>Detected Reason</th><th>Confidence</th><th>Duration</th></tr></thead>
      <tbody>${cryRows}</tbody>
    </table>
  </div>

  <!-- Vaccinations -->
  <div class="section">
    <div class="section-title">
      <span class="section-icon" style="background:#E8F5E9">💉</span>
      Vaccination Records
    </div>
    <table>
      <thead><tr><th>Vaccine</th><th>Dose</th><th>Scheduled</th><th>Administered</th><th>Status</th></tr></thead>
      <tbody>${vaccinationRows}</tbody>
    </table>
  </div>

  <!-- Disclaimer -->
  <div class="disclaimer">
    <strong>⚠️ Important Notice:</strong> This report is generated by the Lullaby AI baby monitoring app and is intended as a 
    supplementary reference for healthcare professionals. All data is collected via IoT sensors and AI analysis. 
    The information in this report does not constitute a medical diagnosis. Please consult a qualified pediatrician 
    for medical advice. Vital sign ranges shown are general references for infants and may vary by age and individual factors.
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-note">
      This report was automatically generated by Lullaby · 
      Data collected from ${fmt(from)} to ${fmt(to)} · 
      For questions, contact your pediatrician.
    </div>
    <div class="footer-brand">🍼 Lullaby</div>
  </div>

</div>
</body>
</html>`;
  return html;
};

// ─────────────────────────────────────────────
//  MAIN SCREEN
// ─────────────────────────────────────────────
export const ReportsScreen: React.FC = () => {
  const { activeBaby } = useBabyStore();
  const { user }       = useAuthStore();
  const baby = activeBaby ?? MOCK_BABIES[0];

  const [preset,      setPreset]      = useState(1); // 14D default
  const [exporting,   setExporting]   = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [customFrom,  setCustomFrom]  = useState<Date | null>(null);
  const [customTo,    setCustomTo]    = useState<Date | null>(null);

  const { fromDate, toDate } = useMemo(() => {
    if (preset === 3 && customFrom && customTo) {
      return { fromDate: customFrom, toDate: customTo };
    }
    const days = PRESETS[preset].days || 14;
    const to   = new Date();
    const from = new Date(Date.now() - days * 86400000);
    return { fromDate: from, toDate: to };
  }, [preset, customFrom, customTo]);

  const report       = MOCK_DAILY_REPORT;
  const vaccinations = MOCK_VACCINATION_RECORDS;
  const cryEvents    = MOCK_CRY_EVENTS;
  const sleepH       = report.sleepDuration / 60;

  const completedVax = vaccinations.filter(v => v.status === 'completed').length;
  const overdueVax   = vaccinations.filter(v => v.status === 'overdue').length;

  // ── Export PDF ────────────────────────────
  const handleExport = async () => {
    setExporting(true);
    try {
      const html = await generatePDF(baby, user, fromDate, toDate);
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `${baby.name} Health Report`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        await Print.printAsync({ html });
      }
    } catch (e) {
      console.error('PDF export error:', e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Health Report</Text>
            <Text style={styles.subtitle}>{baby.name} · {calcAge(baby.dateOfBirth)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.exportBtn, exporting && { opacity: 0.7 }]}
            onPress={handleExport}
            disabled={exporting}
            activeOpacity={0.85}
          >
            {exporting
              ? <ActivityIndicator size="small" color={Colors.white} />
              : <Ionicons name="document-text-outline" size={18} color={Colors.white} />
            }
            <Text style={styles.exportText}>{exporting ? 'Generating...' : 'Export PDF'}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Date Range ── */}
        <View style={[styles.dateCard, Shadows.sm]}>
          <View style={styles.datePresets}>
            {PRESETS.map((p, i) => (
              <TouchableOpacity
                key={p.label}
                style={[styles.presetChip, preset === i && styles.presetChipActive]}
                onPress={() => {
                  setPreset(i);
                  if (i === 3) setDatePickerVisible(true);
                }}
              >
                <Text style={[styles.presetText, preset === i && styles.presetTextActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.dateRange}>
            <Ionicons name="calendar-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.dateRangeText}>
              {fmt(fromDate)} → {fmt(toDate)}
            </Text>
          </View>
        </View>

        {/* ── Summary Chips ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.summaryRow}>
          {[
            { icon: 'heart-outline',      color: '#E53935', bg: '#FFEBEE', label: 'Avg HR',      value: `${report.avgHeartRate} bpm` },
            { icon: 'thermometer-outline',color: '#FF8F00', bg: '#FFF8E1', label: 'Avg Temp',     value: `${report.avgTemperature}°C` },
            { icon: 'water-outline',       color: '#43A047', bg: '#E8F5E9', label: 'Avg O₂',      value: `${report.avgOxygenLevel}%` },
            { icon: 'moon-outline',        color: '#7E57C2', bg: '#EDE7F6', label: 'Sleep',        value: `${sleepH.toFixed(1)}h` },
            { icon: 'mic-outline',         color: '#EC407A', bg: '#FCE4EC', label: 'Cry Events',   value: `${report.totalCryEvents}` },
            { icon: 'shield-checkmark-outline', color: '#26A69A', bg: '#E0F2F1', label: 'Vaccines', value: `${completedVax} done` },
          ].map(s => (
            <View key={s.label} style={[styles.summaryChip, { backgroundColor: s.bg }]}>
              <Ionicons name={s.icon as any} size={16} color={s.color} />
              <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.summaryLabel}>{s.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* ── Vitals Section ── */}
        <Section icon="heart" iconColor="#E53935" title="Vital Signs">
          <VitalRow icon="heart-outline"       color="#E53935" label="Heart Rate"     value={`${report.avgHeartRate}`}    unit="bpm" normal="100–160 bpm" status="normal" />
          <VitalRow icon="thermometer-outline" color="#FF8F00" label="Temperature"    value={`${report.avgTemperature}`}  unit="°C"  normal="36.5–37.5°C" status="normal" />
          <VitalRow icon="water-outline"        color="#43A047" label="Oxygen Level"  value={`${report.avgOxygenLevel}`}  unit="%"   normal="95–100%" status="normal" />
          <VitalRow icon="pulse-outline"        color="#1E88E5" label="Breathing Rate" value={`${report.avgBreathingRate}`} unit="bpm" normal="30–60 bpm" status="normal" />
        </Section>

        {/* ── Sleep Section ── */}
        <Section icon="moon-outline" iconColor="#7E57C2" title="Sleep Patterns"
          badge={sleepH >= 12 ? 'Healthy' : 'Low'} badgeColor={sleepH >= 12 ? Colors.success : Colors.warning}
        >
          <SleepArc hours={sleepH} target={14} />
          <Text style={styles.sleepNote}>
            Recommended for infants: 12–16h/day including naps. Sleep tracked via motion and breathing sensors.
          </Text>
        </Section>

        {/* ── Cry Analysis Section ── */}
        <Section icon="mic-outline" iconColor="#EC407A" title="Cry Analysis"
          badge={`${report.totalCryEvents} events`} badgeColor="#EC407A"
        >
          {report.cryReasonBreakdown.map((b: any) => (
            <CryBar key={b.reason} reason={b.reason} count={b.count} total={report.totalCryEvents} />
          ))}
          <View style={styles.cryEventsList}>
            <Text style={styles.subSectionTitle}>Recent Events</Text>
            {cryEvents.slice(0, 4).map(e => {
              const color = CRY_COLORS[e.reason] ?? '#78909C';
              const label = e.reason.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
              const time  = new Date(e.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
              return (
                <View key={e.id} style={styles.eventRow}>
                  <View style={[styles.eventDot, { backgroundColor: color }]} />
                  <Text style={styles.eventTime}>{time}</Text>
                  <Text style={[styles.eventLabel, { color }]}>{label}</Text>
                  <View style={styles.eventConfWrap}>
                    <Text style={[styles.eventConf, { color }]}>{e.confidence}%</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Section>

        {/* ── Vaccinations Section ── */}
        <Section icon="shield-checkmark-outline" iconColor="#26A69A" title="Vaccination Records"
          badge={overdueVax > 0 ? `${overdueVax} overdue` : 'Up to date'} badgeColor={overdueVax > 0 ? Colors.danger : Colors.success}
        >
          {vaccinations.map(v => {
            const statusColor = v.status === 'completed' ? Colors.success : v.status === 'overdue' ? Colors.danger : Colors.warning;
            const statusIcon  = v.status === 'completed' ? 'checkmark-circle' : v.status === 'overdue' ? 'alert-circle' : 'time-outline';
            return (
              <View key={v.id} style={styles.vacRow}>
                <Ionicons name={statusIcon as any} size={18} color={statusColor} />
                <View style={styles.vacInfo}>
                  <Text style={styles.vacName}>{v.vaccineName} <Text style={styles.vacDose}>Dose {v.doseNumber}</Text></Text>
                  <Text style={styles.vacDate}>{v.administeredDate ?? v.scheduledDate}</Text>
                </View>
                <View style={[styles.vacStatus, { backgroundColor: statusColor + '18' }]}>
                  <Text style={[styles.vacStatusText, { color: statusColor }]}>
                    {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                  </Text>
                </View>
              </View>
            );
          })}
        </Section>

        {/* ── Disclaimer ── */}
        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.warning} />
          <Text style={styles.disclaimerText}>
            This report is a supplementary reference for healthcare professionals. It does not constitute a medical diagnosis. Please consult a qualified pediatrician.
          </Text>
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: Colors.bgMain },
  container:  { padding: Spacing.xl, gap: Spacing.lg },

  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title:      { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textDark },
  subtitle:   { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  exportBtn:  {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary, borderRadius: Radius.xl,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    ...Shadows.md,
  },
  exportText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.white },

  dateCard:   { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.lg, gap: Spacing.md },
  datePresets:{ flexDirection: 'row', gap: Spacing.sm },
  presetChip: { flex: 1, paddingVertical: Spacing.sm, borderRadius: Radius.lg, backgroundColor: Colors.bgInput, alignItems: 'center' },
  presetChipActive: { backgroundColor: Colors.primary },
  presetText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textMuted },
  presetTextActive: { color: Colors.white },
  dateRange:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateRangeText: { fontSize: FontSize.sm, color: Colors.textMuted },

  summaryRow: { marginHorizontal: -Spacing.xl, paddingHorizontal: Spacing.xl },
  summaryChip: { alignItems: 'center', gap: 4, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: Radius.xl, marginRight: Spacing.sm, minWidth: 80 },
  summaryValue:{ fontSize: FontSize.md, fontWeight: FontWeight.bold },
  summaryLabel:{ fontSize: FontSize.xs, color: Colors.textMuted },

  sleepNote:  { fontSize: FontSize.xs, color: Colors.textMuted, lineHeight: 18, marginTop: Spacing.sm },
  subSectionTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textDark, marginTop: Spacing.md, marginBottom: Spacing.sm },
  cryEventsList: { gap: 0 },
  eventRow:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  eventDot:   { width: 8, height: 8, borderRadius: 4 },
  eventTime:  { fontSize: FontSize.sm, color: Colors.textMuted, width: 44 },
  eventLabel: { flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  eventConfWrap: { backgroundColor: Colors.bgInput, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  eventConf:  { fontSize: FontSize.xs, fontWeight: FontWeight.bold },

  vacRow:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  vacInfo:    { flex: 1 },
  vacName:    { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textDark },
  vacDose:    { fontWeight: FontWeight.regular, color: Colors.textMuted },
  vacDate:    { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  vacStatus:  { paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radius.full },
  vacStatusText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },

  disclaimer: { flexDirection: 'row', gap: Spacing.sm, backgroundColor: Colors.warningSoft, borderRadius: Radius.xl, padding: Spacing.lg, borderLeftWidth: 3, borderLeftColor: Colors.warning },
  disclaimerText: { flex: 1, fontSize: FontSize.xs, color: Colors.textMedium, lineHeight: 18 },
});