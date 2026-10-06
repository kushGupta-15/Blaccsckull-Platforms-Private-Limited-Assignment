import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CompetitionStatus } from '../types';
import { COLORS, FONT_SIZE, SPACING } from '../utils/constants';

interface StatusBadgeProps {
  status: CompetitionStatus;
}

const STATUS_CONFIG: Record<
  CompetitionStatus,
  { label: string; color: string; bg: string }
> = {
  active:    { label: 'ACTIVE',     color: COLORS.success, bg: 'rgba(0,212,160,0.15)' },
  upcoming:  { label: 'UPCOMING',   color: COLORS.warning, bg: 'rgba(255,184,0,0.15)' },
  full:      { label: 'FULL',       color: COLORS.info,    bg: 'rgba(78,205,196,0.15)' },
  ended:     { label: 'ENDED',      color: COLORS.error,   bg: 'rgba(255,71,87,0.15)'  },
  cancelled: { label: 'CANCELLED',  color: COLORS.textMuted, bg: 'rgba(90,90,122,0.2)' },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.ended;

  return (
    <View
      style={[styles.badge, { backgroundColor: cfg.bg }]}
      accessibilityLabel={`Competition status: ${cfg.label}`}
    >
      <View style={[styles.dot, { backgroundColor: cfg.color }]} />
      <Text style={[styles.label, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZE.badge,
    fontWeight: '700',
    letterSpacing: 1,
  },
});

export default StatusBadge;
