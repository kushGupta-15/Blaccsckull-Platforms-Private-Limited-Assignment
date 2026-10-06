import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AxiosError } from 'axios';

import { RootStackParamList, ApiError } from '../../types';
import { COLORS, FONT_SIZE, SPACING } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';
import { useAuthStore } from '../../store/authStore';
import {
  useCompetition,
  useParticipants,
  useRegister,
  useWithdraw,
  useSubmissions,
  useMySubmission,
  useWinners,
} from '../../hooks/useCompetition';

// ── Sub-components ────────────────────────────────────────────────────────────
import CompetitionBanner from '../../components/CompetitionBanner';
import StatusBadge from '../../components/StatusBadge';
import StatsRow from '../../components/StatsRow';
import SpotsProgressBar from '../../components/SpotsProgressBar';
import CountdownTimer from '../../components/CountdownTimer';
import ParticipantsPreview from '../../components/ParticipantsPreview';
import RulesSection from '../../components/RulesSection';
import RegistrationButton from '../../components/RegistrationButton';
import CompetitionDetailsSkeleton from '../../components/SkeletonLoader';
import Toast, { ToastType } from '../../components/Toast';
import SubmissionCard from '../../components/SubmissionCard';
import WinnersPodium from '../../components/WinnersPodium';

// ── Types ─────────────────────────────────────────────────────────────────────
type Props = NativeStackScreenProps<RootStackParamList, 'CompetitionDetails'>;

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

type TabType = 'overview' | 'submissions' | 'winners';

