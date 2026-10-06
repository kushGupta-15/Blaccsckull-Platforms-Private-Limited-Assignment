import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ICompetition } from '../types';
import { COLORS, FONT_SIZE, SPACING } from '../utils/constants';
import { formatDate } from '../utils/helpers';
import StatusBadge from './StatusBadge';

interface CompetitionCardProps {
  competition: ICompetition;
  onPress: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - SPACING.md * 2;
const IMAGE_HEIGHT = 140;

const CompetitionCard: React.FC<CompetitionCardProps> = ({
  competition,
  onPress,
}) => {
  const spotsLeft = Math.max(0, competition.totalSpots - competition.registeredCount);
  const isFree = competition.entryFee === 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`${competition.title}. Status: ${competition.status}. ${spotsLeft} spots remaining.`}
    >
      {/* Banner image with gradient */}
      <View style={styles.imageContainer}>
        <Image
          source={
            competition.bannerImage
              ? { uri: competition.bannerImage }
              : require('../../assets/icon.png')
          }
          style={styles.image}
          resizeMode="cover"
          accessibilityLabel={`${competition.title} banner`}
        />
        <LinearGradient
          colors={['transparent', 'rgba(13,13,26,0.85)']}
          style={StyleSheet.absoluteFill}
          locations={[0.4, 1]}
        />
        {/* Prize badge top-right */}
        {competition.prizePool && competition.prizePool !== 'No prize' && (
          <View style={styles.prizeBadge}>
            <Text style={styles.prizeBadgeText}>🏆 Prize</Text>
          </View>
        )}
        {/* Free badge top-left */}
        {isFree && (
          <View style={styles.freeBadge}>
            <Text style={styles.freeBadgeText}>FREE</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.body}>
        {/* Status + category row */}
        <View style={styles.topRow}>
          <StatusBadge status={competition.status} />
          <Text style={styles.category} numberOfLines={1}>
            {competition.category}
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {competition.title}
        </Text>

        {/* Host */}
        <Text style={styles.host} numberOfLines={1}>
          by {competition.host?.name ?? 'Unknown'}
        </Text>

        {/* Footer row */}
        <View style={styles.footer}>
          {/* Spots */}
          <View style={styles.footerItem}>
            <Text style={styles.footerIcon}>👥</Text>
            <Text style={[
              styles.footerValue,
              spotsLeft === 0 && { color: COLORS.error },
              spotsLeft > 0 && spotsLeft <= competition.totalSpots * 0.2 && { color: COLORS.warning },
            ]}>
              {spotsLeft === 0 ? 'Full' : `${spotsLeft} left`}
            </Text>
          </View>

          {/* Date */}
          <View style={styles.footerItem}>
            <Text style={styles.footerIcon}>🗓</Text>
            <Text style={styles.footerValue}>
              {competition.status === 'upcoming'
                ? formatDate(competition.startDate)
                : formatDate(competition.endDate)}
            </Text>
          </View>

          {/* Entry fee */}
          <View style={styles.footerItem}>
            <Text style={styles.footerIcon}>💰</Text>
            <Text style={[styles.footerValue, isFree && { color: COLORS.success }]}>
              {isFree ? 'Free' : `₹${competition.entryFee}`}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    alignSelf: 'center',
    backgroundColor: COLORS.bgSurface,
    borderRadius: 18,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  imageContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
    backgroundColor: COLORS.bgElevated,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  prizeBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(255,184,0,0.9)',
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  prizeBadgeText: {
    fontSize: FONT_SIZE.caption,
    fontWeight: '700',
    color: '#1A1000',
  },
  freeBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: 'rgba(0,212,160,0.9)',
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  freeBadgeText: {
    fontSize: FONT_SIZE.caption,
    fontWeight: '800',
    color: '#001A14',
    letterSpacing: 0.5,
  },
  body: {
    padding: SPACING.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  category: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    maxWidth: '45%',
  },
  title: {
    fontSize: FONT_SIZE.h3,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 24,
    marginBottom: SPACING.xs,
  },
  host: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerIcon: {
    fontSize: 13,
  },
  footerValue: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});

export default CompetitionCard;
