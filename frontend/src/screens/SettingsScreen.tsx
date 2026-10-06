import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { COLORS, FONT_SIZE, SPACING } from '../utils/constants';
import { useAuthStore } from '../store/authStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const getInitials = (name: string): string =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const user   = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = (): void => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => void logout() },
      ]
    );
  };

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backText}>←  Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ══════════════════════════════════════════════════════════════
            PROFILE SECTION
        ══════════════════════════════════════════════════════════════ */}
        <View style={styles.profileCard}>
          {/* Avatar circle with initials */}
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user?.name ? getInitials(user.name) : '?'}
            </Text>
          </View>

          <Text style={styles.profileName}>{user?.name ?? 'User'}</Text>
          <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>

          {user?.createdAt ? (
            <Text style={styles.joinedText}>
              🗓  Joined{' '}
              {new Date(user.createdAt).toLocaleDateString('en-IN', {
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          ) : null}
        </View>

        {/* ══════════════════════════════════════════════════════════════
            ACCOUNT INFO
        ══════════════════════════════════════════════════════════════ */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.card}>
          <InfoRow icon="👤" label="Full Name"  value={user?.name ?? '—'} />
          <View style={styles.separator} />
          <InfoRow icon="✉️" label="Gmail"      value={user?.email ?? '—'} />
          <View style={styles.separator} />
          <InfoRow icon="🆔" label="User ID"    value={`…${user?._id.slice(-8) ?? '—'}`} />
        </View>

        {/* ══════════════════════════════════════════════════════════════
            APP INFO
        ══════════════════════════════════════════════════════════════ */}
        <Text style={styles.sectionLabel}>APP</Text>
        <View style={styles.card}>
          <InfoRow icon="📱" label="Version"  value="1.0.0" />
          <View style={styles.separator} />
          <InfoRow icon="🏢" label="Platform" value="Feedants" />
        </View>

        {/* ══════════════════════════════════════════════════════════════
            LOGOUT BUTTON — big, red, clearly visible
        ══════════════════════════════════════════════════════════════ */}
        <Text style={styles.sectionLabel}>ACCOUNT ACTIONS</Text>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Log out"
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: insets.bottom + SPACING.xl }} />
      </ScrollView>
    </View>
  );
};

// ── InfoRow ────────────────────────────────────────────────────────────────────
const InfoRow: React.FC<{ icon: string; label: string; value: string }> = ({
  icon,
  label,
  value,
}) => (
  <View style={rowStyles.row}>
    <Text style={rowStyles.icon}>{icon}</Text>
    <View style={rowStyles.texts}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={rowStyles.value} numberOfLines={1}>{value}</Text>
    </View>
  </View>
);

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  icon:   { fontSize: 22, width: 30, textAlign: 'center' },
  texts:  { flex: 1 },
  label:  { fontSize: FONT_SIZE.caption, color: COLORS.textMuted, marginBottom: 2 },
  value:  { fontSize: FONT_SIZE.body, color: COLORS.textPrimary, fontWeight: '600' },
});

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  flex:   { flex: 1, backgroundColor: COLORS.bgDark },
  scroll: { paddingHorizontal: SPACING.md, paddingTop: SPACING.lg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    paddingVertical: SPACING.xs,
  },
  backText: {
    fontSize: FONT_SIZE.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: FONT_SIZE.h3,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Profile card
  profileCard: {
    alignItems: 'center',
    backgroundColor: COLORS.bgSurface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderWidth: 3,
    borderColor: COLORS.primaryLight,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  profileName: {
    fontSize: FONT_SIZE.h3,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  joinedText: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },

  // Sections
  sectionLabel: {
    fontSize: FONT_SIZE.caption,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1.2,
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.bgSurface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 62,
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(255,71,87,0.14)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    paddingVertical: SPACING.md + 2,
    marginBottom: SPACING.lg,
  },
  logoutIcon: { fontSize: 22 },
  logoutText: {
    fontSize: FONT_SIZE.bodyLg,
    fontWeight: '700',
    color: COLORS.error,
    letterSpacing: 0.3,
  },
});

export default SettingsScreen;
