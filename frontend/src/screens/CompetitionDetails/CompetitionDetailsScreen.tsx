import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { COLORS, FONT_SIZE, SPACING } from '../../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'CompetitionDetails'>;

/**
 * Placeholder — full implementation in Phase 5 (T5.12)
 */
const CompetitionDetailsScreen: React.FC<Props> = ({ route }) => {
  const { competitionId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Competition Details</Text>
      <Text style={styles.subtitle}>ID: {competitionId}</Text>
      <Text style={styles.subtitle}>Full screen — coming in Phase 5</Text>
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
    marginTop: SPACING.xs,
  },
});

export default CompetitionDetailsScreen;
