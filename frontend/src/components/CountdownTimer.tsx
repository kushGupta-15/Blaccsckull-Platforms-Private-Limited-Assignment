import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CompetitionStatus } from '../types';
import { secondsUntil, formatCountdown } from '../utils/helpers';
import { COLORS, FONT_SIZE, SPACING } from '../utils/constants';

interface CountdownTimerProps {
  status: CompetitionStatus;
  startDate: string;
  endDate: string;
}

interface UnitBoxProps {
  value: string;
  label: string;
}

const UnitBox: React.FC<UnitBoxProps> = ({ value, label }) => (
  <View style={styles.unitBox}>
    <View style={styles.valueBox}>
      <Text style={styles.value}>{value}</Text>
    </View>
    <Text style={styles.unitLabel}>{label}</Text>
  </View>
);

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  status,
  startDate,
  endDate,
}) => {
  const targetDate = status === 'upcoming' ? startDate : endDate;
  const [seconds, setSeconds] = useState(() => secondsUntil(targetDate));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (status !== 'upcoming' && status !== 'active') return;

    setSeconds(secondsUntil(targetDate));

    intervalRef.current = setInterval(() => {
      const s = secondsUntil(targetDate);
      setSeconds(s);
      if (s <= 0 && intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }, 1000);

    // Cleanup on unmount — prevents memory leak
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [targetDate, status]);

  if (status === 'ended') {
    return (
      <View style={styles.endedBox} accessibilityLabel="Competition has ended">
        <Text style={styles.endedText}>Competition Ended</Text>
      </View>
    );
  }

  if (status === 'cancelled') {
    return (
      <View style={styles.endedBox} accessibilityLabel="Competition cancelled">
        <Text style={styles.endedText}>Cancelled</Text>
      </View>
    );
  }

  if (status === 'full' ) {
    return (
      <View style={[styles.endedBox, { borderColor: COLORS.info }]}
        accessibilityLabel="Competition is full">
        <Text style={[styles.endedText, { color: COLORS.info }]}>Competition Full</Text>
      </View>
    );
  }

  const parts = formatCountdown(seconds);
  const heading = status === 'upcoming' ? '⏳ Starts In' : '⏰ Ends In';

  return (
    <View style={styles.wrapper} accessibilityLabel={`${heading}: ${parts.days} days ${parts.hours} hours ${parts.minutes} minutes`}>
      <Text style={styles.heading}>{heading}</Text>
      <View style={styles.row}>
        <UnitBox value={parts.days}    label="DAYS" />
        <Text style={styles.colon}>:</Text>
        <UnitBox value={parts.hours}   label="HRS" />
        <Text style={styles.colon}>:</Text>
        <UnitBox value={parts.minutes} label="MIN" />
        <Text style={styles.colon}>:</Text>
        <UnitBox value={parts.seconds} label="SEC" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    backgroundColor: COLORS.bgSurface,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: 16,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heading: {
    fontSize: FONT_SIZE.caption,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  unitBox: {
    alignItems: 'center',
  },
  valueBox: {
    backgroundColor: COLORS.bgElevated,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minWidth: 58,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  value: {
    fontSize: FONT_SIZE.h2,
    fontWeight: '800',
    color: COLORS.primary,
    fontVariant: ['tabular-nums'],
  },
  unitLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 3,
    letterSpacing: 1,
  },
  colon: {
    fontSize: FONT_SIZE.h2,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
  },
  endedBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: 16,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.error,
    backgroundColor: 'rgba(255,71,87,0.08)',
  },
  endedText: {
    fontSize: FONT_SIZE.bodyLg,
    fontWeight: '700',
    color: COLORS.error,
  },
});

export default CountdownTimer;
