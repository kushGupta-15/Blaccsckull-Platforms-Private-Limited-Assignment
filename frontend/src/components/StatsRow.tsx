import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE, SPACING } from '../utils/constants';
import { CompetitionStatus } from '../types';
import { getCountdownLabel, formatDate } from '../utils/helpers';

interface StatsRowProps {
  registeredCount: number;
  totalSpots: number;
  entryFee: number;
  status: CompetitionStatus;
  startDate: string;
  endDate: string;
}

interface StatChipProps {
  icon: string;
  value: string;
  label: string;
  valueColor?: string;
}

const StatChip: React.FC<StatChipProps> = ({ icon, value, label, valueColor }) => (
  <View style={styles.chip} accessibilityLabel={`${label}: ${value}`}>
    <Text style={styles.chipIcon}>{icon}</Text>
    <Text style={[styles.chipValue, valueColor ? { color: valueColor } : null]}>
      {value}
    </Text>
    <Text style={styles.chipLabel}>{label}</Text>
  </View>
);

const StatsRow: React.FC<StatsRowProps> = ({
  registeredCount,
  totalSpots,
  entryFee,
  status,
  startDate,
  endDate,
}) => {
  const spotsLeft = Math.max(0, totalSpots - registeredCount);
  const spotsColor =
    spotsLeft === 0
      ? COLORS.error
      : spotsLeft <= totalSpots * 0.2
      ? COLORS.warning
      : COLORS.success;

  const timeLabel = getCountdownLabel(status, startDate, endDate);
  const timeValue =
    status === 'upcoming'
      ? formatDate(startDate)
      : status === 'active'
      ? formatDate(endDate)
      : status === 'ended'
      ? 'Ended'
      : 'N/A';

  return (
    <View style={styles.row}>
      <StatChip
        icon="👥"
        value={`${registeredCount}/${totalSpots}`}
        label="Participants"
      />
      <View style={styles.divider} />
      <StatChip
        icon="🕐"
        value={timeValue}
        label={timeLabel}
      />
      <View style={styles.divider} />
      <StatChip
        icon="💰"
        value={entryFee === 0 ? 'FREE' : `₹${entryFee}`}
        label="Entry"
        valueColor={entryFee === 0 ? COLORS.success : COLORS.warning}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgSurface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  chipIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  chipValue: {
    fontSize: FONT_SIZE.body,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  chipLabel: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.textMuted,
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
});

export default StatsRow;
