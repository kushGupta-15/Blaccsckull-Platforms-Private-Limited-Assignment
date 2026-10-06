import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';

import { ISubmission } from '../types';
import { COLORS, FONT_SIZE, SPACING } from '../utils/constants';

interface Props {
  winners: ISubmission[];
}

const WinnersPodium: React.FC<Props> = ({ winners }) => {
  const first = winners.find((w) => w.awardRank === 1);
  const second = winners.find((w) => w.awardRank === 2);
  const third = winners.find((w) => w.awardRank === 3);

  const handleOpenLink = async (url?: string): Promise<void> => {
    if (!url) return;
    try {
      const can = await Linking.canOpenURL(url);
      if (can) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Unable to Open Link', url);
      }
    } catch {
      Alert.alert('Error', 'Could not open link');
    }
  };

  if (!first && !second && !third) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🏆</Text>
        <Text style={styles.emptyTitle}>Winners Not Declared Yet</Text>
        <Text style={styles.emptySubtitle}>
          The competition host is currently reviewing all submissions. Winners will be showcased here once finalized!
        </Text>
      </View>
    );
  }

  const renderPodiumPillar = (
    sub: ISubmission | undefined,
    rank: 1 | 2 | 3,
    color: string,
    bgColor: string,
    height: number
  ) => {
    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
    const rankLabel = rank === 1 ? '1st Place' : rank === 2 ? '2nd Place' : '3rd Place';

    return (
      <View style={styles.pillarWrapper}>
        {sub ? (
          <View style={styles.winnerCard}>
            <Text style={styles.medalIcon}>{medal}</Text>
            <Text style={styles.winnerTitle} numberOfLines={2}>
              {sub.title}
            </Text>
            <Text style={styles.authorName} numberOfLines={1}>
              by {sub.userId?.name ?? 'Participant'}
            </Text>
            {sub.score !== undefined && (
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreText}>{sub.score} pts</Text>
              </View>
            )}
            <View style={styles.linksRow}>
              <TouchableOpacity
                onPress={() => handleOpenLink(sub.repositoryUrl)}
                style={styles.pillBtn}
              >
                <Text style={styles.pillBtnText}>Code</Text>
              </TouchableOpacity>
              {Boolean(sub.demoUrl) && (
                <TouchableOpacity
                  onPress={() => handleOpenLink(sub.demoUrl)}
                  style={[styles.pillBtn, styles.demoPillBtn]}
                >
                  <Text style={styles.pillBtnText}>Demo</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.unclaimedBox}>
            <Text style={styles.medalIcon}>{medal}</Text>
            <Text style={styles.unclaimedText}>Unassigned</Text>
          </View>
        )}

        {/* Podium Base */}
        <View
          style={[
            styles.pillarBase,
            { height, backgroundColor: bgColor, borderColor: color },
          ]}
        >
          <Text style={[styles.pillarRankNum, { color }]}>{rank}</Text>
          <Text style={[styles.pillarRankLabel, { color }]}>{rankLabel}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>🏆 Hall of Winners</Text>
      <Text style={styles.sectionSubtitle}>
        Top awarded hackathon innovations & solutions
      </Text>

      {/* 3-Column Podium Display */}
      <View style={styles.podiumContainer}>
        {/* 2nd Place (Silver) */}
        {renderPodiumPillar(second, 2, '#CBD5E1', '#1E293B', 80)}

        {/* 1st Place (Gold) */}
        {renderPodiumPillar(first, 1, '#F59E0B', '#312E81', 110)}

        {/* 3rd Place (Bronze) */}
        {renderPodiumPillar(third, 3, '#D97706', '#1E293B', 60)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#312E81',
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: '#FCD34D',
    textAlign: 'center',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  pillarWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  winnerCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    padding: SPACING.xs,
    alignItems: 'center',
    width: '100%',
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  unclaimedBox: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: SPACING.xs,
    alignItems: 'center',
    width: '100%',
    marginBottom: SPACING.xs,
  },
  unclaimedText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  medalIcon: {
    fontSize: 24,
    marginBottom: 2,
  },
  winnerTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
  },
  authorName: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 4,
  },
  scoreBadge: {
    backgroundColor: '#065F46',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 10,
    color: '#6EE7B7',
    fontWeight: '700',
  },
  linksRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  pillBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  demoPillBtn: {
    backgroundColor: '#0F766E',
  },
  pillBtnText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  pillarBase: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 3,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  pillarRankNum: {
    fontSize: 28,
    fontWeight: '900',
  },
  pillarRankLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyContainer: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: SPACING.sm,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default WinnersPodium;
