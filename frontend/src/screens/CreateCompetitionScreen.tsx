import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import dayjs from 'dayjs';

import { RootStackParamList, CreateCompetitionInput } from '../types';
import { COLORS, FONT_SIZE, SPACING } from '../utils/constants';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import { showAlert } from '../utils/alert';
import {
  createCompetition,
  updateCompetition,
  fetchCompetition,
} from '../api/competitions';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateCompetition'>;

const CATEGORIES = [
  'Full-Stack',
  'Mobile App',
  'AI / ML',
  'Web3',
  'UI/UX Design',
  'Cloud & DevOps',
];

const PRESET_BANNERS = [
  {
    label: 'Code / IDE',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
  },
  {
    label: 'Hackathon',
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
  },
  {
    label: 'AI & Data',
    url: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800',
  },
  {
    label: 'Workspace',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
  },
];

const CreateCompetitionScreen: React.FC<Props> = ({ route, navigation }) => {
  const editingId = route.params?.competitionId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [bannerUrl, setBannerUrl] = useState(PRESET_BANNERS[0].url);
  const [totalSpots, setTotalSpots] = useState('50');
  const [entryFee, setEntryFee] = useState('0');
  const [prizePool, setPrizePool] = useState('₹50,000 + Tech Gadgets');

  // Dates
  const [startDateStr, setStartDateStr] = useState(
    dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm')
  );
  const [endDateStr, setEndDateStr] = useState(
    dayjs().add(5, 'day').format('YYYY-MM-DDTHH:mm')
  );

  // Dynamic Rules
  const [rules, setRules] = useState<string[]>([
    'Individual or teams up to 2 participants',
    'All code must be written during the competition window',
    'Open-source libraries and APIs are permitted',
  ]);
  const [newRuleInput, setNewRuleInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetchingExisting, setFetchingExisting] = useState(!!editingId);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Auto-fill template for rapid demonstration
  const handleAutofillDemoData = () => {
    setTitle('NextGen Full-Stack AI Hackathon');
    setDescription(
      'Build an end-to-end intelligent web and mobile solution using cutting-edge AI, clean software architecture, and polished UI design. Submissions will be evaluated by the community and organizers.'
    );
    setCategory('AI / ML');
    setTotalSpots('100');
    setEntryFee('0');
    setPrizePool('₹1,00,000 + Tech Swag & Certificate');
    setStartDateStr(dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm'));
    setEndDateStr(dayjs().add(7, 'day').format('YYYY-MM-DDTHH:mm'));
    setErrors({});
    setSubmitError(null);
  };

  // Fetch existing details if editing
  useEffect(() => {
    if (!editingId) return;

    const loadData = async () => {
      try {
        setFetchingExisting(true);
        const data = await fetchCompetition(editingId);
        setTitle(data.title);
        setDescription(data.description);
        setCategory(data.category);
        if (data.bannerImage) setBannerUrl(data.bannerImage);
        setTotalSpots(String(data.totalSpots));
        setEntryFee(String(data.entryFee));
        setPrizePool(data.prizePool);
        setStartDateStr(dayjs(data.startDate).format('YYYY-MM-DDTHH:mm'));
        setEndDateStr(dayjs(data.endDate).format('YYYY-MM-DDTHH:mm'));
        if (data.rules && data.rules.length > 0) setRules(data.rules);
      } catch (err: any) {
        showAlert(
          'Error',
          err.response?.data?.error || 'Failed to load competition details'
        );
        navigation.goBack();
      } finally {
        setFetchingExisting(false);
      }
    };

    void loadData();
  }, [editingId, navigation]);

  const handleAddRule = () => {
    if (!newRuleInput.trim()) return;
    setRules([...rules, newRuleInput.trim()]);
    setNewRuleInput('');
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleQuickTimeline = (startOffsetDays: number, durationDays: number) => {
    const s = dayjs().add(startOffsetDays, 'day');
    const e = s.add(durationDays, 'day');
    setStartDateStr(s.format('YYYY-MM-DDTHH:mm'));
    setEndDateStr(e.format('YYYY-MM-DDTHH:mm'));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters.';
    }
    if (!description.trim() || description.trim().length < 10) {
      errs.description = 'Description must be at least 10 characters.';
    }
    const spotsNum = parseInt(totalSpots, 10);
    if (isNaN(spotsNum) || spotsNum < 1) {
      errs.totalSpots = 'Total spots must be at least 1.';
    }
    const feeNum = parseFloat(entryFee);
    if (isNaN(feeNum) || feeNum < 0) {
      errs.entryFee = 'Entry fee cannot be negative.';
    }

    const sDate = new Date(startDateStr);
    const eDate = new Date(endDateStr);

    if (isNaN(sDate.getTime()) || isNaN(eDate.getTime())) {
      errs.dates = 'Invalid start or end date format.';
    } else if (eDate <= sDate) {
      errs.dates = 'End date must be after start date.';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      const firstMsg = Object.values(errs)[0];
      setSubmitError(firstMsg);
      showAlert('Validation Error', firstMsg);
      return false;
    }
    setSubmitError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    const spotsNum = parseInt(totalSpots, 10);
    const feeNum = parseFloat(entryFee);
    const sDate = new Date(startDateStr);
    const eDate = new Date(endDateStr);

    const payload: CreateCompetitionInput = {
      title: title.trim(),
      description: description.trim(),
      category,
      startDate: sDate.toISOString(),
      endDate: eDate.toISOString(),
      totalSpots: spotsNum,
      entryFee: feeNum,
      prizePool: prizePool.trim() || 'Certificate of Recognition',
      rules: rules.filter((r) => r.trim().length > 0),
      bannerImage: bannerUrl.trim() || undefined,
    };

    try {
      setLoading(true);
      setSubmitError(null);
      if (editingId) {
        await updateCompetition(editingId, payload);
        showAlert('Success', 'Competition updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        const created = await createCompetition(payload);
        showAlert('Success 🎉', 'Competition created and live!', [
          {
            text: 'View Competition',
            onPress: () =>
              navigation.replace('CompetitionDetails', {
                competitionId: created._id,
              }),
          },
          {
            text: 'Dashboard',
            onPress: () => navigation.replace('OrganizerDashboard'),
          },
        ]);
      }
    } catch (err: any) {
      let msg =
        err.response?.data?.error ||
        err.message ||
        'Failed to save competition. Please try again.';

      if (
        err.response?.status === 404 ||
        msg.toLowerCase().includes('route not found')
      ) {
        msg =
          'Route Not Found (404): The backend server is currently finishing its deployment with the new routes. Please make sure the latest commit is deployed on dashboard.render.com.';
      }

      setSubmitError(msg);
      showAlert('Publish Error', msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingExisting) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading event details...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>
              {editingId ? 'Edit Competition' : 'Create Competition'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {editingId
                ? 'Update competition guidelines and limits'
                : 'Host a new challenge for participants'}
            </Text>
          </View>
          {!editingId ? (
            <TouchableOpacity
              style={styles.autofillBtn}
              onPress={handleAutofillDemoData}
              activeOpacity={0.8}
            >
              <Text style={styles.autofillBtnText}>✨ Auto-Fill</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Section: Basic Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>1. Basic Information</Text>

          <FormInput
            label="Competition Title *"
            value={title}
            onChangeText={(t) => {
              setTitle(t);
              if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
            }}
            placeholder="e.g. NextGen AI Mobile Hackathon"
            error={errors.title}
          />

          {/* Category Chips */}
          <Text style={styles.inputLabel}>Category</Text>
          <View style={styles.chipsContainer}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  category === cat && styles.categoryChipActive,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    category === cat && styles.categoryChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <FormInput
            label="Description *"
            value={description}
            onChangeText={(d) => {
              setDescription(d);
              if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
            }}
            placeholder="Describe the challenge goals, deliverables, and judging criteria..."
            multiline
            numberOfLines={4}
            error={errors.description}
          />
        </View>

        {/* Section: Banner Image */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>2. Banner Image</Text>
          {bannerUrl ? (
            <Image source={{ uri: bannerUrl }} style={styles.previewBanner} />
          ) : null}

          <Text style={styles.subLabel}>Choose Preset or Enter Custom URL:</Text>
          <View style={styles.chipsContainer}>
            {PRESET_BANNERS.map((preset) => (
              <TouchableOpacity
                key={preset.label}
                style={[
                  styles.bannerPresetChip,
                  bannerUrl === preset.url && styles.categoryChipActive,
                ]}
                onPress={() => setBannerUrl(preset.url)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    bannerUrl === preset.url && styles.categoryChipTextActive,
                  ]}
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <FormInput
            label="Custom Banner Image URL"
            value={bannerUrl}
            onChangeText={setBannerUrl}
            placeholder="https://example.com/banner.jpg"
          />
        </View>

        {/* Section: Schedule */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>3. Timeline</Text>
          <Text style={styles.subLabel}>Quick Presets:</Text>
          <View style={styles.chipsContainer}>
            <TouchableOpacity
              style={styles.timelinePresetChip}
              onPress={() => handleQuickTimeline(0, 3)}
            >
              <Text style={styles.presetText}>⚡ Today (3 Days)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.timelinePresetChip}
              onPress={() => handleQuickTimeline(1, 7)}
            >
              <Text style={styles.presetText}>📅 In 1 Day (1 Week)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.timelinePresetChip}
              onPress={() => handleQuickTimeline(3, 14)}
            >
              <Text style={styles.presetText}>🚀 In 3 Days (2 Weeks)</Text>
            </TouchableOpacity>
          </View>

          <FormInput
            label="Start Date (YYYY-MM-DDTHH:mm) *"
            value={startDateStr}
            onChangeText={(s) => {
              setStartDateStr(s);
              if (errors.dates) setErrors((prev) => ({ ...prev, dates: '' }));
            }}
            placeholder="2026-10-10T10:00"
            error={errors.dates}
          />

          <FormInput
            label="End Date (YYYY-MM-DDTHH:mm) *"
            value={endDateStr}
            onChangeText={(e) => {
              setEndDateStr(e);
              if (errors.dates) setErrors((prev) => ({ ...prev, dates: '' }));
            }}
            placeholder="2026-10-17T18:00"
            error={errors.dates}
          />
        </View>

        {/* Section: Spots & Rewards */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>4. Capacity & Rewards</Text>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <FormInput
                label="Total Spots *"
                value={totalSpots}
                onChangeText={(s) => {
                  setTotalSpots(s);
                  if (errors.totalSpots) setErrors((prev) => ({ ...prev, totalSpots: '' }));
                }}
                keyboardType="numeric"
                placeholder="50"
                error={errors.totalSpots}
              />
            </View>
            <View style={styles.halfInput}>
              <FormInput
                label="Entry Fee (₹, 0 = Free)"
                value={entryFee}
                onChangeText={(f) => {
                  setEntryFee(f);
                  if (errors.entryFee) setErrors((prev) => ({ ...prev, entryFee: '' }));
                }}
                keyboardType="numeric"
                placeholder="0"
                error={errors.entryFee}
              />
            </View>
          </View>

          <FormInput
            label="Prize Pool"
            value={prizePool}
            onChangeText={setPrizePool}
            placeholder="e.g. ₹50,000 + Certificate"
          />
        </View>

        {/* Section: Rules */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>5. Rules & Guidelines</Text>

          {rules.map((rule, idx) => (
            <View key={idx} style={styles.ruleRow}>
              <Text style={styles.ruleBullet}>•</Text>
              <Text style={styles.ruleText}>{rule}</Text>
              <TouchableOpacity
                onPress={() => handleRemoveRule(idx)}
                style={styles.ruleDeleteBtn}
              >
                <Text style={styles.ruleDeleteText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.addRuleRow}>
            <View style={{ flex: 1 }}>
              <FormInput
                label=""
                value={newRuleInput}
                onChangeText={setNewRuleInput}
                placeholder="Add a new competition rule..."
              />
            </View>
            <TouchableOpacity
              style={styles.addRuleBtn}
              onPress={handleAddRule}
              activeOpacity={0.8}
            >
              <Text style={styles.addRuleBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          {submitError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>⚠️ {submitError}</Text>
            </View>
          ) : null}
          <PrimaryButton
            label={
              editingId
                ? 'Update Competition'
                : 'Publish Competition 🚀'
            }
            onPress={handleSubmit}
            loading={loading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.bgSurface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backButtonText: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: FONT_SIZE.h1,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: COLORS.bgSurface,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    fontSize: FONT_SIZE.h3,
    fontWeight: '700',
    color: COLORS.primaryLight,
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  subLabel: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: 20,
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  categoryChipText: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  bannerPresetChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: 8,
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timelinePresetChip: {
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs + 2,
    borderRadius: 8,
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetText: {
    color: COLORS.info,
    fontSize: FONT_SIZE.caption,
    fontWeight: '600',
  },
  previewBanner: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.bgElevated,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfInput: {
    flex: 1,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgElevated,
    padding: SPACING.sm + 2,
    borderRadius: 10,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ruleBullet: {
    color: COLORS.primaryLight,
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  ruleText: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.body,
  },
  ruleDeleteBtn: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  ruleDeleteText: {
    color: COLORS.error,
    fontWeight: 'bold',
    fontSize: 16,
  },
  addRuleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  addRuleBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addRuleBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FONT_SIZE.body,
  },
  submitContainer: {
    marginTop: SPACING.md,
  },
  autofillBtn: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  autofillBtnText: {
    color: COLORS.primaryLight,
    fontWeight: '700',
    fontSize: FONT_SIZE.caption,
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: SPACING.sm,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorBannerText: {
    color: '#FCA5A5',
    fontSize: FONT_SIZE.caption,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default CreateCompetitionScreen;
