import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, FONT_SIZE, SPACING } from '../utils/constants';

interface SpotsProgressBarProps {
  registeredCount: number;
  totalSpots: number;
}

const SpotsProgressBar: React.FC<SpotsProgressBarProps> = ({
  registeredCount,
  totalSpots,
}) => {
  const ratio = totalSpots > 0 ? Math.min(registeredCount / totalSpots, 1) : 0;
  const spotsLeft = Math.max(0, totalSpots - registeredCount);
  const pct = Math.round(ratio * 100);

  const animWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: ratio,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [ratio]);

  // Color shifts to warning when < 20% remaining, error when full
  const barColor =
    ratio >= 1
      ? COLORS.error
      : ratio >= 0.8
      ? COLORS.warning
      : COLORS.primary;

  return (
    <View
      style={styles.wrapper}
      accessibilityLabel={`${spotsLeft} spots remaining out of ${totalSpots}`}
    >
      <View style={styles.header}>
        <Text style={styles.label}>
          {spotsLeft === 0 ? 'No spots left' : `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} remaining`}
        </Text>
        <Text style={styles.pct}>{pct}% full</Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: barColor,
              width: animWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <Text style={styles.sub}>
        {registeredCount} registered · {totalSpots} total
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZE.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  pct: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.textSecondary,
  },
  track: {
    height: 8,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  sub: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.caption,
    color: COLORS.textMuted,
  },
});

export default SpotsProgressBar;
