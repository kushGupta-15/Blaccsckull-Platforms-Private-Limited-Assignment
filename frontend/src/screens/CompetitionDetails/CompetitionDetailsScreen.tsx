import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
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
} from '../../hooks/useCompetition';

// ── Sub-components ────────────────────────────────────────────────────────────
import CompetitionBanner     from '../../components/CompetitionBanner';
import StatusBadge           from '../../components/StatusBadge';
import StatsRow              from '../../components/StatsRow';
import SpotsProgressBar      from '../../components/SpotsProgressBar';
import CountdownTimer        from '../../components/CountdownTimer';
import ParticipantsPreview   from '../../components/ParticipantsPreview';
import RulesSection          from '../../components/RulesSection';
import RegistrationButton    from '../../components/RegistrationButton';
import CompetitionDetailsSkeleton from '../../components/SkeletonLoader';
import Toast, { ToastType }  from '../../components/Toast';

// ── Types ─────────────────────────────────────────────────────────────────────
type Props = NativeStackScreenProps<RootStackParamList, 'CompetitionDetails'>;

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

// ── Screen ────────────────────────────────────────────────────────────────────
const CompetitionDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { competitionId } = route.params;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

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

  const registerMutation  = useRegister(competitionId);
  const withdrawMutation  = useWithdraw(competitionId);

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
        axiosErr.response?.data?.error ?? 'Registration failed. Please try again.';
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
        axiosErr.response?.data?.error ?? 'Withdrawal failed. Please try again.';
      showToast(msg, 'error');
    }
  }, [withdrawMutation, showToast]);

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
            onRefresh={() => void refetch()}
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
          <Text
            style={styles.title}
            accessibilityRole="header"
          >
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
              🗓  {formatDate(competition.startDate)} – {formatDate(competition.endDate)}
            </Text>
          </View>

          {/* Prize pool */}
          {competition.prizePool && competition.prizePool !== 'No prize' && (
            <View style={styles.prizeBox}>
              <Text style={styles.prizeLabel}>🏆  Prize Pool</Text>
              <Text style={styles.prizeValue}>{competition.prizePool}</Text>
            </View>
          )}
        </View>

        {/* ── Stats row ───────────────────────────────────────────────────── */}
        <StatsRow
          registeredCount={competition.registeredCount}
          totalSpots={competition.totalSpots}
          entryFee={competition.entryFee}
          status={competition.status}
          startDate={competition.startDate}
          endDate={competition.endDate}
        />

        {/* ── Spots progress bar ───────────────────────────────────────────── */}
        <SpotsProgressBar
          registeredCount={competition.registeredCount}
          totalSpots={competition.totalSpots}
        />

        {/* ── Countdown timer ──────────────────────────────────────────────── */}
        <CountdownTimer
          status={competition.status}
          startDate={competition.startDate}
          endDate={competition.endDate}
        />

        {/* ── Description ─────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>About</Text>
          <Text style={styles.description}>{displayedDesc}</Text>
          {isLongDesc && (
            <TouchableOpacity
              onPress={() => setDescExpanded((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={descExpanded ? 'Show less description' : 'Read more description'}
            >
              <Text style={styles.readMore}>
                {descExpanded ? 'Show less ▲' : 'Read more ▼'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Rules ───────────────────────────────────────────────────────── */}
        {competition.rules.length > 0 && (
          <View style={styles.section}>
            <RulesSection rules={competition.rules} />
          </View>
        )}

        {/* ── Participants ─────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Participants</Text>
          <ParticipantsPreview
            participants={participantsData?.items ?? []}
            total={competition.registeredCount}
          />
        </View>

        {/* Bottom padding so sticky button doesn't cover content */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Sticky registration button ────────────────────────────────────── */}
      <RegistrationButton
        competitionStatus={competition.status}
        userRegStatus={competition.userRegistrationStatus}
        onRegister={() => void handleRegister()}
        onWithdraw={() => void handleWithdraw()}
        loading={isMutating}
        isAuthenticated={isAuthenticated}
      />

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

  // ── Content ────────────────────────────────────────────────────────────────
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
    fontSize: FONT_SIZE.caption,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: FONT_SIZE.h1,
    fontWeight: '800',
    color: COLORS.textPrimary,
    lineHeight: 36,
    marginBottom: SPACING.sm,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  hostLabel: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textMuted,
  },
  hostName: {
    fontSize: FONT_SIZE.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  datesRow: {
    marginBottom: SPACING.sm,
  },
  dateItem: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textSecondary,
  },
  prizeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108,99,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs + 2,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(108,99,255,0.3)',
    gap: SPACING.sm,
  },
  prizeLabel: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  prizeValue: {
    flex: 1,
    fontSize: FONT_SIZE.body,
    color: COLORS.primaryLight,
    fontWeight: '700',
  },

  // ── Sections ───────────────────────────────────────────────────────────────
  section: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
  sectionHeading: {
    fontSize: FONT_SIZE.h3,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  readMore: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.body,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // ── Error state ────────────────────────────────────────────────────────────
  centerScreen: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorEmoji: {
    fontSize: 56,
    marginBottom: SPACING.md,
  },
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
  retryText: {
    fontSize: FONT_SIZE.bodyLg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  backLink: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textSecondary,
  },
});

export default CompetitionDetailsScreen;
