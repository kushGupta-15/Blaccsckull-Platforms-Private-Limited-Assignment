import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';

import { ISubmission, EvaluateSubmissionInput } from '../types';
import { COLORS, FONT_SIZE, SPACING } from '../utils/constants';
import { toggleUpvoteSubmission, evaluateSubmission } from '../api/competitions';

interface Props {
  submission: ISubmission;
  isHost?: boolean;
  onUpdated?: () => void;
}

const SubmissionCard: React.FC<Props> = ({
  submission,
  isHost = false,
  onUpdated,
}) => {
  const [upvoted, setUpvoted] = useState(submission.hasUpvoted ?? false);
  const [upvoteCount, setUpvoteCount] = useState(submission.upvoteCount ?? 0);
  const [upvoting, setUpvoting] = useState(false);

  // Host Evaluation state
  const [evaluating, setEvaluating] = useState(false);
  const [showEvalForm, setShowEvalForm] = useState(false);
  const [scoreInput, setScoreInput] = useState(
    submission.score ? String(submission.score) : ''
  );
  const [feedbackInput, setFeedbackInput] = useState(
    submission.feedback ?? ''
  );
  const [rankInput, setRankInput] = useState<1 | 2 | 3 | undefined>(
    submission.awardRank
  );

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
      Alert.alert('Error', 'Could not launch URL.');
    }
  };

  const handleUpvote = async (): Promise<void> => {
    if (upvoting) return;

    // Optimistic toggle
    const nextState = !upvoted;
    setUpvoted(nextState);
    setUpvoteCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      setUpvoting(true);
      const res = await toggleUpvoteSubmission(submission._id);
      setUpvoted(res.hasUpvoted);
      setUpvoteCount(res.upvoteCount);
    } catch {
      // Revert on failure
      setUpvoted(!nextState);
      setUpvoteCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
      Alert.alert('Authentication Required', 'Please log in to upvote projects.');
    } finally {
      setUpvoting(false);
    }
  };

  const handleSaveEvaluation = async (): Promise<void> => {
    try {
      setEvaluating(true);
      const payload: EvaluateSubmissionInput = {};

      if (scoreInput.trim()) {
        const parsed = Number(scoreInput);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
          payload.score = parsed;
        } else {
          Alert.alert('Invalid Score', 'Score must be a number between 0 and 100.');
          setEvaluating(false);
          return;
        }
      }

      if (feedbackInput.trim()) {
        payload.feedback = feedbackInput.trim();
      }

      if (rankInput) {
        payload.awardRank = rankInput;
        payload.isWinner = true;
      }

      await evaluateSubmission(submission._id, payload);
      Alert.alert('Success', 'Project evaluated successfully!');
      setShowEvalForm(false);
      onUpdated?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Evaluation failed';
      Alert.alert('Error', msg);
    } finally {
      setEvaluating(false);
    }
  };

  const getRankBadge = (rank?: number) => {
    switch (rank) {
      case 1:
        return { label: '🥇 1st Place Winner', color: '#F59E0B', bg: '#78350F' };
      case 2:
        return { label: '🥈 2nd Place Winner', color: '#CBD5E1', bg: '#334155' };
      case 3:
        return { label: '🥉 3rd Place Winner', color: '#D97706', bg: '#451A03' };
      default:
        return null;
    }
  };

  const rankBadge = getRankBadge(submission.awardRank);

  return (
    <View style={styles.card}>
      {/* Header: Author + Winner Badge */}
      <View style={styles.header}>
        <View style={styles.authorRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {submission.userId?.name ? submission.userId.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View>
            <Text style={styles.authorName}>
              {submission.userId?.name ?? 'Anonymous Participant'}
            </Text>
            <Text style={styles.authorEmail}>
              {submission.userId?.email ?? ''}
            </Text>
          </View>
        </View>

        {rankBadge && (
          <View style={[styles.rankTag, { backgroundColor: rankBadge.bg }]}>
            <Text style={[styles.rankTagText, { color: rankBadge.color }]}>
              {rankBadge.label}
            </Text>
          </View>
        )}
      </View>

      {/* Project Title */}
      <Text style={styles.title}>{submission.title}</Text>

      {/* Description */}
      <Text style={styles.description}>{submission.description}</Text>

      {/* Score & Feedback banner if evaluated */}
      {(submission.score !== undefined || submission.feedback) && (
        <View style={styles.feedbackBanner}>
          {submission.score !== undefined && (
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Organizer Score:</Text>
              <Text style={styles.scoreValue}>{submission.score} / 100 ⭐</Text>
            </View>
          )}
          {Boolean(submission.feedback) && (
            <Text style={styles.feedbackText}>
              💬 "{submission.feedback}"
            </Text>
          )}
        </View>
      )}

      {/* Action Buttons: Links & Upvote */}
      <View style={styles.actionsRow}>
        <View style={styles.linksGroup}>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => handleOpenLink(submission.repositoryUrl)}
          >
            <Text style={styles.linkButtonText}>🐙 Code Repo</Text>
          </TouchableOpacity>

          {Boolean(submission.demoUrl) && (
            <TouchableOpacity
              style={[styles.linkButton, styles.demoButton]}
              onPress={() => handleOpenLink(submission.demoUrl)}
            >
              <Text style={styles.linkButtonText}>🌐 Live Demo</Text>
            </TouchableOpacity>
          )}

          {Boolean(submission.mediaUrl) && (
            <TouchableOpacity
              style={[styles.linkButton, styles.mediaButton]}
              onPress={() => handleOpenLink(submission.mediaUrl)}
            >
              <Text style={styles.linkButtonText}>🎬 Video</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Upvote Pill */}
        <TouchableOpacity
          style={[styles.upvoteButton, upvoted && styles.upvoteButtonActive]}
          onPress={handleUpvote}
          disabled={upvoting}
        >
          <Text style={styles.upvoteIcon}>{upvoted ? '❤️' : '🤍'}</Text>
          <Text
            style={[
              styles.upvoteCountText,
              upvoted && styles.upvoteCountTextActive,
            ]}
          >
            {upvoteCount}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Host Evaluation Controls */}
      {isHost && (
        <View style={styles.hostSection}>
          <TouchableOpacity
            style={styles.hostEvalToggle}
            onPress={() => setShowEvalForm((prev) => !prev)}
          >
            <Text style={styles.hostEvalToggleText}>
              {showEvalForm ? 'Hide Evaluation Form ▴' : '⚙️ Host: Grade / Award Winner ▾'}
            </Text>
          </TouchableOpacity>

          {showEvalForm && (
            <View style={styles.evalForm}>
              <Text style={styles.evalFormTitle}>Judge this Submission</Text>

              {/* Score Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Score (0 - 100):</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 95"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  value={scoreInput}
                  onChangeText={setScoreInput}
                />
              </View>

              {/* Rank Selector */}
              <Text style={styles.inputLabel}>Podium Rank (Optional):</Text>
              <View style={styles.rankOptions}>
                {[1, 2, 3].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.rankOption,
                      rankInput === r && styles.rankOptionActive,
                    ]}
                    onPress={() =>
                      setRankInput(rankInput === r ? undefined : (r as 1 | 2 | 3))
                    }
                  >
                    <Text
                      style={[
                        styles.rankOptionText,
                        rankInput === r && styles.rankOptionTextActive,
                      ]}
                    >
                      {r === 1 ? '🥇 1st' : r === 2 ? '🥈 2nd' : '🥉 3rd'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Feedback Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Feedback / Review Notes:</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="Write constructive notes for this project..."
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  numberOfLines={3}
                  value={feedbackInput}
                  onChangeText={setFeedbackInput}
                />
              </View>

              <TouchableOpacity
                style={styles.saveEvalButton}
                onPress={handleSaveEvaluation}
                disabled={evaluating}
              >
                {evaluating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveEvalButtonText}>
                    Save Evaluation & Award
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FONT_SIZE.md,
  },
  authorName: {
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontSize: FONT_SIZE.sm,
  },
  authorEmail: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
  },
  rankTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rankTagText: {
    fontWeight: '700',
    fontSize: FONT_SIZE.xs,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  feedbackBanner: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: '#38BDF8',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  scoreLabel: {
    color: '#94A3B8',
    fontSize: FONT_SIZE.xs,
    marginRight: SPACING.xs,
  },
  scoreValue: {
    color: '#38BDF8',
    fontWeight: '700',
    fontSize: FONT_SIZE.sm,
  },
  feedbackText: {
    color: '#E2E8F0',
    fontSize: FONT_SIZE.xs,
    fontStyle: 'italic',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  linksGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  linkButton: {
    backgroundColor: '#334155',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: 6,
  },
  demoButton: {
    backgroundColor: '#0F766E',
  },
  mediaButton: {
    backgroundColor: '#4C1D95',
  },
  linkButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  upvoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#475569',
  },
  upvoteButtonActive: {
    backgroundColor: '#831843',
    borderColor: '#F43F5E',
  },
  upvoteIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  upvoteCountText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  upvoteCountTextActive: {
    color: '#FECDD3',
  },
  hostSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  hostEvalToggle: {
    paddingVertical: 4,
    alignItems: 'center',
  },
  hostEvalToggleText: {
    color: '#F59E0B',
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  evalForm: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: SPACING.sm,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  evalFormTitle: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.sm,
  },
  inputGroup: {
    marginBottom: SPACING.sm,
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#1E293B',
    color: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    fontSize: FONT_SIZE.sm,
    borderWidth: 1,
    borderColor: '#334155',
  },
  textarea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  rankOptions: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  rankOption: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  rankOptionActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  rankOptionText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  rankOptionTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  saveEvalButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  saveEvalButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FONT_SIZE.sm,
  },
});

export default SubmissionCard;
