import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE, SPACING } from '../utils/constants';

/**
 * Placeholder — full implementation in Phase 6 (T6.2)
 */
const CompetitionsListScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Competitions</Text>
      <Text style={styles.subtitle}>List screen — coming in Phase 6</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.h1,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textSecondary,
  },
});

export default CompetitionsListScreen;
