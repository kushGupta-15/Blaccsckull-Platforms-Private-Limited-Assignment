import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { IUser } from '../types';
import { COLORS, FONT_SIZE, SPACING } from '../utils/constants';

interface ParticipantsPreviewProps {
  participants: Pick<IUser, '_id' | 'name' | 'avatar'>[];
  total: number;
}

const AVATAR_SIZE = 36;
const MAX_SHOW = 5;

const getInitials = (name: string): string =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

const AVATAR_COLORS = [
  COLORS.primary, COLORS.secondary, COLORS.success,
  COLORS.warning, COLORS.info,
];

const ParticipantsPreview: React.FC<ParticipantsPreviewProps> = ({
  participants,
  total,
}) => {
  const shown = participants.slice(0, MAX_SHOW);
  const overflow = total - shown.length;

  if (total === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No participants yet. Be the first!</Text>
      </View>
    );
  }

  return (
    <View style={styles.row} accessibilityLabel={`${total} participants`}>
      {shown.map((p, i) => {
        const bg = AVATAR_COLORS[i % AVATAR_COLORS.length];
        return (
          <View
            key={p._id}
            style={[styles.avatarWrap, { marginLeft: i === 0 ? 0 : -10, zIndex: MAX_SHOW - i }]}
            accessibilityLabel={p.name}
          >
            {p.avatar ? (
              <Image source={{ uri: p.avatar }} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: bg }]}>
                <Text style={styles.initials}>{getInitials(p.name)}</Text>
              </View>
            )}
          </View>
        );
      })}
      {overflow > 0 && (
        <View style={[styles.avatarWrap, styles.overflowBadge, { marginLeft: -10 }]}>
          <Text style={styles.overflowText}>+{overflow}</Text>
        </View>
      )}
      <Text style={styles.countLabel}>
        {total} participant{total !== 1 ? 's' : ''}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
  },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: COLORS.bgDark,
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  overflowBadge: {
    backgroundColor: COLORS.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  countLabel: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.body,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  empty: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
  },
  emptyText: {
    fontSize: FONT_SIZE.body,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
});

export default ParticipantsPreview;