// ── Screen ────────────────────────────────────────────────────────────────────
const CompetitionDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { competitionId } = route.params;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const currentUser = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // ── Server state ────────────────────────────────────────────────────────────
  const {
    data: competition,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useCompetition(competitionId);

  const { data: participantsData } = useParticipants(competitionId, 6);

  const {
    data: submissionsData,
    isLoading: loadingSubmissions,
    refetch: refetchSubmissions,
  } = useSubmissions(competitionId);

  const {
    data: mySubmission,
    refetch: refetchMySubmission,
  } = useMySubmission(competitionId, isAuthenticated);

  const {
    data: winnersData,
    refetch: refetchWinners,
  } = useWinners(competitionId);

  const registerMutation = useRegister(competitionId);
  const withdrawMutation = useWithdraw(competitionId);

  const isHost = Boolean(
    currentUser &&
      competition?.host &&
      competition.host._id === currentUser._id
  );

  const isRegistered =
    competition?.userRegistrationStatus === 'registered';

  // ── Toast ───────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      setToast({ visible: true, message, type });
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast((t) => ({ ...t, visible: false }));
  }, []);

  // ── Description expand/collapse ─────────────────────────────────────────────
  const [descExpanded, setDescExpanded] = useState(false);
  const DESC_LIMIT = 180;

  // ── Registration handlers ───────────────────────────────────────────────────
  const handleRegister = useCallback(async () => {
    try {
      await registerMutation.mutateAsync();
      showToast('🎉 Successfully registered!', 'success');
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      const msg =
        axiosErr.response?.data?.error ??
        'Registration failed. Please try again.';
      showToast(msg, 'error');
    }
  }, [registerMutation, showToast]);

  const handleWithdraw = useCallback(async () => {
    try {
      await withdrawMutation.mutateAsync();
      showToast('Withdrawn from competition.', 'info');
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      const msg =
        axiosErr.response?.data?.error ??
        'Withdrawal failed. Please try again.';
      showToast(msg, 'error');
    }
  }, [withdrawMutation, showToast]);

  const handleRefreshAll = async (): Promise<void> => {
    await Promise.all([
      refetch(),
      refetchSubmissions(),
      refetchMySubmission(),
      refetchWinners(),
    ]);
  };

  const isMutating =
    registerMutation.isPending || withdrawMutation.isPending;

  // ── Loading state ───────────────────────────────────────────────────────────
  if (isLoading) {
    return <CompetitionDetailsSkeleton />;
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (isError || !competition) {
    const axiosErr = error as AxiosError<ApiError> | null;
    const errMsg =
      axiosErr?.response?.status === 404
        ? 'This competition could not be found.'
        : 'Something went wrong. Please check your connection and try again.';

    return (
      <View style={styles.centerScreen}>
        <Text style={styles.errorEmoji}>😕</Text>
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorMsg}>{errMsg}</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => void refetch()}
          accessibilityRole="button"
          accessibilityLabel="Retry loading competition"
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={{ marginTop: SPACING.sm }}
        >
          <Text style={styles.backLink}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Description logic ───────────────────────────────────────────────────────
  const isLongDesc = competition.description.length > DESC_LIMIT;
  const displayedDesc =
    isLongDesc && !descExpanded
      ? competition.description.slice(0, DESC_LIMIT) + '…'
      : competition.description;

  const totalSubmissions = submissionsData?.total ?? 0;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <View style={styles.flex}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void handleRefreshAll()}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* ── Banner ─────────────────────────────────────────────────────── */}
        <CompetitionBanner
          imageUrl={competition.bannerImage}
          onBack={() => navigation.goBack()}
        />

        {/* ── Main content ────────────────────────────────────────────────── */}
        <View style={styles.content}>
          {/* Status badge */}
          <View style={styles.badgeRow}>
            <StatusBadge status={competition.status} />
            <Text style={styles.category}>{competition.category}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title} accessibilityRole="header">
            {competition.title}
          </Text>

          {/* Host row */}
          <View style={styles.hostRow}>
            <Text style={styles.hostLabel}>Hosted by </Text>
            <Text style={styles.hostName}>{competition.host.name}</Text>
          </View>

          {/* Dates */}
          <View style={styles.datesRow}>
            <Text style={styles.dateItem}>
              🗓 {formatDate(competition.startDate)} –{' '}
              {formatDate(competition.endDate)}
            </Text>
          </View>

          {/* Prize pool */}
          {competition.prizePool && competition.prizePool !== 'No prize' && (
            <View style={styles.prizeBox}>
              <Text style={styles.prizeLabel}>🏆 Prize Pool</Text>
              <Text style={styles.prizeValue}>{competition.prizePool}</Text>
            </View>
          )}

          {/* Tab Selector */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[
                styles.tabItem,
                activeTab === 'overview' && styles.tabItemActive,
              ]}
              onPress={() => setActiveTab('overview')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'overview' && styles.tabTextActive,
                ]}
              >
                📌 Overview
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabItem,
                activeTab === 'submissions' && styles.tabItemActive,
              ]}
              onPress={() => setActiveTab('submissions')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'submissions' && styles.tabTextActive,
                ]}
              >
                🚀 Projects ({totalSubmissions})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabItem,
                activeTab === 'winners' && styles.tabItemActive,
              ]}
              onPress={() => setActiveTab('winners')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'winners' && styles.tabTextActive,
                ]}
              >
                🏆 Winners
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── TAB CONTENT ─────────────────────────────────────────────────── */}

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <View>
            {/* Quick banner if registered to encourage project submission */}
            {isRegistered && (
              <View style={styles.registeredBanner}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.regBannerTitle}>
                    {mySubmission ? '✅ Project Submitted!' : '💡 Ready to Build?'}
                  </Text>
                  <Text style={styles.regBannerSub}>
                    {mySubmission
                      ? `"${mySubmission.title}" is in review.`
                      : 'Submit your code repository & demo link to compete.'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.submitPill}
                  onPress={() =>
                    navigation.navigate('SubmitProject', {
                      competitionId,
                      competitionTitle: competition.title,
                      existingSubmission: mySubmission ?? undefined,
                    })
                  }
                >
                  <Text style={styles.submitPillText}>
                    {mySubmission ? 'Edit ➔' : 'Submit ➔'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Stats row */}
            <StatsRow
              registeredCount={competition.registeredCount}
              totalSpots={competition.totalSpots}
              entryFee={competition.entryFee}
              status={competition.status}
              startDate={competition.startDate}
              endDate={competition.endDate}
            />

            {/* Spots progress bar */}
            <SpotsProgressBar
              registeredCount={competition.registeredCount}
              totalSpots={competition.totalSpots}
            />

            {/* Countdown timer */}
            <CountdownTimer
              status={competition.status}
              startDate={competition.startDate}
              endDate={competition.endDate}
            />

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>About</Text>
              <Text style={styles.description}>{displayedDesc}</Text>
              {isLongDesc && (
                <TouchableOpacity
                  onPress={() => setDescExpanded((v) => !v)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    descExpanded
                      ? 'Show less description'
                      : 'Read more description'
                  }
                >
                  <Text style={styles.readMore}>
                    {descExpanded ? 'Show less ▲' : 'Read more ▼'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Rules */}
            {competition.rules.length > 0 && (
              <View style={styles.section}>
                <RulesSection rules={competition.rules} />
              </View>
            )}

            {/* Participants */}
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>Participants</Text>
              <ParticipantsPreview
                participants={participantsData?.items ?? []}
                total={competition.registeredCount}
              />
            </View>
          </View>
        )}

        {/* 2. SUBMISSIONS TAB */}
        {activeTab === 'submissions' && (
          <View style={styles.tabContentContainer}>
            {/* Call to action card */}
            <View style={styles.submissionCtaCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.submissionCtaTitle}>
                  {mySubmission
                    ? 'Your Project: ' + mySubmission.title
                    : isRegistered
                    ? 'Build & Submit Your Project'
                    : 'Projects Showcase'}
                </Text>
                <Text style={styles.submissionCtaText}>
                  {mySubmission
                    ? 'Status: ' + mySubmission.status.toUpperCase()
                    : isRegistered
                    ? 'Share your GitHub code repo and live demo to compete!'
                    : 'Register on the Overview tab to submit your project solution.'}
                </Text>
              </View>
              {isRegistered && (
                <TouchableOpacity
                  style={styles.ctaButton}
                  onPress={() =>
                    navigation.navigate('SubmitProject', {
                      competitionId,
                      competitionTitle: competition.title,
                      existingSubmission: mySubmission ?? undefined,
                    })
                  }
                >
                  <Text style={styles.ctaButtonText}>
                    {mySubmission ? 'Edit Project' : 'Submit Project 🚀'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Submissions list */}
            {loadingSubmissions ? (
              <ActivityIndicator
                size="large"
                color={COLORS.primary}
                style={{ marginVertical: SPACING.xl }}
              />
            ) : submissionsData?.items && submissionsData.items.length > 0 ? (
              submissionsData.items.map((sub) => (
                <SubmissionCard
                  key={sub._id}
                  submission={sub}
                  isHost={isHost}
                  onUpdated={() => {
                    void refetchSubmissions();
                    void refetchWinners();
                  }}
                />
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🚀</Text>
                <Text style={styles.emptyTitle}>No Submissions Yet</Text>
                <Text style={styles.emptySubtitle}>
                  {isRegistered
                    ? 'You are registered! Be the first pioneer to submit your project solution.'
                    : 'Submissions will appear here once participants start turning in their work.'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* 3. WINNERS TAB */}
        {activeTab === 'winners' && (
          <View style={styles.tabContentContainer}>
            <WinnersPodium winners={winnersData ?? []} />

            {winnersData && winnersData.length > 0 && (
              <View style={{ marginTop: SPACING.md }}>
                <Text style={styles.winnersListTitle}>
                  Awarded Projects ({winnersData.length})
                </Text>
                {winnersData.map((w) => (
                  <SubmissionCard
                    key={w._id}
                    submission={w}
                    isHost={isHost}
                    onUpdated={() => {
                      void refetchSubmissions();
                      void refetchWinners();
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Bottom padding so sticky button doesn't cover content */}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Sticky bottom actions ─────────────────────────────────────────── */}
      {activeTab === 'overview' ? (
        <RegistrationButton
          competitionStatus={competition.status}
          userRegStatus={competition.userRegistrationStatus}
          onRegister={() => void handleRegister()}
          onWithdraw={() => void handleWithdraw()}
          loading={isMutating}
          isAuthenticated={isAuthenticated}
        />
      ) : activeTab === 'submissions' && isRegistered ? (
        <View style={styles.stickyActionContainer}>
          <TouchableOpacity
            style={styles.stickySubmitBtn}
            onPress={() =>
              navigation.navigate('SubmitProject', {
                competitionId,
                competitionTitle: competition.title,
                existingSubmission: mySubmission ?? undefined,
              })
            }
          >
            <Text style={styles.stickySubmitBtnText}>
              {mySubmission ? '✏️ Edit My Submission' : '🚀 Submit Project'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* ── Toast notification ────────────────────────────────────────────── */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  scrollContent: {
    paddingBottom: SPACING.lg,
  },
  content: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  category: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 28,
    marginBottom: SPACING.xs,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  hostLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
  hostName: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  datesRow: {
    marginBottom: SPACING.sm,
  },
  dateItem: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  prizeBox: {
    backgroundColor: '#1E1B4B',
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#4338CA',
  },
  prizeLabel: {
    fontSize: FONT_SIZE.sm,
    color: '#C7D2FE',
    fontWeight: '600',
  },
  prizeValue: {
    fontSize: FONT_SIZE.md,
    color: '#FCD34D',
    fontWeight: '800',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 4,
    marginVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabItemActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tabContentContainer: {
    paddingHorizontal: SPACING.md,
  },
  registeredBanner: {
    backgroundColor: '#064E3B',
    borderRadius: 12,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#059669',
  },
  regBannerTitle: {
    color: '#A7F3D0',
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  regBannerSub: {
    color: '#D1FAE5',
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  submitPill: {
    backgroundColor: '#10B981',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: SPACING.sm,
  },
  submitPillText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  submissionCtaCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#4338CA',
  },
  submissionCtaTitle: {
    color: '#E0E7FF',
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  submissionCtaText: {
    color: '#C7D2FE',
    fontSize: FONT_SIZE.xs,
    lineHeight: 16,
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: SPACING.sm,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: SPACING.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  emptyIcon: {
    fontSize: 40,
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
  winnersListTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  section: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  sectionHeading: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  readMore: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  centerScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.bgDark,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  errorTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  errorMsg: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: FONT_SIZE.sm,
  },
  backLink: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
  },
  stickyActionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  stickySubmitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  stickySubmitBtnText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
});

export default CompetitionDetailsScreen;
