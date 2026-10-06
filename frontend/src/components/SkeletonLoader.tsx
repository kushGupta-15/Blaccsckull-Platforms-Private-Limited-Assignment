import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS, SPACING } from '../utils/constants';

const { width } = Dimensions.get('window');

const SkeletonBox: React.FC<{
  w?: number | string;
  h?: number;
  radius?: number;
  style?: object;
}> = ({ w = '100%', h = 16, radius = 8, style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: w,
          height: h,
          borderRadius: radius,
          backgroundColor: COLORS.bgElevated,
          opacity,
        },
        style,
      ]}
      accessibilityElementsHidden
    />
  );
};

const CompetitionDetailsSkeleton: React.FC = () => (
  <View style={styles.container}>
    {/* Banner */}
    <SkeletonBox w={width} h={width * 0.45} radius={0} />

    <View style={styles.body}>
      {/* Badge + title */}
      <SkeletonBox w={80} h={22} radius={12} style={{ marginBottom: SPACING.sm }} />
      <SkeletonBox w="85%" h={28} radius={8} style={{ marginBottom: SPACING.xs }} />
      <SkeletonBox w="60%" h={18} radius={8} style={{ marginBottom: SPACING.lg }} />

      {/* Stats row */}
      <SkeletonBox h={80} radius={16} style={{ marginBottom: SPACING.sm }} />

      {/* Progress bar */}
      <SkeletonBox h={8} radius={4} style={{ marginBottom: SPACING.xs }} />
      <SkeletonBox w="40%" h={12} radius={4} style={{ marginBottom: SPACING.lg }} />

      {/* Countdown */}
      <SkeletonBox h={90} radius={16} style={{ marginBottom: SPACING.lg }} />

      {/* Description */}
      <SkeletonBox h={16} radius={4} style={{ marginBottom: SPACING.xs }} />
      <SkeletonBox h={16} radius={4} style={{ marginBottom: SPACING.xs }} />
      <SkeletonBox w="70%" h={16} radius={4} style={{ marginBottom: SPACING.lg }} />

      {/* Participants */}
      <SkeletonBox w="40%" h={18} radius={8} style={{ marginBottom: SPACING.sm }} />
      <View style={{ flexDirection: 'row', gap: SPACING.xs }}>
        {[1, 2, 3, 4].map((i) => (
          <SkeletonBox key={i} w={36} h={36} radius={18} />
        ))}
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  body: { padding: SPACING.md },
});

export default CompetitionDetailsSkeleton;
