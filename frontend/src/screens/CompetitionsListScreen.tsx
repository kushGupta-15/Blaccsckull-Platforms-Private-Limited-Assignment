import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  ListRenderItemInfo,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList, ICompetition, CompetitionStatus } from '../types';
import { COLORS, FONT_SIZE, SPACING } from '../utils/constants';
import { useAuthStore } from '../store/authStore';
import {
  useCompetitions,
  useMyRegistrations,
  flattenCompetitions,
} from '../hooks/useCompetitions';
import CompetitionCard from '../components/CompetitionCard';

type Props = NativeStackScreenProps<RootStackParamList, 'CompetitionsList'>;

// ── Filter tabs ───────────────────────────────────────────────────────────────
type FilterTab = 'all' | 'mine' | CompetitionStatus;

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',      label: 'All' },
  { key: 'mine',     label: '✅ My Registrations' },
  { key: 'active',   label: '🟢 Active' },
  { key: 'upcoming', label: '🟡 Upcoming' },
  { key: 'ended',    label: '🔴 Ended' },
  { key: 'full',     label: '🔵 Full' },
];

// ── Screen ────────────────────────────────────────────────────────────────────
const CompetitionsListScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const user   = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [searchText, setSearchText]     = useState('');
  const [searchQuery, setSearchQuery]   = useState('');

  const searchRef = useRef<TextInput>(null);

  const isMyTab      = activeFilter === 'mine';
  const statusParam  = (!isMyTab && activeFilter !== 'all') ? activeFilter : undefined;

  // ── Data hooks ────────────────────────────────────────────────────────────
  const allQuery = useCompetitions(statusParam, searchQuery || undefined);
  const myQuery  = useMyRegistrations();

  const activeQuery = isMyTab ? null : allQuery;

  const competitions: ICompetition[] = isMyTab
    ? (myQuery.data?.items ?? [])
    : (allQuery.data ? flattenCompetitions(allQuery.data.pages) : []);

  const totalCount = isMyTab
    ? (myQuery.data?.total ?? 0)
    : (allQuery.data?.pages[0]?.total ?? 0);

  const isLoading    = isMyTab ? myQuery.isLoading  : allQuery.isLoading;
  const isError      = isMyTab ? myQuery.isError    : allQuery.isError;
  const isRefetching = isMyTab ? myQuery.isFetching : allQuery.isRefetching;

  const handleRefetch = useCallback(() => {
    if (isMyTab) void myQuery.refetch();
    else void allQuery.refetch();
  }, [isMyTab, myQuery, allQuery]);

  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = allQuery;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleCardPress = useCallback(
    (competitionId: string) => navigation.navigate('CompetitionDetails', { competitionId }),
    [navigation]
  );

  const handleSearchSubmit  = useCallback(() => setSearchQuery(searchText.trim()), [searchText]);

  const handleSearchClear = useCallback(() => {
    setSearchText('');
    setSearchQuery('');
    searchRef.current?.blur();
  }, []);

  const handleFilterChange = useCallback((tab: FilterTab) => {
    setActiveFilter(tab);
    setSearchText('');
    setSearchQuery('');
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!isMyTab && hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [isMyTab, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ── Render helpers ────────────────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ICompetition>) => (
      <CompetitionCard competition={item} onPress={() => handleCardPress(item._id)} />
    ),
    [handleCardPress]
  );

  const keyExtractor = useCallback((item: ICompetition) => item._id, []);

  const renderFooter = useCallback(() => {
    if (isMyTab || !isFetchingNextPage) return null;
    return (
      <View style={styles.loadMoreIndicator}>
        <ActivityIndicator color={COLORS.primary} size="small" />
        <Text style={styles.loadMoreText}>Loading more…</Text>
      </View>
    );
  }, [isMyTab, isFetchingNextPage]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>{isMyTab ? '📋' : '🏆'}</Text>
        <Text style={styles.emptyTitle}>
          {isMyTab
            ? 'No registrations yet'
            : searchQuery
            ? 'No results found'
            : 'No competitions yet'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {isMyTab
            ? 'Competitions you register for will appear here.'
            : searchQuery
            ? `No competitions match "${searchQuery}"`
            : 'Check back soon for new competitions!'}
        </Text>
        {searchQuery && !isMyTab ? (
          <TouchableOpacity
            style={styles.clearSearchBtn}
            onPress={handleSearchClear}
            accessibilityRole="button"
          >
            <Text style={styles.clearSearchText}>Clear Search</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }, [isLoading, isMyTab, searchQuery, handleSearchClear]);

  // ── Error state ───────────────────────────────────────────────────────────
  if (isError && competitions.length === 0) {
    return (
      <View style={[styles.centerScreen, { paddingTop: insets.top }]}>
        <Text style={styles.errorEmoji}>😕</Text>
        <Text style={styles.errorTitle}>Failed to load</Text>
        <Text style={styles.errorMsg}>Could not fetch competitions. Check your connection.</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={handleRefetch} accessibilityRole="button">
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hey, {user?.name?.split(' ')[0] ?? 'there'} 👋</Text>
          <Text style={styles.headerTitle}>Competitions</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => void logout()}
          accessibilityRole="button"
          accessibilityLabel="Logout"
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* ── Search bar (hidden on My Registrations tab) ──────────────────── */}
      {!isMyTab && (
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              ref={searchRef}
              style={styles.searchInput}
              placeholder="Search competitions…"
              placeholderTextColor={COLORS.textMuted}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Search competitions"
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={handleSearchClear}
                accessibilityLabel="Clear search"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* ── Filter tabs ─────────────────────────────────────────────────── */}
      <FlatList
        horizontal
        data={FILTER_TABS}
        keyExtractor={(t) => t.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item: tab }) => (
          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === tab.key && styles.filterTabActive,
              tab.key === 'mine' && styles.filterTabMine,
              tab.key === 'mine' && activeFilter === 'mine' && styles.filterTabMineActive,
            ]}
            onPress={() => handleFilterChange(tab.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: activeFilter === tab.key }}
            accessibilityLabel={`Filter: ${tab.label}`}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === tab.key && styles.filterTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* ── Count label ─────────────────────────────────────────────────── */}
      {!isLoading && (
        <Text style={styles.countLabel}>
          {isMyTab
            ? `${totalCount} registered competition${totalCount !== 1 ? 's' : ''}`
            : searchQuery
            ? `${totalCount} result${totalCount !== 1 ? 's' : ''} for "${searchQuery}"`
            : `${totalCount} competition${totalCount !== 1 ? 's' : ''}`}
        </Text>
      )}

      {/* ── List ────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            {isMyTab ? 'Loading your registrations…' : 'Loading competitions…'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={competitions}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefetch}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        />
      )}
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bgDark },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  greeting: { fontSize: FONT_SIZE.caption, color: COLORS.textMuted, marginBottom: 2 },
  headerTitle: { fontSize: FONT_SIZE.h1, fontWeight: '800', color: COLORS.textPrimary },
  logoutBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoutText: { fontSize: FONT_SIZE.caption, color: COLORS.textSecondary, fontWeight: '600' },

  searchRow: { paddingHorizontal: SPACING.md, marginBottom: SPACING.sm },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    height: 46,
    gap: SPACING.sm,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: FONT_SIZE.body, color: COLORS.textPrimary },
  clearIcon: { fontSize: 14, color: COLORS.textMuted, paddingHorizontal: SPACING.xs },

  filterRow: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm, gap: SPACING.xs },
  filterTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: 20,
    backgroundColor: COLORS.bgSurface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterTabMine: { borderColor: COLORS.success, backgroundColor: 'rgba(0,212,160,0.1)' },
  filterTabMineActive: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  filterTabText: { fontSize: FONT_SIZE.caption, fontWeight: '600', color: COLORS.textSecondary },
  filterTabTextActive: { color: COLORS.textPrimary },

  countLabel: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    fontSize: FONT_SIZE.caption,
    color: COLORS.textMuted,
  },

  listContent: { paddingTop: SPACING.xs, paddingBottom: SPACING.xl },

  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
  loadingText: { fontSize: FONT_SIZE.body, color: COLORS.textMuted },

  loadMoreIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  loadMoreText: { fontSize: FONT_SIZE.caption, color: COLORS.textMuted },

  emptyState: { alignItems: 'center', paddingTop: SPACING['3xl'], paddingHorizontal: SPACING.xl },
  emptyEmoji: { fontSize: 56, marginBottom: SPACING.md },
  emptyTitle: {
    fontSize: FONT_SIZE.h3,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  clearSearchBtn: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clearSearchText: { fontSize: FONT_SIZE.body, fontWeight: '600', color: COLORS.primary },

  centerScreen: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorEmoji: { fontSize: 56, marginBottom: SPACING.md },
  errorTitle: {
    fontSize: FONT_SIZE.h2,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  errorMsg: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm + 4,
    borderRadius: 12,
  },
  retryText: { fontSize: FONT_SIZE.bodyLg, fontWeight: '700', color: COLORS.textPrimary },
});

export default CompetitionsListScreen;
