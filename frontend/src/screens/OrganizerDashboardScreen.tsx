import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

import { RootStackParamList, ICompetition } from '../types';
import { COLORS, FONT_SIZE, SPACING } from '../utils/constants';
import StatusBadge from '../components/StatusBadge';
import { fetchHostedCompetitions } from '../api/competitions';

type Props = NativeStackScreenProps<RootStackParamList, 'OrganizerDashboard'>;

const OrganizerDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [competitions, setCompetitions] = useState<ICompetition[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchHostedCompetitions();
      setCompetitions(data);
    } catch (err: any) {
      console.warn('Failed to load hosted competitions:', err);
      Alert.alert(
        'Error',
        err.response?.data?.error || 'Failed to load your hosted events.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    void loadData();
  };

  // Aggregated Host Metrics
  const totalEvents = competitions.length;
  const totalParticipants = competitions.reduce(
    (sum, c) => sum + (c.registeredCount || 0),
    0
  );
  const totalCapacity = competitions.reduce(
    (sum, c) => sum + (c.totalSpots || 0),
    0
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topNavRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Organizer Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            Manage and track your hosted challenges
          </Text>
        </View>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => navigation.navigate('CreateCompetition', {})}
          activeOpacity={0.8}
        >
          <Text style={styles.createBtnText}>+ Create</Text>
        </TouchableOpacity>
      </View>

      {/* Aggregate Metrics Bar */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{totalEvents}</Text>
          <Text style={styles.statLabel}>Events Hosted</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: COLORS.success }]}>
            {totalParticipants}
          </Text>
          <Text style={styles.statLabel}>Participants</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: COLORS.info }]}>
            {totalCapacity}
          </Text>
          <Text style={styles.statLabel}>Total Spots</Text>
        </View>
      </View>

      <Text style={styles.sectionHeading}>Your Hosted Competitions</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🎯</Text>
      <Text style={styles.emptyTitle}>No Hosted Competitions Yet</Text>
      <Text style={styles.emptyDesc}>
        You haven&apos;t created any competitions yet. Host your first hackathon or
        challenge and invite participants!
      </Text>
      <TouchableOpacity
        style={styles.emptyCreateBtn}
        onPress={() => navigation.navigate('CreateCompetition', {})}
      >
        <Text style={styles.emptyCreateBtnText}>+ Host a Competition Now</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCompetitionItem = ({ item }: { item: ICompetition }) => {
    const spotsLeft = Math.max(0, item.totalSpots - item.registeredCount);

    return (
      <View style={styles.compCard}>
        {item.bannerImage ? (
          <Image source={{ uri: item.bannerImage }} style={styles.cardBanner} />
        ) : null}

        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.categoryBadge}>{item.category}</Text>
              <Text style={styles.compTitle} numberOfLines={2}>
                {item.title}
              </Text>
            </View>
            <StatusBadge status={item.status} />
          </View>

          {/* Metric Chips */}
          <View style={styles.chipsRow}>
            <View style={styles.metricChip}>
              <Text style={styles.metricLabel}>Participants</Text>
              <Text style={styles.metricValue}>
                {item.registeredCount} / {item.totalSpots}
              </Text>
            </View>
            <View style={styles.metricChip}>
              <Text style={styles.metricLabel}>Spots Left</Text>
              <Text
                style={[
                  styles.metricValue,
                  { color: spotsLeft < 10 ? COLORS.warning : COLORS.success },
                ]}
              >
                {spotsLeft}
              </Text>
            </View>
            <View style={styles.metricChip}>
              <Text style={styles.metricLabel}>Prize</Text>
              <Text style={styles.metricValue} numberOfLines={1}>
                {item.prizePool}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.viewBtn}
              onPress={() =>
                navigation.navigate('CompetitionDetails', {
                  competitionId: item._id,
                })
              }
            >
              <Text style={styles.viewBtnText}>🚀 Submissions & Judging</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.editBtn}
              onPress={() =>
                navigation.navigate('CreateCompetition', {
                  competitionId: item._id,
                })
              }
            >
              <Text style={styles.editBtnText}>✏️ Edit Event</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={competitions}
        keyExtractor={(item) => item._id}
        renderItem={renderCompetitionItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.body,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  headerContainer: {
    marginBottom: SPACING.lg,
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgSurface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backButtonText: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: FONT_SIZE.h2,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  createBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FONT_SIZE.body,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgSurface,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: FONT_SIZE.h2,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
  },
  sectionHeading: {
    fontSize: FONT_SIZE.h3,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  compCard: {
    backgroundColor: COLORS.bgSurface,
    borderRadius: 16,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardBanner: {
    width: '100%',
    height: 100,
    backgroundColor: COLORS.bgElevated,
  },
  cardBody: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  categoryBadge: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.primaryLight,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  compTitle: {
    fontSize: FONT_SIZE.bodyLg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  metricChip: {
    flex: 1,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 10,
    padding: SPACING.xs + 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: FONT_SIZE.caption,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  viewBtn: {
    flex: 1,
    backgroundColor: COLORS.bgElevated,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  viewBtnText: {
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontSize: FONT_SIZE.body,
  },
  editBtn: {
    flex: 1,
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  editBtnText: {
    color: COLORS.primaryLight,
    fontWeight: '600',
    fontSize: FONT_SIZE.body,
  },
  emptyContainer: {
    backgroundColor: COLORS.bgSurface,
    borderRadius: 16,
    padding: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyEmoji: {
    fontSize: 44,
    marginBottom: SPACING.sm,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.h3,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  emptyDesc: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  emptyCreateBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyCreateBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FONT_SIZE.body,
  },
});

export default OrganizerDashboardScreen;
