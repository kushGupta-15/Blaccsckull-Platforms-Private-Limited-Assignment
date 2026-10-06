import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CompetitionStatus } from '../types';
import { COLORS, FONT_SIZE, SPACING } from '../utils/constants';
import { formatDate } from '../utils/helpers';

type UserRegStatus = 'registered' | 'not_registered' | 'withdrawn' | undefined;

interface RegistrationButtonProps {
  competitionStatus: CompetitionStatus;
  userRegStatus: UserRegStatus;
  onRegister: () => void;
  onWithdraw: () => void;
  loading?: boolean;
  isAuthenticated: boolean;
}

interface ButtonConfig {
  label: string;
  subLabel?: string;
  disabled: boolean;
  action: 'register' | 'withdraw' | 'none';
  variant: 'primary' | 'success' | 'muted' | 'warning';
}

const getConfig = (
  competitionStatus: CompetitionStatus,
  userRegStatus: UserRegStatus,
  startDate?: string
): ButtonConfig => {
  // User is already registered and active
  if (userRegStatus === 'registered') {
    return {
      label: '✓  Registered',
      subLabel: 'Tap to withdraw',
      disabled: false,
      action: 'withdraw',
      variant: 'success',
    };
  }

  switch (competitionStatus) {
    case 'active':
      return {
        label: 'Register Now',
        disabled: false,
        action: 'register',
        variant: 'primary',
      };
    case 'upcoming':
      return {
        label: 'Not Open Yet',
        subLabel: startDate ? `Opens ${formatDate(startDate)}` : undefined,
        disabled: true,
        action: 'none',
        variant: 'warning',
      };
    case 'full':
      return {
        label: 'Competition Full',
        disabled: true,
        action: 'none',
        variant: 'muted',
      };
    case 'ended':
      return {
        label: 'Competition Ended',
        disabled: true,
        action: 'none',
        variant: 'muted',
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        disabled: true,
        action: 'none',
        variant: 'muted',
      };
    default:
      return {
        label: 'Register',
        disabled: false,
        action: 'register',
        variant: 'primary',
      };
  }
};

const VARIANT_COLORS: Record<string, [string, string]> = {
  primary: [COLORS.primary, COLORS.primaryLight],
  success: ['#00A87E', COLORS.success],
  warning: ['#CC9400', COLORS.warning],
  muted:   [COLORS.bgElevated, COLORS.bgElevated],
};

const RegistrationButton: React.FC<RegistrationButtonProps> = ({
  competitionStatus,
  userRegStatus,
  onRegister,
  onWithdraw,
  loading = false,
  isAuthenticated,
}) => {
  const config = getConfig(competitionStatus, userRegStatus);
  const isDisabled = config.disabled || loading || !isAuthenticated;
  const gradientColors = VARIANT_COLORS[config.variant] ?? VARIANT_COLORS.primary;

  const handlePress = (): void => {
    if (isDisabled) return;
    if (config.action === 'register') onRegister();
    else if (config.action === 'withdraw') onWithdraw();
  };

  const labelColor =
    config.variant === 'muted' ? COLORS.textMuted : COLORS.textPrimary;

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={0.85}
        accessibilityLabel={config.label}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        style={styles.touchable}
      >
        <LinearGradient
          colors={isDisabled && config.variant !== 'success' && config.variant !== 'warning'
            ? [COLORS.bgElevated, COLORS.bgElevated]
            : gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.textPrimary} size="small" />
          ) : (
            <View style={styles.content}>
              <Text style={[styles.label, { color: labelColor }]}>
                {config.label}
              </Text>
              {config.subLabel ? (
                <Text style={styles.subLabel}>{config.subLabel}</Text>
              ) : null}
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
      {!isAuthenticated && (
        <Text style={styles.authNote}>Sign in to register for this competition</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    paddingTop: SPACING.sm,
    backgroundColor: COLORS.bgDark,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  touchable: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  gradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  label: {
    fontSize: FONT_SIZE.bodyLg,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subLabel: {
    fontSize: FONT_SIZE.caption,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  authNote: {
    textAlign: 'center',
    fontSize: FONT_SIZE.caption,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
});

export default RegistrationButton;
